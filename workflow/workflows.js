import { EXTENSION_NAME } from '../consts.js';
const t = SillyTavern.getContext().t;

/**
 * Get the current workflow name
 * @returns {string}
 */
export function currentWorkflowName() {
    const name = document.getElementById('sd_comfy_workflow_editor_name')?.textContent;
    if (!name) {
        console.warn(`[${EXTENSION_NAME}]`, t`No workflow name found`);
    }
    return name;
}

/**
 * Get the current workflow JSON
 * @returns {*}
 */
export function currentWorkflowContent() {
    const workflowJSON = document.getElementById('sd_comfy_workflow_editor_workflow')?.value;
    if (!workflowJSON) {
        console.warn(`[${EXTENSION_NAME}]`, t`No workflow JSON found`);
    }
    return workflowJSON;
}

/**
 * Get the available workflows
 *
 * @returns {Record<string, string>} Workflow name and ID
 */
export function availableWorkflows() {
    const workflowSelect = document.getElementById('sd_comfy_workflow');
    if (!workflowSelect) {
        console.warn(`[${EXTENSION_NAME}]`, t`No workflow select found`);
        return {};
    }
    console.log(`[${EXTENSION_NAME}]`, t`Available workflows`, workflowSelect.options);
    const ret = Array.from(workflowSelect.options).reduce((acc, option) => {
        acc[option.value] = option.textContent;
        return acc;
    }   , {});
    console.log(`[${EXTENSION_NAME}]`, t`Available workflows`, ret);
    return ret;
}
