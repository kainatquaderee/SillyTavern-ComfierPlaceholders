import { createReplacerDialog } from './replacerDialog.js';
import { showManagerDialog } from './managerDialog.js';
import { replaceAllPlaceholders } from '../workflow/parser.js';
import { currentWorkflowName, currentWorkflowContent, changeWorkflow, saveWorkflowAs } from '../workflow/workflows.js';
import { EXTENSION_NAME, settingsKey } from '../consts.js';
import { iconButton } from './iconButton.js';

const t = SillyTavern.getContext().t;

export function delay(ms) {
    return new Promise((res) => setTimeout(res, ms));
}

async function handleReplacerButtonClick() {
    const context = SillyTavern.getContext();
    try {
        const dialog = createReplacerDialog();
        await context.callGenericPopup(dialog, context.POPUP_TYPE.TEXT, '', {
            wide: true,
            large: true,
            allowVerticalScrolling: true,
        });
    } catch (error) {
        console.error('Failed to parse workflow:', error);
        toastr.error(error.message, 'Failed to parse workflow');
    }
}

async function handleZapButtonClick() {
    // const context = SillyTavern.getContext();
    const workflowName = currentWorkflowName();
    const workflowElement = document.getElementById('sd_comfy_workflow_editor_workflow');
    const workflowJson = currentWorkflowContent();
    if (!workflowElement || !workflowJson) {
        console.warn(`[${EXTENSION_NAME}]`, t`No workflow found`);
        return;
    }

    try {
        workflowElement.value = replaceAllPlaceholders(workflowName, workflowJson);
        const event = new Event('input');
        workflowElement.dispatchEvent(event);
        console.log(`[${EXTENSION_NAME}]`, t`Replace all`, t`Workflow updated`);
    } catch (error) {
        console.error(`[${EXTENSION_NAME}]`, t`Replace all`, t`Failed to replace all`, error);
        toastr.error(error.message, t`Failed to replace all`);
    }
}

async function handleSaveAsClick() {
    const workflowName = currentWorkflowName();
    const context = SillyTavern.getContext();

    /** @type {SillyTavernComfierPlaceholdersSettings} */
    const settings = context.extensionSettings[settingsKey];
    const savedAs = settings.savedAs[workflowName] || { apiWorkflowName: workflowName, dstWorkflowName: '' };

    let name = savedAs.dstWorkflowName || workflowName.replace(/.json$/, '');
    name = await context.callGenericPopup('Workflow name:', context.POPUP_TYPE.INPUT, name);

    console.log(`[${EXTENSION_NAME}]`, 'Save as:', name, 'current:', workflowName, savedAs);

    if (!name) {
        toastr.info('No workflow name provided', 'Workflow not saved');
        return;
    }
    if (!String(name).toLowerCase().endsWith('.json')) {
        name += '.json';
    }
    if (name === workflowName) {
        toastr.info('New workflow name is the same as the current workflow', 'Workflow not saved');
        return;
    }

    try {
        const dstWorkflowName = await saveWorkflowAs(currentWorkflowContent(name), name);
        toastr.success(`Workflow saved as "${dstWorkflowName}"`, 'Workflow saved');
        savedAs.dstWorkflowName = dstWorkflowName;
        settings.savedAs[workflowName] = savedAs;
        context.saveSettingsDebounced();

        // repaint our who knows what
        // sd_comfy_workflow_editor_replacer_section
        const container = document.querySelector('.sd_comfy_workflow_editor_placeholder_container');
        if (!container) {
            console.warn('Could not find workflow editor container');
            return;
        }
        const replacerSection = renderReplacerControls();
        container.replaceChild(replacerSection, container.querySelector('.sd_comfy_workflow_editor_replacer_section'));

    } catch (error) {
        console.error('Failed to save workflow:', error);
        toastr.error(error.message, 'Failed to save workflow');
    }
}

function otherWorkflowName(workflowName) {
    const context = SillyTavern.getContext();
    const settings = context.extensionSettings[settingsKey];
    const savedAs = settings.savedAs[workflowName];
    if (savedAs?.apiWorkflowName === workflowName) {
        return savedAs.dstWorkflowName;
    }
    const dstSavedAs = Object.entries(settings.savedAs).find(([_, savedAs]) => savedAs.dstWorkflowName === workflowName);
    if (dstSavedAs) {
        return dstSavedAs[0];
    }
    return null;
}

async function onSwitchViewClick(e) {
    /** @type {HTMLElement} */
    const target = e.target;
    const context = SillyTavern.getContext();
    const settings = context.extensionSettings[settingsKey];
    const workflowName = currentWorkflowName();

    // forwards, is the currentWorkflowName() savedAs.apiWorkflowName
    // backwards, is the currentWorkflowName() savedAs.dstWorkflowName

    async function switcheroo(wfName) {
        if (!wfName) {
            console.warn(`[${EXTENSION_NAME}]`, 'switcheroo No workflow name provided');
            return;
        }
        console.log(`[${EXTENSION_NAME}]`, 'Switching to:', wfName, 'changing workflow:', wfName);
        await changeWorkflow(wfName);

        const cancelButton = target.closest('.popup').querySelector('.popup-button-cancel');
        console.log(`[${EXTENSION_NAME}]`, 'Switching to:', wfName, 'clicking cancel button:', cancelButton);
        cancelButton.click();

        console.log(`[${EXTENSION_NAME}]`, 'Switching to:', wfName, 'delay');

        await delay(500);

        console.log(`[${EXTENSION_NAME}]`, 'Switching to:', wfName, 'clicking replacer button');

        const replacerButton = document.getElementById('sd_comfy_open_workflow_editor');
        replacerButton.click();

        // maybe: extension_settings.sd.comfy_workflow
    }

    const apiSavedAs = settings.savedAs[workflowName];
    if (apiSavedAs?.apiWorkflowName === workflowName) {
        await switcheroo(apiSavedAs.dstWorkflowName);
        return;
    }
    const dstSavedAs = Object.entries(settings.savedAs).find(([_, savedAs]) => savedAs.dstWorkflowName === workflowName);
    if (dstSavedAs) {
        // switch to apiWorkflowName
        const apiWorkflowName = dstSavedAs[0];
        await switcheroo(apiWorkflowName);
        return;
    }
    console.warn(`[${EXTENSION_NAME}]`, 'Could not find a saved workflow to switch to');
}


function renderReplacerControls() {
    const replacerSection = document.createElement('div');
    replacerSection.classList.add('sd_comfy_workflow_editor_replacer_section', 'flex-container', 'flexFlowColumn', 'alignItemsCenter');
    const h4 = document.createElement('h4');
    h4.textContent = 'Replacer';

    const replacerButton = iconButton('Replace...', 'forward', {
        id: 'sd_comfy_workflow_editor_replacer_button',
        title: 'Replace...',
    });
    replacerButton.addEventListener('click', handleReplacerButtonClick);

    const zapButton = iconButton('Replace all', 'bolt', {
        id: 'sd_comfy_workflow_editor_zap_button',
        title: 'Replace all',
    });
    zapButton.addEventListener('click', handleZapButtonClick);

    const saveAsButton = iconButton('Save as...', 'save', {
        id: 'sd_comfy_workflow_editor_save_as_button',
        title: 'Save as...',
    });

    saveAsButton.addEventListener('click', handleSaveAsClick);

    const other = !!otherWorkflowName(currentWorkflowName());

    const switchViewButton = other ? iconButton('Switch', 'exchange', {
        title: 'Switch view',
    }) : null;
    if (switchViewButton) switchViewButton.addEventListener('click', onSwitchViewClick);

    const manageButton = iconButton('Manage...', 'list-check', {
        id: 'sd_comfy_workflow_editor_manage_button',
        title: 'Manage...',
    });
    manageButton.addEventListener('click', async () => {
        try {
            await showManagerDialog();
        } catch (error) {
            console.error('Failed to show manager dialog:', error);
            toastr.error(error.message, 'Failed to show manager dialog');
        }
    });

    const elems = [h4, zapButton, replacerButton, saveAsButton, switchViewButton, manageButton];
    elems.forEach(elem => {
        if (elem) replacerSection.appendChild(elem);
    });
    return replacerSection;
}

function injectReplacerButton() {
    // Wait a short moment for the popup to be fully created
    setTimeout(attachReplacerControls, 100);

    function attachReplacerControls() {
        const container = document.querySelector('.sd_comfy_workflow_editor_placeholder_container');
        if (!container) {
            console.warn('Could not find workflow editor container');
            return;
        }

        const replacerSection = renderReplacerControls();
        container.appendChild(replacerSection);
    }
}

export { injectReplacerButton };
