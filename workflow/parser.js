/**
 * @typedef {Object} WorkflowNode
 * @property {Object} inputs - Node inputs
 * @property {string} class_type - Type of the node
 * @property {Object} _meta - Node metadata
 * @property {string} _meta.title - Node title
 */

/**
 * Parse a ComfyUI workflow and extract relevant node information
 * @param {string} workflowJson - The workflow JSON string
 * @returns {Object[]} Array of parsed nodes with their inputs
 */
function parseWorkflow(workflowJson) {
    const workflow = JSON.parse(workflowJson);
    const nodes = [];

    for (const [nodeId, node] of Object.entries(workflow)) {
        // We're only interested in nodes that have inputs
        if (!node.inputs) continue;

        const nodeInfo = {
            id: nodeId,
            title: node._meta?.title || 'Untitled',
            class_type: node.class_type,
            inputs: {}
        };

        // Only include non-node inputs (nodes are referenced by array [nodeId, outputIndex])
        for (const [inputName, inputValue] of Object.entries(node.inputs)) {
            if (!Array.isArray(inputValue)) {
                nodeInfo.inputs[inputName] = inputValue;
            }
        }

        nodes.push(nodeInfo);
    }

    return nodes;
}

/**
 * Replace a node's input value with a placeholder
 * @param {string} workflowJson - The workflow JSON string
 * @param {string} nodeId - The ID of the node to modify
 * @param {string} inputName - The name of the input to replace
 * @param {string} placeholder - The placeholder to use (without %%)
 * @returns {string} The modified workflow JSON
 */
function replaceInputWithPlaceholder(workflowJson, nodeId, inputName, placeholder) {
    const workflow = JSON.parse(workflowJson);
    if (!workflow[nodeId]?.inputs?.[inputName]) {
        throw new Error(`Input ${inputName} not found in node ${nodeId}`);
    }

    workflow[nodeId].inputs[inputName] = `%${placeholder}%`;
    return JSON.stringify(workflow, null, 4);
}

/**
 * Find all placeholders currently used in the workflow
 * @param {string} workflowJson - The workflow JSON string
 * @returns {Set<string>} Set of placeholders found (without %%)
 */
function findExistingPlaceholders(workflowJson) {
    const placeholders = new Set();
    const placeholderRegex = /%([^%]+)%/g;
    let match;

    while ((match = placeholderRegex.exec(workflowJson)) !== null) {
        placeholders.add(match[1]);
    }

    return placeholders;
}

export { parseWorkflow, replaceInputWithPlaceholder, findExistingPlaceholders };
