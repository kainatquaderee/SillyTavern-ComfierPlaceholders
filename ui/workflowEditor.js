import { createReplacerDialog } from './replacerDialog.js';
import { showManagerDialog } from './managerDialog.js';
import { replaceAllPlaceholders } from '../workflow/parser.js';
import { currentWorkflowName, currentWorkflowContent } from '../workflow/workflows.js';
import { EXTENSION_NAME } from '../consts.js';
import { ButtonType, iconButton } from './iconButton.js';

const t = SillyTavern.getContext().t;


async function handleReplacerButtonClick() {
    const context = SillyTavern.getContext();
    try {
        const dialog = createReplacerDialog();
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

        replacerSection.append(h4,  zapButton, replacerButton, manageButton);
        container.appendChild(replacerSection);
    }, 100);
}

export { injectReplacerButton };
