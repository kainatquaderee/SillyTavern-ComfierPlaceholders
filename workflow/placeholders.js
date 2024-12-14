/**
 * @typedef {Object} PlaceholderInfo
 * @property {string} find - Placeholder to find, without %%
 * @property {?string} replace - Value to replace the placeholder with, if custom
 * @property {boolean} custom - Custom placeholder
 * @property {boolean} present - Placeholder is present in the workflow
 * @property {boolean} valid - Placeholder is present in the editor's placeholder list
 */


/**
 * Get the current placeholders in the workflow editor
 *
 * @returns {Record<string,PlaceholderInfo>} Placeholder info
 */
function getCurrentPlaceholders() {
    const workflow = document.getElementById('sd_comfy_workflow_editor_workflow').value;
    const placeholderList = document.querySelectorAll('.sd_comfy_workflow_editor_placeholder_list > li[data-placeholder]') || [];
    const placeholders = {};
    for (const placeholder of placeholderList) {
        const key = placeholder.getAttribute('data-placeholder');
        const present = workflow.search(`"%${key}%"`) !== -1;
        placeholders[key] = {
            find: key,
            replace: null,
            custom: false,
            present,
            valid: true,
        };
    }
    const customPlaceholders = document.querySelectorAll('.sd_comfy_workflow_editor_placeholder_list_custom > li[data-placeholder]') || [];
    for (const placeholder of customPlaceholders) {
        const key = placeholder.getAttribute('data-placeholder');
        const present = workflow.search(`"%${key}%"`) !== -1;
        const value = placeholder.find('.text_pole sd_comfy_workflow_editor_custom_replace').value;
        placeholders[key] = {
            find: key,
            replace: value,
            custom: true,
            present,
            valid: true,
        };
    }
    return placeholders.map(makePlaceholderInfo);
}

/**
 * Make placeholder info object
 * @param {Object} args - Placeholder info arguments
 * @param {string} args.placeholder - Placeholder name
 * @param {boolean} args.present - Placeholder is present in the workflow
 * @param {boolean} args.valid - Placeholder is present in the editor's placeholder list
 * @param {boolean} args.custom - Custom placeholder
 *
 * @returns {PlaceholderInfo} Placeholder info
 */
function makePlaceholderInfo(args) {
    return {
        find: args.placeholder,
        replace: args.placeholder,
        custom: false,
        present: false,
        valid: false,
    };
}
