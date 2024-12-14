import { createReplacerDialog } from './replacerDialog.js';
import { showManagerDialog } from './managerDialog.js';
import { replaceAllPlaceholders } from '../workflow/parser.js';
import { currentWorkflowName, currentWorkflowContent } from '../workflow/workflows.js';
import { EXTENSION_NAME } from '../consts.js';

const t = SillyTavern.getContext().t;


async function handleReplacerButtonClick() {
    const context = SillyTavern.getContext();
    const workflowName = currentWorkflowName();
    const workflowJson = currentWorkflowContent();

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
        replacerSection.classList.add('sd_comfy_workflow_editor_replacer_section', 'flex-container', 'flexFlowColumn', 'alignItemsCenter');

        const replacerButton = document.createElement('button');
        replacerButton.classList.add('menu_button', 'menu_button_icon', 'whitespacenowrap');
        replacerButton.id = 'sd_comfy_workflow_editor_replacer_button';
        const icon = document.createElement('i');
        icon.classList.add('fas', 'fa-exchange-alt');
        replacerButton.appendChild(icon);
        const text = document.createElement('span');
        text.textContent = t`Replace...`;
        replacerButton.appendChild(text);
        replacerButton.addEventListener('click', handleReplacerButtonClick);

        const zapButton = document.createElement('button');
        zapButton.classList.add('menu_button', 'menu_button_icon', 'whitespacenowrap');
        zapButton.id = 'sd_comfy_workflow_editor_zap_button';
        const zapIcon = document.createElement('i');
        zapIcon.classList.add('fas', 'fa-bolt');
        zapButton.appendChild(zapIcon);
        const zapText = document.createElement('span');
        zapText.textContent = t`Replace all`;
        zapButton.appendChild(zapText);
        zapButton.addEventListener('click', handleZapButtonClick);

        const manageButton = document.createElement('button');
        manageButton.classList.add('menu_button');
        manageButton.id = 'sd_comfy_workflow_editor_manage_button';
        manageButton.textContent = 'Manage...';
        manageButton.addEventListener('click', async () => {
            try {
                await showManagerDialog();
            } catch (error) {
                console.error('Failed to show manager dialog:', error);
                toastr.error(error.message, 'Failed to show manager dialog');
            }
        });

        replacerSection.appendChild(zapButton);
        replacerSection.appendChild(replacerButton);
        replacerSection.appendChild(manageButton);

        container.appendChild(replacerSection);
    }, 100);
}

export { injectReplacerButton };
