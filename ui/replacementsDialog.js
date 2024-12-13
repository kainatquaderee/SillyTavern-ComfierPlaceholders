import { settingsKey } from '../consts.js';

function createReplacementsList(settings, context) {
    const container = document.createElement('div');
    container.classList.add('replacements-list');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '10px';

    function renderReplacements() {
        container.innerHTML = '';
        settings.replacements.forEach((replacement, index) => {
            const card = document.createElement('div');
            card.classList.add('replacement-card');
            card.style.border = '1px solid var(--border-color)';
            card.style.borderRadius = '8px';
            card.style.padding = '10px';
            card.style.backgroundColor = 'var(--background-color2)';

            card.innerHTML = `
                <div style="display: grid; grid-template-columns: auto 1fr; gap: 8px; margin-bottom: 8px;">
                    <strong>Workflow:</strong> <span>${replacement.workflowName || '(any)'}</span>
                    <strong>Node Title:</strong> <span>${replacement.nodeTitle || '(any)'}</span>
                    <strong>Node Class:</strong> <span>${replacement.nodeClass || '(any)'}</span>
                    <strong>Input Name:</strong> <span>${replacement.inputName || '(any)'}</span>
                    <strong>Placeholder:</strong> <span>%${replacement.placeholder}%</span>
                    <strong>Description:</strong> <span>${replacement.description}</span>
                </div>
                <div style="text-align: right;">
                    <button class="menu_button" data-index="${index}">Remove</button>
                </div>
            `;

            container.appendChild(card);
        });

        // Add event listeners to remove buttons
        container.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', () => {
                const index = parseInt(button.dataset.index);
                settings.replacements.splice(index, 1);
                context.saveSettingsDebounced();
                renderReplacements();
            });
        });
    }

    renderReplacements();
    return { container, renderReplacements };
}

async function showReplacementsDialog() {
    const context = SillyTavern.getContext();
    const settings = context.extensionSettings[settingsKey];

    const dialog = document.createElement('div');
    dialog.classList.add('replacements-dialog');
    dialog.style.maxWidth = '800px';
    dialog.style.width = '100%';

    const header = document.createElement('div');
    header.style.marginBottom = '1em';
    header.innerHTML = '<h3>Manage Replacements</h3>';

    const addButton = document.createElement('button');
    addButton.classList.add('menu_button');
    addButton.textContent = 'Add Replacement';
    addButton.style.marginBottom = '1em';

    const { container, renderReplacements } = createReplacementsList(settings, context);

    addButton.style.alignSelf = 'flex-start';
    addButton.addEventListener('click', async () => {
        const form = document.createElement('div');
        form.innerHTML = `
            <div style="display: grid; gap: 10px; margin: 10px;">
                <label>Workflow Name (optional):<input type="text" id="workflowName"></label>
                <label>Node Title (optional):<input type="text" id="nodeTitle"></label>
                <label>Node Class (optional):<input type="text" id="nodeClass"></label>
                <label>Input Name (optional):<input type="text" id="inputName"></label>
                <label>Placeholder:<input type="text" id="placeholder" required></label>
                <label>Description:<input type="text" id="description" required></label>
            </div>
        `;

        const result = await context.callGenericPopup(form, context.POPUP_TYPE.CUSTOM);
        if (!result) return;

        const newReplacement = {
            workflowName: form.querySelector('#workflowName').value || null,
            nodeTitle: form.querySelector('#nodeTitle').value || null,
            nodeClass: form.querySelector('#nodeClass').value || null,
            inputName: form.querySelector('#inputName').value || null,
            placeholder: form.querySelector('#placeholder').value,
            description: form.querySelector('#description').value,
        };

        settings.replacements.push(newReplacement);
        context.saveSettingsDebounced();
        renderReplacements();
    });

    dialog.append(header, addButton, container);
    await context.callGenericPopup(dialog, context.POPUP_TYPE.TEXT, '', { wide: true, large: true, allowVerticalScrolling: true, okButton: 'Close' });
}

export { showReplacementsDialog };
