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

    // Manage replacements button
    const manageButton = document.createElement('button');
    manageButton.classList.add('menu_button');
    manageButton.textContent = 'Manage Replacements';
    manageButton.style.marginTop = '10px';
    manageButton.addEventListener('click', () => {
        import('./ruleManagerDialog.js').then(({ showReplacementRuleManagerDialog }) => {
            showReplacementRuleManagerDialog();
        });
    });
    inlineDrawerContent.appendChild(manageButton);

    // Add Manage Associations button
    const manageAssociationsButton = document.createElement('button');
    manageAssociationsButton.classList.add('menu_button');
    manageAssociationsButton.textContent = 'Manage Workflow Associations';
    manageAssociationsButton.style.marginTop = '10px';
    manageAssociationsButton.addEventListener('click', () => {
        import('./associationsManagerDialog.js').then(({ showAssociationsManagerDialog }) => {
            showAssociationsManagerDialog();
        });
    });
    inlineDrawerContent.appendChild(manageAssociationsButton);
}

export { renderExtensionSettings, settingsKey, EXTENSION_NAME };
