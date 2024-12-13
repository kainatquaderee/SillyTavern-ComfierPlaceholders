// noinspection DuplicatedCode

/*
Comfier Placeholders

Objective:
Make it easier to replace inputs in the Image Generation workflow with placeholders.

Examples:
- for all nodes of class_type KSampler, the input "seed" should be replaced with the placeholder "%seed%"
- For Flux_img2img.json, KSampler input "denoise" should be replaced with "%denoise%"
- For Flux_txt2img.json, node titled "CLIP Loader", input "clip_name1" should be replaced with "%clip%"

TODO list:
- get the current workflow from Image Generation
- parse out all the nodes
- list each node's class, title, non-node inputs, and their values
- allow the user to select an input and change its value to a placeholder
- put the rewritten workflow back into the Image Generation Workflow Editor
- save the list of placeholders to the extension settings so they can be reused
- allow global and per-workflow placeholders
- check for placeholders in the workflow that are not in the list and prompt the user to add them
*/

import { renderExtensionSettings } from './ui/settings.js';
import { settingsKey, EXTENSION_NAME } from './consts.js';
import { injectReplacerButton } from './ui/workflowEditor.js';

/**
 * @type {SillyTavernComfierPlaceholdersSettings}
 * @typedef {Object} SillyTavernComfierPlaceholdersSettings
 * @property {boolean} enabled Whether the extension is enabled
 */
const defaultSettings = Object.freeze({
    enabled: true,
});


(function initExtension() {
    console.debug(`[${EXTENSION_NAME}]`, 'Initializing extension');
    const context = SillyTavern.getContext();

    if (!context.extensionSettings[settingsKey]) {
        context.extensionSettings[settingsKey] = structuredClone(defaultSettings);
    }

    for (const key of Object.keys(defaultSettings)) {
        if (context.extensionSettings[settingsKey][key] === undefined) {
            context.extensionSettings[settingsKey][key] = defaultSettings[key];
        }
    }

    context.saveSettingsDebounced();

    renderExtensionSettings();

    // Watch for workflow editor being added to DOM
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node instanceof HTMLElement && node.querySelector('.sd_comfy_workflow_editor')) {
                    injectReplacerButton();
                }
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    console.debug(`[${EXTENSION_NAME}]`, 'Extension initialized');
})();
