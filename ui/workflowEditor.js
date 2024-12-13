import { createReplacerDialog } from './replacerDialog.js';

async function handleReplacerButtonClick() {
    const context = SillyTavern.getContext();
    const workflowElement = document.getElementById('sd_comfy_workflow_editor_workflow');
    const workflowJson = workflowElement?.value;

    if (!workflowJson) {
        alert('No workflow found');
        return;
    }

    try {
        const dialog = createReplacerDialog(workflowJson);
        await context.callGenericPopup(dialog, context.POPUP_TYPE.TEXT, '', { wide: true, large: true });
    } catch (error) {
        console.error('Failed to parse workflow:', error);
        alert('Failed to parse workflow: ' + error.message);
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

        const button = document.createElement('button');
        button.className = 'menu_button';
        button.textContent = 'Open Replacer';
        button.style.marginTop = '10px';
        button.addEventListener('click', handleReplacerButtonClick);

        replacerSection.appendChild(button);
        container.appendChild(replacerSection);
    }, 100);
}

export { injectReplacerButton };
