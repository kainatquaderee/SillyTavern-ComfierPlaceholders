// noinspection DuplicatedCode

import { settingsKey, EXTENSION_NAME } from '../consts.js';

function renderExtensionSettings() {
    const context = SillyTavern.getContext();
    const settingsContainer = document.getElementById(`${settingsKey}-container`) ?? document.getElementById('extensions_settings2');
    if (!settingsContainer) {
        return;
    }

    const inlineDrawer = document.createElement('div');
    inlineDrawer.classList.add('inline-drawer');
    settingsContainer.append(inlineDrawer);

    const inlineDrawerToggle = document.createElement('div');
    inlineDrawerToggle.classList.add('inline-drawer-toggle', 'inline-drawer-header');

    const extensionName = document.createElement('b');
    extensionName.textContent = context.t`${EXTENSION_NAME}`;

    const inlineDrawerIcon = document.createElement('div');
    inlineDrawerIcon.classList.add('inline-drawer-icon', 'fa-solid', 'fa-circle-chevron-down', 'down');

    inlineDrawerToggle.append(extensionName, inlineDrawerIcon);

    const inlineDrawerContent = document.createElement('div');
    inlineDrawerContent.classList.add('inline-drawer-content');

    inlineDrawer.append(inlineDrawerToggle, inlineDrawerContent);

    /** @type {SillyTavernComfierPlaceholdersSettings} */
    const settings = context.extensionSettings[settingsKey];

    // Enabled checkbox
    const enabledCheckboxLabel = document.createElement('label');
    enabledCheckboxLabel.classList.add('checkbox_label');
    enabledCheckboxLabel.htmlFor = `${settingsKey}-enabled`;
    const enabledCheckbox = document.createElement('input');
    enabledCheckbox.id = `${settingsKey}-enabled`;
    enabledCheckbox.type = 'checkbox';
    enabledCheckbox.checked = settings.enabled;
    enabledCheckbox.addEventListener('change', () => {
        settings.enabled = enabledCheckbox.checked;
        context.saveSettingsDebounced();
    });
    const enabledCheckboxText = document.createElement('span');
    enabledCheckboxText.textContent = context.t`Enabled`;
    enabledCheckboxLabel.append(enabledCheckbox, enabledCheckboxText);
    inlineDrawerContent.append(enabledCheckboxLabel);

    // Replacements table
    const replacementsContainer = document.createElement('div');
    replacementsContainer.classList.add('replacements-container');
    replacementsContainer.style.marginTop = '10px';

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

    // Add new replacement button
    const addButton = document.createElement('button');
    addButton.classList.add('menu_button');
    addButton.textContent = 'Add Replacement';
    addButton.style.marginBottom = '10px';
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

    replacementsContainer.appendChild(addButton);
    replacementsContainer.appendChild(table);
    inlineDrawerContent.appendChild(replacementsContainer);

    // Initial render
    renderReplacements();
}

export { renderExtensionSettings, settingsKey, EXTENSION_NAME };
