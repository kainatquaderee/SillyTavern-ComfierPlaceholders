import { EXTENSION_NAME } from '../consts.js';
import { availableWorkflows, currentWorkflowContent } from '../workflow/workflows.js';

const t = SillyTavern.getContext().t;

async function showAssociationsManagerDialog() {
    const context = SillyTavern.getContext();
    
    const dialog = document.createElement('div');
    dialog.classList.add('associations-dialog');

    const header = document.createElement('div');
    header.style.marginBottom = '1em';
    const h3 = document.createElement('h3');
    h3.textContent = t`Workflow Associations`;
    header.appendChild(h3);
    dialog.appendChild(header);

    const associationsList = document.createElement('div');
    associationsList.classList.add('associations-list');
    
    // TODO: Implement list of workflow associations
    // TODO: Add buttons for managing associations
    
    dialog.appendChild(associationsList);

    await context.callGenericPopup(dialog, context.POPUP_TYPE.ALERT, t`Workflow Associations`);
}

export { showAssociationsManagerDialog };
