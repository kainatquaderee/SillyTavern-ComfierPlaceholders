import { parseWorkflow, replaceInputWithPlaceholder } from '../workflow/parser.js';
import { EXTENSION_NAME, settingsKey } from '../consts.js';
import { showReplacementRuleDialog } from './replacementRuleDialog.js';

function onInputReplaceClick(target, id, name, nodeInput) {
    console.log(`[${EXTENSION_NAME}] Replace input`, id, name, nodeInput.placeholder);
    // Replace input value with placeholder
    try {
        const workflowElement = document.getElementById('sd_comfy_workflow_editor_workflow');
        const workflowJson = workflowElement?.value;
        workflowElement.value = replaceInputWithPlaceholder(workflowJson, id, name, nodeInput.placeholder);
        const event = new Event('input');
        workflowElement.dispatchEvent(event);
        console.log(`[${EXTENSION_NAME}]`, 'Workflow updated');
        target.disabled = true;
        target.classList.add('disabled');
        target.textContent = 'Replaced';
    } catch (error) {
        console.error('Failed to replace input:', error);
        toastr.error(error.message, 'Failed to replace input');
    }
}

/**
 * Create an input element
 * @param id
 * @param name
 * @param {NodeInput} nodeInput
 * @returns {HTMLDivElement}
 */
function createInputElement(id, name, nodeInput) {
    const inputRow = document.createElement('div');
    inputRow.classList.add('input-row', 'flex-container', 'alignItemsCenter', 'flexNoWrap');

    const actionButton = document.createElement('button');
    actionButton.classList.add('menu_button', 'whitespacenowrap');

    if (nodeInput.value === `%${nodeInput.placeholder}%`) {
        actionButton.disabled = true;
        actionButton.classList.add('disabled');
        actionButton.textContent = 'Replaced';
    } else if (nodeInput.placeholder === '') {
        actionButton.classList.add('no-rule');
        actionButton.textContent = 'Add Rule';
        const addRuleHandler = async function() {
            const node = this.closest('.node-item').nodeInfo;
            const workflowElement = document.getElementById('sd_comfy_workflow_editor_workflow');
            const workflowName = workflowElement?.dataset?.workflowName || null;
            const newRule = await showReplacementRuleDialog({
                workflowName,
                nodeTitle: node.title,
                nodeClass: node.class_type,
                inputName: name,
                placeholder: '',
                description: '',
            });

            if (newRule) {
                const context = SillyTavern.getContext();
                const settings = context.extensionSettings[settingsKey];
                settings.replacements.push(newRule);
                context.saveSettingsDebounced();

                // Update button state
                actionButton.classList.remove('no-rule');
                actionButton.classList.add('can-replace');
                actionButton.textContent = 'Replace';
                nodeInput.placeholder = newRule.placeholder;

                // Remove old handler and add new one for replacement
                actionButton.removeEventListener('click', addRuleHandler);
                actionButton.addEventListener('click', (e) => {
                    onInputReplaceClick(e.target, id, name, nodeInput);
                });
            }
        });
    } else {
        actionButton.classList.add('can-replace');
        actionButton.textContent = 'Replace';
        actionButton.addEventListener('click', (e) => {
            onInputReplaceClick(e.target, id, name, nodeInput);
        });
    }

    // Input name and value
    const nameValue = document.createElement('div');
    nameValue.classList.add('input-name-value', 'whitespacenowrap', 'overflowHidden');

    const inputName = document.createElement('code');
    inputName.textContent = nodeInput.name;
    inputName.classList.add('input-name');

    const inputValue = document.createElement('span');
    inputValue.textContent = nodeInput.value;

    const inputPlaceholder = document.createElement('code');
    inputPlaceholder.textContent = nodeInput.placeholder;
    inputPlaceholder.classList.add('placeholder');

    nameValue.append(inputName, inputValue, inputPlaceholder);
    inputRow.append(actionButton, nameValue);
    return inputRow;
}

/**
 * Create an element
 * @param {NodeInfo} node
 * @returns {HTMLDivElement}
 */
function createNodeElement(node) {
    const nodeEl = document.createElement('div');
    nodeEl.classList.add('node-item', 'flex-container', 'flexFlowColumn', 'flexGap10', 'alignItemsStart');

    // Create header
    const header = document.createElement('div');
    header.classList.add('node-header', 'flex-container', 'gap10', 'alignItemsCenter');
    const title = document.createElement('h4');
    title.textContent = node.title;
    title.classList.add('node-title');
    header.appendChild(title);
    if (node.title !== node.class_type) {
        const subtitle = document.createElement('i');
        subtitle.textContent = node.class_type;
        subtitle.classList.add('node-subtitle');
        header.appendChild(subtitle);
    }

    // Create inputs container
    const inputsContainer = document.createElement('div');
    inputsContainer.classList.add('node-inputs');

    // Add each input
    console.log(`[${EXTENSION_NAME}] Node:`, node, 'Inputs:', node.inputs);
    Object.entries(node.inputs).forEach(([name, nodeInput]) => {
        inputsContainer.appendChild(createInputElement(node.id, name, nodeInput));
    });

    nodeEl.nodeInfo = node;  // Store node info for later use
    nodeEl.append(header, inputsContainer);
    return nodeEl;
}

function createNodesList(nodes) {
    const nodesContainer = document.createElement('div');
    nodesContainer.classList.add('nodes-list-block');
    const h4 = document.createElement('h4');
    h4.textContent = 'Nodes';
    const nodesList = document.createElement('div');
    nodesList.classList.add('nodes-list');

    console.log(`[${EXTENSION_NAME}] Nodes:`, nodes);
    nodes.filter(node => Object.keys(node.inputs).length > 0).forEach(node => {
        nodesList.appendChild(createNodeElement(node));
    });
    nodesContainer.append(h4, nodesList);
    return nodesContainer;
}

function createReplacerDialog(workflowName, workflowJson) {
    const nodes = parseWorkflow(workflowName, workflowJson);

    // Create dialog HTML
    const dialog = document.createElement('div');
    dialog.classList.add('comfier--replacer-dialog');
    const h3 = document.createElement('h3');
    h3.textContent = 'Comfier Placeholders';
    dialog.appendChild(h3);

    // Add nodes to the list
    const nodesContainer = createNodesList(nodes);
    dialog.appendChild(nodesContainer);

    return dialog;
}

export { createReplacerDialog };
