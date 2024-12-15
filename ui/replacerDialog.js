import { parseWorkflow } from '../workflow/parser.js';
import { EXTENSION_NAME, settingsKey } from '../consts.js';
import { showReplacementRuleDialog } from './replacementRuleDialog.js';
import { currentWorkflowContent, currentWorkflowName, updateCurrentWorkflow } from '../workflow/workflows.js';
import { replaceButton } from './replaceButton.js';
import { addCustomPlaceholderToSD } from '../workflow/placeholders.js';

const t = SillyTavern.getContext().t;

/**
 * Replace an input value with a placeholder
 * @param id
 * @param name
 * @param nodeInput
 * @param event
 */
export function onInputReplaceClick(id, name, nodeInput, event) {
    const target = event.target;
    console.log(`[${EXTENSION_NAME}] Replace input`, target, id, name, nodeInput.suggested);

    try {
        updateCurrentWorkflow(id, name, nodeInput.suggested);

        const nodeBlock = target.closest('.nodes-list-block');
        const newNodesBlock = createNodesList();
        nodeBlock.replaceWith(newNodesBlock);
    } catch (error) {
        console.error('Failed to replace input:', error);
        toastr.error(error.message, 'Failed to replace input');
    }
}

export async function onAddCustomPlaceholder(event, inputName, inputValue) {
    console.log(`[${EXTENSION_NAME}] Add custom placeholder clicked`, event, 'this:', this);

    const slugify = (str) => str.toLowerCase().replace(/ /g, '_').replace(/[^a-z0-9_]/g, '');
    const placeholder = {
        find: slugify(inputName),
        replace: inputValue,
        custom: true,
    };

    console.log(`[${EXTENSION_NAME}] Add custom placeholder for input`, inputName, placeholder);
    addCustomPlaceholderToSD(placeholder);

    const nodeBlock = event.target.closest('.nodes-list-block');
    console.log(`[${EXTENSION_NAME}] Node block`, nodeBlock);
    const newNodesBlock = createNodesList();
    nodeBlock.replaceWith(newNodesBlock);
}

export async function onAddRuleClick(actionButton, nodeId, inputName) {
    console.log(`[${EXTENSION_NAME}] Add rule clicked`, actionButton, 'this:', this);

    const node = actionButton.closest('.node-card').nodeInfo;
    const workflowElement = document.getElementById('sd_comfy_workflow_editor_workflow');
    const workflowName = currentWorkflowName();

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
        settings.replacements.push(newRule);
        context.saveSettingsDebounced();

        // TODO: Replace input value with placeholder

        const nodeBlock = actionButton.closest('.nodes-list-block');
        const newNodesBlock = createNodesList();
        nodeBlock.replaceWith(newNodesBlock);
    }
}

/**
 * Create the row for one input of a Comfy node
 * @param nodeId
 * @param inputName
 * @param {NodeInputInfo} nodeInputInfo
 * @returns {HTMLDivElement}
 */
function createInputElement(nodeId, inputName, nodeInputInfo) {
    const inputRow = document.createElement('div');
    Object.assign(inputRow, { nodeInputInfo });

    inputRow.classList.add('input-row', 'flex-container', 'alignItemsCenter');

    const inputComfyName = document.createElement('code');
    inputComfyName.textContent = nodeInputInfo.name;
    inputComfyName.style.flexBasis = '30%';
    inputComfyName.classList.add('input-name', 'justifyLeft');

    const actionButton = replaceButton(nodeId, nodeInputInfo);
    actionButton.classList.add('justifyLeft');

    // const inputPlaceholder = document.createElement('code');
    // inputPlaceholder.textContent = nodeInputInfo.suggested;
    // inputPlaceholder.classList.add('input-placeholder', 'justifyLeft');

    const inputValue = document.createElement('span');
    inputValue.textContent = nodeInputInfo.value;
    inputValue.classList.add('input-value', 'overflow-hidden');

    // nameValue.append(inputName, inputPlaceholder, inputValue);
    inputRow.append(inputComfyName, actionButton, inputValue);
    return inputRow;
}

/**
 * Create an element
 * @param {NodeInfo} nodeInfo
 * @returns {HTMLDivElement}
 */
function createNodeElement(nodeInfo) {
    const nodeCard = document.createElement('div');
    nodeCard.classList.add('node-card');
    nodeCard.style.border = '1px solid var(--SmartThemeBorderColor)';
    nodeCard.style.borderRadius = '8px';
    nodeCard.style.padding = '10px';
    nodeCard.style.marginBottom = '10px';
    nodeCard.style.backgroundColor = 'var(--SmartThemeChatTintColor)';

    // Create header
    const header = document.createElement('div');
    header.classList.add('node-header');
    header.style.marginBottom = '10px';
    const title = document.createElement('h4');
    title.textContent = nodeInfo.title;
    title.classList.add('node-title');
    header.appendChild(title);

    if (nodeInfo.title !== nodeInfo.class_type) {
        const subtitle = document.createElement('i');
        subtitle.textContent = nodeInfo.class_type;
        subtitle.classList.add('node-subtitle');
        subtitle.style.fontSize = '0.8em';
        header.appendChild(subtitle);
    }

    // Create inputs container
    const inputsContainer = document.createElement('div');
    inputsContainer.classList.add('node-inputs');

    // Add each input
    Object.entries(nodeInfo.inputs).forEach(([name, nodeInput]) => {
        inputsContainer.appendChild(createInputElement(nodeInfo.id, name, nodeInput));
    });

    nodeCard.nodeInfo = nodeInfo;  // Store node info for later use
    nodeCard.append(header, inputsContainer);
    return nodeCard;
}

function createNodesList() {
    const workflowName = currentWorkflowName();
    const workflowJson = currentWorkflowContent();
    const nodes = parseWorkflow(workflowName, workflowJson);

    const nodesContainer = document.createElement('div');
    nodesContainer.classList.add('nodes-list-block');
    // const h4 = document.createElement('h4');
    // h4.textContent = 'Nodes';

    const nodesList = document.createElement('div');
    nodesList.classList.add('nodes-list');

    if (nodes.length === 0) {
        const noNodes = document.createElement('h4');
        noNodes.textContent = t`No nodes found`;
        const p = document.createElement('p');
        p.textContent = t`Is this a valid ComfyUI workflow saved in API mode?`;
        nodesList.append(noNodes, p);
    }
    const nodesForDisplay = nodes.filter(node => Object.keys(node.inputs).length > 0);
    nodesForDisplay.forEach(node => {
        nodesList.appendChild(createNodeElement(node));
    });
    nodesContainer.append(nodesList);
    return nodesContainer;
}

function createReplacerDialog() {
    const dialog = document.createElement('div');
    dialog.classList.add('comfier--replacer-dialog');
    const h3 = document.createElement('h3');
    h3.textContent = t`${EXTENSION_NAME}`;
    dialog.appendChild(h3);

    const nodesContainer = createNodesList();
    dialog.appendChild(nodesContainer);

    return dialog;
}



export { createReplacerDialog };
