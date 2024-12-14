import { parseWorkflow, replaceInputWithPlaceholder } from '../workflow/parser.js';
import { EXTENSION_NAME, settingsKey } from '../consts.js';
import { showReplacementRuleDialog } from './replacementRuleDialog.js';

const t = SillyTavern.getContext().t;

/**
 * Replace an input value with a placeholder
 * @param {HTMLButtonElement} btn
 * @param id
 * @param name
 * @param nodeInput
 */
function onInputReplaceClick(btn, id, name, nodeInput) {
    const target = btn;
    console.log(`[${EXTENSION_NAME}] Replace input`, id, name, nodeInput.placeholder);
    // Replace input value with placeholder
    try {
        const workflowElement = document.getElementById('sd_comfy_workflow_editor_workflow');
        const workflowJson = workflowElement?.value;
        workflowElement.value = replaceInputWithPlaceholder(workflowJson, id, name, nodeInput.placeholder);
        workflowElement.dispatchEvent(new Event('input'));
        console.log(`[${EXTENSION_NAME}]`, 'Workflow updated');
        target.disabled = true;
        target.classList.add('disabled');
        const icon = target.querySelector('i');
        icon.classList.remove('fa-square-caret-right');
        icon.classList.add('fa-check');
        nodeInput.value = `%${nodeInput.placeholder}%`;
        // update the input value in the UI
        const inputRow = target.closest('.input-row');
        const inputValue = inputRow.querySelector('.input-value');
        inputValue.textContent = nodeInput.value;

    } catch (error) {
        console.error('Failed to replace input:', error);
        toastr.error(error.message, 'Failed to replace input');
    }
}

async function onAddRuleClick(actionButton) {
    console.log(`[${EXTENSION_NAME}] Add rule clicked`, actionButton, 'this:', this);
    const inputRow = this.closest('.input-row');
    const nodeInputInfo = inputRow.nodeInputInfo;
    const inputName = nodeInputInfo.name;

    const node = this.closest('.node-item').nodeInfo;
    const workflowElement = document.getElementById('sd_comfy_workflow_editor_workflow');
    const workflowName = document.getElementById('sd_comfy_workflow_editor_name')?.textContent;

    console.log(`[${EXTENSION_NAME}] Add rule for input`, inputName, 'in node', node.title, 'workflow', workflowName, 'workflowElement:', workflowElement);

    const newRule = await showReplacementRuleDialog({
        workflowName,
        nodeTitle: node.title,
        nodeClass: node.class_type,
        inputName: inputName,
        placeholder: inputName,
        description: `${node.title} ${inputName}`,
    });

    if (newRule) {
        const context = SillyTavern.getContext();
        const settings = context.extensionSettings[settingsKey];
        const nodeId = inputRow.closest('.node-item').nodeInfo.id;
        settings.replacements.push(newRule);
        context.saveSettingsDebounced();

        // Update button state
        this.classList.remove('no-rule');
        this.classList.add('can-replace');
        this.textContent = 'Replace';
        nodeInputInfo.placeholder = newRule.placeholder;
        const inputPlaceholder = inputRow.querySelector('.input-placeholder');
        inputPlaceholder.textContent = newRule.placeholder;

        // Remove old handler and add new one for replacement
        this.removeEventListener('click', onAddRuleClick);
        this.addEventListener('click', () => {
            onInputReplaceClick(this, nodeId, inputName, nodeInputInfo);
        });
    }
}

/**
 * Create an input element
 * @param nodeId
 * @param inputName
 * @param {NodeInputInfo} nodeInputInfo
 * @returns {HTMLDivElement}
 */
function createInputElement(nodeId, inputName, nodeInputInfo) {
    const inputRow = document.createElement('div');
    Object.assign(inputRow, { nodeInputInfo });

    // , 'flex-container', 'gap10', 'alignItemsCenter'
    inputRow.classList.add('input-row', 'flex-container', 'alignItemsCenter');

    const actionButton = document.createElement('button');
    actionButton.classList.add('menu_button', 'menu_button_icon');

    if (nodeInputInfo.value === `%${nodeInputInfo.placeholder}%`) {
        actionButton.disabled = true;
        actionButton.classList.add('disabled');
        actionButton.textContent = 'Replaced';
    } else if (nodeInputInfo.placeholder === '') {
        actionButton.classList.add('no-rule');
        const icon = document.createElement('i');
        icon.classList.add('fas', 'fa-plus');
        actionButton.appendChild(icon);
        const text = document.createElement('span');
        text.textContent = 'Add rule';
        actionButton.appendChild(text);


        actionButton.addEventListener('click', onAddRuleClick);
    } else {
        actionButton.classList.add('can-replace');
        const icon = document.createElement('i');
        icon.classList.add('fas', 'fa-square-caret-right');
        actionButton.appendChild(icon);
        const text = document.createElement('code');
        text.title = t`Replace input value with placeholder: %${nodeInputInfo.placeholder}%`;
        text.textContent = nodeInputInfo.placeholder;
        actionButton.appendChild(text);
        actionButton.addEventListener('click', (e) => {
            onInputReplaceClick(actionButton, nodeId, inputName, nodeInputInfo);
        });
    }

    // Input name and value
    // const nameValue = document.createElement('div');
    // nameValue.classList.add('input-nvp', 'whitespacenowrap', 'overflowHidden');

    actionButton.style.flex = '0 0 25%';
    actionButton.classList.add('justifyLeft');

    const inputComfyName = document.createElement('code');
    inputComfyName.textContent = nodeInputInfo.name;
    inputComfyName.classList.add('input-name', 'flexBasis25p', 'justifyLeft');
    // inputName.style.flex = '0 0 20%';

    const inputPlaceholder = document.createElement('code');
    inputPlaceholder.textContent = nodeInputInfo.placeholder;
    inputPlaceholder.classList.add('input-placeholder', 'flexBasis25p', 'justifyLeft');
    // inputName.style.flex = '0 0 20%';

    const inputValue = document.createElement('span');
    inputValue.textContent = nodeInputInfo.value;
    inputValue.classList.add('input-value', 'overflow-hidden');

    // nameValue.append(inputName, inputPlaceholder, inputValue);
    inputRow.append(inputComfyName, actionButton, inputValue);
    return inputRow;
}

/**
 * Create an element
 * @param {NodeInfo} node
 * @returns {HTMLDivElement}
 */
function createNodeElement(node) {
    const nodeEl = document.createElement('div');
    //  flex-container flexFlowColumn flexGap10 alignItemsStart

    nodeEl.classList.add('node-item');

    // Create header
    const header = document.createElement('div');
    // , 'flex-container', 'gap10', 'alignItemsCenter'
    header.classList.add('node-header');
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
    h3.textContent = t`${EXTENSION_NAME}`;
    dialog.appendChild(h3);

    // Add nodes to the list
    const nodesContainer = createNodesList(nodes);
    dialog.appendChild(nodesContainer);

    return dialog;
}

export { createReplacerDialog };
