import { ButtonType, iconButton } from './iconButton.js';
import { getPlaceholderOptionValues } from '../workflow/placeholders.js';
import { EXTENSION_NAME } from '../consts.js';
import { onInputReplaceClick, onAddRuleClick, onAddCustomPlaceholder } from './replacerDialog.js';

/**
 * Replace button for an input
 * @param nodeId
 * @param {NodeInputInfo} nodeInputInfo
 * @returns {HTMLButtonElement}
 */
export function replaceButton(nodeId, nodeInputInfo) {
    const log = false;

    // console.log(`[${EXTENSION_NAME}]`, 'Replace button for', nodeId);
    // if (log) console.log(`[${EXTENSION_NAME}]`, 'Replace button for', nodeId, nodeInputInfo);

    const placeholderValues = getPlaceholderOptionValues();

    const addRuleButton = iconButton('Add rule', 'plus', { srOnly: true });
    const doneButton = iconButton('Replaced', 'check', { srOnly: true, disabled: true });

    // want to know if the current value of the node is a placeholder that exists
    const currentValueValid = placeholderValues.includes(nodeInputInfo.value);
    if (log) console.log(`[${EXTENSION_NAME}]`, 'currentValueValid:', currentValueValid, 'Current value:', nodeInputInfo.value, 'in placeholders:', placeholderValues);

    // want to know if the proposed value is a placeholder that exists
    const proposedValueValid = placeholderValues.includes(nodeInputInfo.suggested);
    if (log) console.log(`[${EXTENSION_NAME}]`, 'proposedValueValid:', proposedValueValid, 'Current value:', nodeInputInfo.suggested, 'in placeholders:', placeholderValues);

    // want to know if the current value is the same as the suggested placeholder
    const nodeMatchesPlaceholder = nodeInputInfo.value && nodeInputInfo.value === nodeInputInfo.suggested;
    if (log) console.log(`[${EXTENSION_NAME}]`, 'nodeMatchesPlaceholder:', nodeMatchesPlaceholder, 'Current value:', nodeInputInfo.value, 'Proposed value:', nodeInputInfo.suggested);

    // want to know if there is no rule available for the current value
    const ruleAvailable = nodeInputInfo.suggested !== '';
    if (log) console.log(`[${EXTENSION_NAME}]`, 'ruleAvailable:', ruleAvailable, 'Current value:', nodeInputInfo.suggested);

    console.log(`[${EXTENSION_NAME}]`, 'Replace button for', nodeId, 'nodeId', nodeInputInfo, 'nodeInputInfo', 'currentValueValid', currentValueValid, 'proposedValueValid', proposedValueValid, 'nodeMatchesPlaceholder', nodeMatchesPlaceholder, 'ruleAvailable', ruleAvailable);

    if (currentValueValid) {
        doneButton.classList.add('cp--currentValueValid');
        return doneButton;
    }
    if (proposedValueValid) {
        const replaceButton = iconButton('Replace', 'square-caret-right', {
            srOnly: true,
            title: `Replace with ${nodeInputInfo.suggested}`,
        });
        replaceButton.addEventListener('click', (e) => onInputReplaceClick(nodeId, nodeInputInfo.name, nodeInputInfo, e));
        replaceButton.classList.add('cp--proposedValueValid');
        return replaceButton;
    }
    if (nodeMatchesPlaceholder) {
        // current value is a placeholder, but it's not in the list
        // no rules to change it, don't know what rule might have been used
        // user should either add the placeholder to the list or edit the rule

        const addCustomPlaceholderButton = iconButton('Add custom', 'percent', {
            buttonType: ButtonType.DANGER,
            srOnly: true,
            title: `Add custom placeholder ${nodeInputInfo.value}` });
        addCustomPlaceholderButton.classList.add('cp--nodeMatchesPlaceholder');
        addCustomPlaceholderButton.addEventListener('click', (e) => onAddCustomPlaceholder(e, nodeInputInfo.value, nodeInputInfo.value));
        return addCustomPlaceholderButton;
    }
    if (ruleAvailable) {
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

    addRuleButton.addEventListener('click', () => onAddRuleClick(addRuleButton, nodeId, nodeInputInfo.name, nodeInputInfo));
    addRuleButton.title = `Add rule for ${nodeInputInfo.name}`;
    addRuleButton.classList.add('cp--noRuleAvailable');
    return addRuleButton;
}

