import { parseWorkflow, replaceInputWithPlaceholder, findExistingPlaceholders } from '../workflow/parser.js';

function createReplacerDialog(workflowJson) {
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
        const nodeEl = document.createElement('div');
        nodeEl.classList.add('node-item');
        nodeEl.innerHTML = `
            <div class="node-header">
                <strong>${node.title}</strong> (${node.class_type})
            </div>
            <div class="node-inputs">
                ${Object.entries(node.inputs)
                    .map(([name, value]) => `
                        <div class="input-row">
                            <span>${name}: ${value}</span>
                            <button class="menu_button" data-node="${node.id}" data-input="${name}">
                                Replace
                            </button>
                        </div>
                    `).join('')}
            </div>
        `;
        nodesContainer.appendChild(nodeEl);
    });

    // Add existing placeholders
    const placeholdersContainer = dialog.querySelector('.placeholders-container');
    existingPlaceholders.forEach(placeholder => {
        const placeholderEl = document.createElement('div');
        placeholderEl.classList.add('placeholder-item');
        placeholderEl.textContent = `%${placeholder}%`;
        placeholdersContainer.appendChild(placeholderEl);
    });

    return dialog;
}

export { createReplacerDialog };
