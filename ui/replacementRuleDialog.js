import { getCurrentPlaceholders } from '../workflow/placeholders.js';

/**
 * Show a dialog to add or edit a replacement rule
 * @param {Object} [existingRule] Optional existing rule to edit
 * @returns {Promise<ReplacementRule|null>} The new/edited rule, or null if cancelled
 */
async function showReplacementRuleDialog(existingRule = null) {
    const context = SillyTavern.getContext();
    const rulesPlaceholders = Object.keys(getCurrentPlaceholders());
    rulesPlaceholders.sort();

    const form = document.createElement('div');
    // form.innerHTML = `
    //     <div class="flex-container flexFlowColumn">
    //         <label>Workflow Name<input type="text" id="workflowName" class="text_pole optional"></label>
    //         <label>Node Title<input type="text" id="nodeTitle" class="text_pole optional"></label>
    //         <label>Node Class<input type="text" id="nodeClass" class="text_pole optional"></label>
    //         <label>Input Name<input type="text" id="inputName" class="text_pole"></label>
    //         <label>Placeholder:
    //             <div class="flex-container">
    //                 <select id="placeholderSelect" class="text_pole">
    //                     <option value="">-- New Placeholder --</option>
    //                     ${Array.from(rulesPlaceholders).map(p => `<option value="${p}">${p}</option>`).join('')}
    //                 </select>
    //                 <input type="text" id="placeholder" required class="text_pole" style="display: none;">
    //             </div>
    //         </label>
    //         <label>Description:<input type="text" id="description" required class="text_pole"></label>
    //     </div>
    // `;

    function textInput(inputId, labelText) {
        const label = document.createElement('label');
        label.textContent = labelText;
        const input = document.createElement('input');
        input.id = inputId;
        input.type = 'text';
        input.classList.add('text_pole', 'optional');
        label.appendChild(input);
        return label;
    }

    function selectInput(inputId, labelText, options) {
        const label = document.createElement('label');
        label.textContent = labelText;
        const select = document.createElement('select');
        select.id = inputId;
        select.classList.add('text_pole');
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            select.appendChild(optionElement);
        });
        label.appendChild(select);
        return label;
    }

    const workflowName = textInput('workflowName', 'Workflow Name');
    const nodeTitle = textInput('nodeTitle', 'Node Title');
    const nodeClass = textInput('nodeClass', 'Node Class');
    const inputName = textInput('inputName', 'Input Name');
    const placeholderDropdown = selectInput('placeholderSelect', 'Placeholder', ['-- New Placeholder --', ...rulesPlaceholders]);
    const placeholderTextfield = textInput('placeholder', 'Placeholder');
    placeholderTextfield.style.display = 'none';
    const description = textInput('description', 'Description');

    form.append(workflowName, nodeTitle, nodeClass, inputName, placeholderDropdown, placeholderTextfield, description);

    // Pre-fill form if editing existing rule
    if (existingRule) {
        form.querySelector('#workflowName').value = existingRule.workflowName || '';
        form.querySelector('#nodeTitle').value = existingRule.nodeTitle || '';
        form.querySelector('#nodeClass').value = existingRule.nodeClass || '';
        form.querySelector('#inputName').value = existingRule.inputName || '';

        const placeholderSelect = form.querySelector('#placeholderSelect');
        const placeholderInput = form.querySelector('#placeholder');

        if (rulesPlaceholders.includes(existingRule.placeholder)) {
            placeholderSelect.value = existingRule.placeholder;
        } else {
            placeholderSelect.value = '';
            placeholderInput.value = existingRule.placeholder;
            placeholderInput.style.display = 'block';
        }

        form.querySelector('#description').value = existingRule.description;
    }

    // Handle placeholder select/input toggle
    const placeholderSelect = form.querySelector('#placeholderSelect');
    const placeholderInput = form.querySelector('#placeholder');

    placeholderSelect.addEventListener('change', onPlaceholderSelectChange);

    function onPlaceholderSelectChange() {
        if (placeholderSelect.value === '') {
            placeholderInput.style.display = 'block';
            placeholderInput.focus();
        } else {
            placeholderInput.style.display = 'none';
        }
    }
    onPlaceholderSelectChange();

    const okButton = existingRule ? 'Save' : 'Add';

    const confirmation = await context.callGenericPopup(form, context.POPUP_TYPE.CONFIRM, 'Replacement Rule', { okButton });
    if (confirmation !== context.POPUP_RESULT.AFFIRMATIVE) {
        return null;
    }

    return {
        workflowName: form.querySelector('#workflowName').value || null,
        nodeTitle: form.querySelector('#nodeTitle').value || null,
        nodeClass: form.querySelector('#nodeClass').value || null,
        inputName: form.querySelector('#inputName').value || null,
        placeholder: placeholderSelect.value || placeholderInput.value,
        description: form.querySelector('#description').value,
    };
}

export { showReplacementRuleDialog };
