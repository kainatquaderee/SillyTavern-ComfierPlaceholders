import { ButtonType, iconButton } from './iconButton.js';
import { getPlaceholderOptionValues } from '../workflow/placeholders.js';
import { EXTENSION_NAME } from '../consts.js';
import { onInputReplaceClick, onAddRuleClick, onAddCustomPlaceholder } from './replacerDialog.js';

/**
 * Replace button for an input
 *
 * @param nodeId
 * @param {NodeInputInfo} nodeInputInfo
 * @returns {HTMLButtonElement}
 */
export function replaceButton(nodeId, nodeInputInfo) {
    const log = false;

    const placeholderValues = getPlaceholderOptionValues();

    if (placeholderValues.includes(nodeInputInfo.value)) {
        // the current value of the node is a placeholder that exists
        const doneButton = iconButton('Replaced', 'check', {
            srOnly: true, disabled: true, title: `Replaced with ${nodeInputInfo.value}`,
        });
        doneButton.classList.add('cp--currentValueValid');
        return doneButton;
    }

    if (placeholderValues.includes(nodeInputInfo.suggested)) {
        // the proposed value is a placeholder that exists
        const replaceButton = iconButton('Replace', 'square-caret-right', {
            srOnly: true,
            title: `Replace with ${nodeInputInfo.suggested}`,
        });
        replaceButton.addEventListener('click', (e) => onInputReplaceClick(nodeId, nodeInputInfo.name, nodeInputInfo, e));
        replaceButton.classList.add('cp--proposedValueValid');
        return replaceButton;
    }

    if (nodeInputInfo.value && nodeInputInfo.value === nodeInputInfo.suggested) {
        // the current value is the same as the suggested placeholder
        // current value is a placeholder, but it's not in the list

        const addCustomPlaceholderButton = iconButton('Add custom', 'percent', {
            buttonType: ButtonType.DANGER,
            srOnly: true,
            title: `Add custom placeholder ${nodeInputInfo.value}` });
        addCustomPlaceholderButton.classList.add('cp--nodeMatchesPlaceholder');
        addCustomPlaceholderButton.addEventListener('click', (e) => onAddCustomPlaceholder(e, nodeInputInfo.value, nodeInputInfo.value));
        return addCustomPlaceholderButton;
    }

    if (nodeInputInfo.suggested && !placeholderValues.includes(nodeInputInfo.suggested)) {
        // it's not broken yet, but would be if the suggested value is used
        if (log) console.log(`[${EXTENSION_NAME}]`, 'Replace button for', nodeInputInfo);
        const replaceInvalidButton = iconButton('Replace', 'circle-exclamation', {
            srOnly: true,
            title: `Placeholder ${nodeInputInfo.suggested} would be invalid`,
            buttonType: ButtonType.WARNING,
        });
        replaceInvalidButton.addEventListener('click', (e) => onInputReplaceClick(nodeId, nodeInputInfo.name, nodeInputInfo, e));
        replaceInvalidButton.classList.add('cp--ruleAvailable');
        return replaceInvalidButton;
    }

    const addRuleButton = iconButton('Add rule', 'plus', { srOnly: true });
    addRuleButton.addEventListener('click', () => onAddRuleClick(addRuleButton, nodeId, nodeInputInfo.name, nodeInputInfo));
    addRuleButton.title = `Add rule for ${nodeInputInfo.name}`;
    addRuleButton.classList.add('cp--noRuleAvailable');
    return addRuleButton;
}

