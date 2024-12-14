import { getPlaceholderOptions } from '../workflow/placeholders.js';
import { availableWorkflows } from '../workflow/workflows.js';
import { EXTENSION_NAME } from '../consts.js';

const t = SillyTavern.getContext().t;


function onPlaceholderSelectChange(form) {
    const placeholderSelect = form.querySelector('#placeholderSelect');
    const placeholderInput = form.querySelector('#placeholderName');
    const label = placeholderInput.closest('label');
    const selected = placeholderSelect.value;
    if (selected) {
        console.log(`[${EXTENSION_NAME}]`, 'Selected placeholder', selected, placeholderSelect, placeholderInput);
        placeholderInput.style.display = 'none';
        label.style.display = 'none';
    } else {
        console.log(`[${EXTENSION_NAME}]`, 'Custom placeholder', placeholderSelect, placeholderInput);
        placeholderInput.style.display = '';
        label.style.display = '';
    }
}

function onWorkflowSelectChange(form) {
    const workflowSelect = form.querySelector('#workflowSelect');
    const workflowName = form.querySelector('#workflowName');
    const label = workflowName.closest('label');
    const selected = workflowSelect.value;
    if (selected) {
        console.log(`[${EXTENSION_NAME}]`, 'Selected workflow', selected, workflowSelect, workflowName);
        workflowName.style.display = 'none';
        label.style.display = 'none';
    } else {
        console.log(`[${EXTENSION_NAME}]`, 'Custom workflow', workflowSelect, workflowName);
        workflowName.style.display = '';
        label.style.display = '';
    }
}

/**
 * Show a dialog to add or edit a replacement rule
 * @param {Object} [existingRule] Optional existing rule to edit
 * @returns {Promise<ReplacementRule|null>} The new/edited rule, or null if cancelled
 */
async function showReplacementRuleDialog(existingRule = null) {
    const context = SillyTavern.getContext();

    const form = document.createElement('div');
    form.classList.add('replacement-rule-dialog');

    function textInput(inputId, labelText) {
        const input = document.createElement('input');
        input.id = inputId;
        input.type = 'text';
        input.classList.add('text_pole', 'optional');
        const label = document.createElement('label');
        label.textContent = labelText;
        label.appendChild(input);
        return label;
    }

    /**
     * Create a select input
     * @param inputId
     * @param labelText
     * @param {Record<string,string>} options
     * @returns {(HTMLLabelElement|HTMLSelectElement)[]}
     */
    function selectInput(inputId, labelText, options) {
        const label = document.createElement('label');
        label.textContent = labelText;
        const select = document.createElement('select');
        select.id = inputId;
        select.classList.add('text_pole');
        for (const [value, text] of Object.entries(options)) {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = text;
            select.appendChild(option);
        }
        label.appendChild(select);
        return [label, select];
    }


    const workflowNames = availableWorkflows();
    const workflowOptions = { '': t`[Any workflow]`, ...workflowNames };

    const rulesPlaceholders = getPlaceholderOptions();
    const placeholderOptions = { '': t`[Custom]`, ...rulesPlaceholders };

    const [workflowDropdown, workflowSelect] = selectInput('workflowSelect', 'Workflow Name', workflowOptions);
    const workflowName = textInput('workflowName', 'Custom workflow name');
    const nodeTitle = textInput('nodeTitle', 'Node Title');
    const nodeClass = textInput('nodeClass', 'Node Class');
    const inputName = textInput('inputName', 'Input Name');
    const [placeholderDropdown, placeholderSelect] = selectInput('placeholderSelect', 'Placeholder', placeholderOptions);
    const placeholderTextfield = textInput('placeholderName', 'Custom placeholder');
    const description = textInput('description', 'Description');

    form.append(workflowDropdown, workflowName, nodeTitle, nodeClass, inputName, placeholderDropdown, placeholderTextfield, description);

    // Pre-fill form if editing existing rule
    if (existingRule) {
        form.querySelector('#workflowName').value = existingRule.workflowName || '';
        form.querySelector('#nodeTitle').value = existingRule.nodeTitle || '';
        form.querySelector('#nodeClass').value = existingRule.nodeClass || '';
        form.querySelector('#inputName').value = existingRule.inputName || '';
        form.querySelector('#description').value = existingRule.description;

        const placeholderInput = form.querySelector('input#placeholderName');

        if (existingRule.placeholder in placeholderSelect.options) {
            placeholderSelect.value = existingRule.placeholder;
        } else {
            placeholderInput.value = existingRule.placeholder;
            placeholderSelect.value = '';
        }

        if (existingRule.workflowName) {
            workflowSelect.value = existingRule.workflowName;
        } else {
            workflowSelect.value = '';
        }
    }

    placeholderSelect.addEventListener('change', () => onPlaceholderSelectChange(form));
    workflowSelect.addEventListener('change', () => onWorkflowSelectChange(form));

    onPlaceholderSelectChange(form);
    onWorkflowSelectChange(form);

    const okButton = existingRule ? t`Save` : t`Add Rule`;

    const confirmation = await context.callGenericPopup(form, context.POPUP_TYPE.CONFIRM, 'Replacement Rule', { okButton });
    if (confirmation !== context.POPUP_RESULT.AFFIRMATIVE) {
        return null;
    }

    const placeholderInput = placeholderTextfield.querySelector('input');

    return {
        workflowName: workflowSelect.value || workflowName.querySelector('input').value,
        nodeTitle: form.querySelector('#nodeTitle').value || null,
        nodeClass: form.querySelector('#nodeClass').value || null,
        inputName: form.querySelector('#inputName').value || null,
        placeholder: placeholderSelect.value || placeholderInput.value,
        description: form.querySelector('#description').value,
    };
}

export { showReplacementRuleDialog };
