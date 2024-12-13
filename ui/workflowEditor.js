import { createReplacerDialog } from './replacerDialog.js';
import { replaceAllPlaceholders } from '../workflow/parser.js';
import { EXTENSION_NAME } from '../consts.js';

async function handleReplacerButtonClick() {
    const context = SillyTavern.getContext();
    const workflowElement = document.getElementById('sd_comfy_workflow_editor_workflow');
    const workflowName = document.getElementById('sd_comfy_workflow_editor_name')?.value;
    const workflowJson = workflowElement?.value;

    if (!workflowJson) {
        alert('No workflow found');
        return;
    }

    try {
        const dialog = createReplacerDialog(workflowName, workflowJson);
        await context.callGenericPopup(dialog, context.POPUP_TYPE.TEXT, '', { wide: true, large: true, allowVerticalScrolling: true });
    } catch (error) {
        console.error('Failed to parse workflow:', error);
        toastr.error(error.message, 'Failed to parse workflow');
    }
}

async function handleZapButtonClick() {
    // const context = SillyTavern.getContext();
    const workflowName = document.getElementById('sd_comfy_workflow_editor_name')?.value;
    const workflowElement = document.getElementById('sd_comfy_workflow_editor_workflow');
    const workflowJson = workflowElement?.value;

    if (!workflowJson) {
        alert('No workflow found');
        return;
    }

    try {
        workflowElement.value = replaceAllPlaceholders(workflowName, workflowJson);
        const event = new Event('input');
        workflowElement.dispatchEvent(event);
        console.log(`[${EXTENSION_NAME}]`, 'Workflow updated');
    } catch (error) {
        console.error('Failed to parse workflow:', error);
        toastr.error(error.message, 'Failed to parse workflow');
    }
}

function injectReplacerButton() {
    // Wait a short moment for the popup to be fully created
    setTimeout(() => {
        const container = document.querySelector('.sd_comfy_workflow_editor_placeholder_container');
        if (!container) {
            console.warn('Could not find workflow editor container');
            return;
        }

        const replacerSection = document.createElement('div');
        replacerSection.classList.add('sd_comfy_workflow_editor_replacer_section', 'flex-container', 'justifyCenter', 'alignItemsCenter');

        const replacerButton = document.createElement('button');
        replacerButton.classList.add('menu_button', 'whitespacenowrap');
        replacerButton.id = 'sd_comfy_workflow_editor_replacer_button';
        replacerButton.textContent = 'Open Replacer';
        replacerButton.style.marginTop = '10px';
        replacerButton.addEventListener('click', handleReplacerButtonClick);

        const zapButton = document.createElement('button');
        zapButton.classList.add('menu_button', 'whitespacenowrap');
        zapButton.id = 'sd_comfy_workflow_editor_zap_button';
        zapButton.textContent = 'Replace all';
        zapButton.style.marginTop = '10px';
        zapButton.addEventListener('click', handleZapButtonClick);

        replacerSection.appendChild(replacerButton);
        replacerSection.appendChild(zapButton);
        container.appendChild(replacerSection);
    }, 100);
}

export { injectReplacerButton };
