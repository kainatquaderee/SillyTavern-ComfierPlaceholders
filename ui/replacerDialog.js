import { parseWorkflow, findExistingPlaceholders, replaceInputWithPlaceholder } from '../workflow/parser.js';

function createNodeElement(node) {
    const nodeEl = document.createElement('div');
    nodeEl.classList.add('node-item');
    nodeEl.innerHTML = `
        <div class="node-header">
            <strong>${node.title}</strong> (${node.class_type})
        </div>
        <div class="node-inputs">
            ${Object.entries(node.inputs).map(([name, value]) => `
                    <div class="input-row flex-container justifySpaceBetween alignItemsCenter flexNoWrap">
                      <div class="input-name-value whitespacenowrap overflowHidden">
                        <code>${name}</code>: <span>${value}</span>
                      </div>
                        <div class="menu_button" data-node="${node.id}" data-input="${name}">
                            Replace
                        </div>
                    </div>
                `).join('')}
        </div>
    `;
    return nodeEl;
}

async function handleReplace(button, workflowJson, dialog, onUpdate) {
    const nodeId = button.dataset.node;
    const inputName = button.dataset.input;

    const placeholder = await SillyTavern.getContext().callGenericPopup('Enter a placeholder', SillyTavern.getContext().POPUP_TYPE.INPUT, '');

    if (!placeholder) return;

    try {
        const updatedWorkflow = replaceInputWithPlaceholder(
            workflowJson,
            nodeId,
            inputName,
            placeholder.trim(),
        );

        // Update the dialog contents while preserving event handlers
        const newDialog = createReplacerDialog(updatedWorkflow, onUpdate);

        // Replace content while preserving structure
        dialog.querySelector('.nodes-container').innerHTML = newDialog.querySelector('.nodes-container').innerHTML;
        dialog.querySelector('.placeholders-container').innerHTML = newDialog.querySelector('.placeholders-container').innerHTML;

        // Reattach event handlers to new buttons
        dialog.querySelectorAll('.input-row button').forEach(button => {
            button.addEventListener('click', () => handleReplace(button, updatedWorkflow, dialog, onUpdate));
        });

        // Call the update callback
        if (onUpdate) {
            onUpdate(updatedWorkflow);
        }
    } catch (error) {
        console.error('Failed to replace input:', error);
        alert('Failed to replace input: ' + error.message);
    }
}

function createReplacerDialog(workflowJson, onUpdate) {
    const nodes = parseWorkflow(workflowJson);
    const existingPlaceholders = findExistingPlaceholders(workflowJson);

    // Create dialog HTML
    const dialog = document.createElement('div');
    dialog.classList.add('replacer-dialog');
    dialog.innerHTML = `
        <div class="replacer-content">
            <div class="nodes-list">
                <h4>Nodes</h4>
                <div class="nodes-container"></div>
            </div>
            <div class="placeholders-list">
                <h4>Current Placeholders</h4>
                <div class="placeholders-container"></div>
            </div>
        </div>
    `;

    // Add nodes to the list
    const nodesContainer = dialog.querySelector('.nodes-container');
    nodes.forEach(node => {
        nodesContainer.appendChild(createNodeElement(node));
    });

    // Add existing placeholders
    const placeholdersContainer = dialog.querySelector('.placeholders-container');
    existingPlaceholders.forEach(placeholder => {
        const placeholderEl = document.createElement('div');
        placeholderEl.classList.add('placeholder-item');
        placeholderEl.textContent = `%${placeholder}%`;
        placeholdersContainer.appendChild(placeholderEl);
    });

    // Add click handlers for Replace buttons
    dialog.querySelectorAll('.input-row button').forEach(button => {
        button.addEventListener('click', () => handleReplace(button, workflowJson, dialog, onUpdate));
    });

    return dialog;
}

export { createReplacerDialog };
