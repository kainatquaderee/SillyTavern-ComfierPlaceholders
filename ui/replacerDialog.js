import { parseWorkflow, findExistingPlaceholders, replaceInputWithPlaceholder } from '../workflow/parser.js';

function createNodeElement(node) {
    const nodeEl = document.createElement('div');
    nodeEl.classList.add('node-item');

    // Create header
    const header = document.createElement('div');
    header.classList.add('node-header');
    header.innerHTML = `<strong>${node.title}</strong> (${node.class_type})`;

    // Create inputs container
    const inputsContainer = document.createElement('div');
    inputsContainer.classList.add('node-inputs');

    // Add each input
    Object.entries(node.inputs).forEach(([name, value]) => {
        const inputRow = document.createElement('div');
        inputRow.classList.add('input-row', 'flex-container', 'justifySpaceBetween', 'alignItemsCenter', 'flexNoWrap');

        // Input name and value
        const nameValue = document.createElement('div');
        nameValue.classList.add('input-name-value', 'whitespacenowrap', 'overflowHidden');
        nameValue.innerHTML = `<code>${name}</code>: <span>${value}</span>`;

        inputRow.append(nameValue);
        inputsContainer.appendChild(inputRow);
    });

    nodeEl.append(header, inputsContainer);
    return nodeEl;
}

function createNodesList(nodes) {
    const nodesContainer = document.createElement('div');
    nodesContainer.classList.add('nodes-container');
    nodes.forEach(node => {
        nodesContainer.appendChild(createNodeElement(node));
    });
    return nodesContainer;
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
            </div>
            <div class="placeholders-list">
                <h4>Current Placeholders</h4>
                <div class="placeholders-container"></div>
            </div>
        </div>
    `;

    // Add nodes to the list
    const nodesContainer = createNodesList(nodes);
    dialog.querySelector('.nodes-list').appendChild(nodesContainer);

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
