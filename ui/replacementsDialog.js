import { settingsKey } from '../consts.js';

function createReplacementsTable(settings, context) {
    const table = document.createElement('table');
    table.classList.add('replacements-table');
    table.style.width = '100%';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Workflow</th>
                <th>Node Title</th>
                <th>Node Class</th>
                <th>Input Name</th>
                <th>Placeholder</th>
                <th>Description</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;

    const tbody = table.querySelector('tbody');

    function renderReplacements() {
        tbody.innerHTML = '';
        settings.replacements.forEach((replacement, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${replacement.workflowName || '(any)'}</td>
                <td>${replacement.nodeTitle || '(any)'}</td>
                <td>${replacement.nodeClass || '(any)'}</td>
                <td>${replacement.inputName || '(any)'}</td>
                <td>%${replacement.placeholder}%</td>
                <td>${replacement.description}</td>
                <td>
                    <button class="menu_button" data-index="${index}">Remove</button>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Add event listeners to remove buttons
        tbody.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', () => {
                const index = parseInt(button.dataset.index);
                settings.replacements.splice(index, 1);
                context.saveSettingsDebounced();
                renderReplacements();
            });
        });
    }

    renderReplacements();
    return { table, renderReplacements };
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

    const { table, renderReplacements } = createReplacementsTable(settings, context);

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

    dialog.append(header, addButton, table);
    await context.callGenericPopup(dialog, context.POPUP_TYPE.TEXT, '', { wide: true, large: true, allowVerticalScrolling: true, okButton: 'Close' });
}

export { showReplacementsDialog };
