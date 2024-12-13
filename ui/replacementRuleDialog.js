/**
 * Show a dialog to add or edit a replacement rule
 * @param {Object} [existingRule] Optional existing rule to edit
 * @returns {Promise<ReplacementRule|null>} The new/edited rule, or null if cancelled
 */
async function showReplacementRuleDialog(existingRule = null) {
    const context = SillyTavern.getContext();
    
    const form = document.createElement('div');
    form.innerHTML = `
        <div style="display: grid; gap: 10px; margin: 10px;">
            <label>Workflow Name (optional):<input type="text" id="workflowName"></label>
            <label>Node Title (optional):<input type="text" id="nodeTitle"></label>
            <label>Node Class (optional):<input type="text" id="nodeClass"></label>
            <label>Input Name (optional):<input type="text" id="inputName"></label>
            <label>Placeholder:<input type="text" id="placeholder" required></label>
            <label>Description:<input type="text" id="description" required></label>
        </div>
    `;

    // Pre-fill form if editing existing rule
    if (existingRule) {
        form.querySelector('#workflowName').value = existingRule.workflowName || '';
        form.querySelector('#nodeTitle').value = existingRule.nodeTitle || '';
        form.querySelector('#nodeClass').value = existingRule.nodeClass || '';
        form.querySelector('#inputName').value = existingRule.inputName || '';
        form.querySelector('#placeholder').value = existingRule.placeholder;
        form.querySelector('#description').value = existingRule.description;
    }

    const result = await context.callGenericPopup(form, context.POPUP_TYPE.CUSTOM);
    if (!result) return null;

    return {
        workflowName: form.querySelector('#workflowName').value || null,
        nodeTitle: form.querySelector('#nodeTitle').value || null,
        nodeClass: form.querySelector('#nodeClass').value || null,
        inputName: form.querySelector('#inputName').value || null,
        placeholder: form.querySelector('#placeholder').value,
        description: form.querySelector('#description').value,
    };
}

export { showReplacementRuleDialog };
