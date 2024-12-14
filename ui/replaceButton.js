import { iconButton } from './iconButton.js';
import { getPlaceholderOptionValues } from '../workflow/placeholders.js';
import { EXTENSION_NAME } from '../consts.js';
import { onInputReplaceClick, onAddRuleClick } from './replacerDialog.js';

/**
 * Replace button for an input
 * @param nodeId
 * @param {NodeInputInfo} nodeInputInfo
 * @returns {HTMLButtonElement}
 */
export function replaceButton(nodeId, nodeInputInfo) {
    const log = `${nodeId}` === '5';

    console.log(`[${EXTENSION_NAME}]`, 'Replace button for', nodeId);
    if (log) console.log(`[${EXTENSION_NAME}]`, 'Replace button for', nodeId, nodeInputInfo);

    const placeholderValues = getPlaceholderOptionValues();

    const replaceButton = iconButton('Replace', 'square-caret-right');
    const addRuleButton = iconButton('Add rule', 'plus');
    const doneButton = iconButton('Replaced', 'check', true);
    doneButton.disabled = true;
    doneButton.classList.add('disabled');

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

    console.log(`[${EXTENSION_NAME}]`, 'Replace button for', nodeId, 'nodeId', nodeInputInfo, 'nodeInputInfo', 'currentValueValid', currentValueValid, 'proposedValueValid', proposedValueValid, 'nodeMatchesPlaceholder', nodeMatchesPlaceholder, 'noRuleAvailable', noRuleAvailable);

    if (currentValueValid) {
        doneButton.classList.add('cp--currentValueValid');
        return doneButton;
    }
    if (proposedValueValid) {
        replaceButton.addEventListener('click', () => onInputReplaceClick(replaceButton, nodeId, nodeInputInfo.name, nodeInputInfo));
        replaceButton.classList.add('cp--proposedValueValid');
        return replaceButton;
    }
    if (nodeMatchesPlaceholder) {
        // user should either add the placeholder to the list or edit the rule
        // perhaps if we allowed them to run the replacement rule dialog from here, that would be good
        const oopsButton = iconButton('Oops', 'triangle-exclamation', true);
        oopsButton.disabled = true;
        oopsButton.classList.add('mes_edit_cancel');
        oopsButton.title = 'Current value matches placeholder';
        oopsButton.classList.add('cp--nodeMatchesPlaceholder');
        return oopsButton;
    }
    if (ruleAvailable) {
        // user should fix the rule
        if (log) console.log(`[${EXTENSION_NAME}]`, 'Replace button for', nodeInputInfo);
        const oopsButton = iconButton('Default', 'triangle-exclamation');
        oopsButton.classList.add('mes_edit_cancel');
        oopsButton.classList.add('cp--ruleAvailable');
        return oopsButton;
    }

    addRuleButton.addEventListener('click', () => onAddRuleClick(addRuleButton, nodeId, nodeInputInfo.name, nodeInputInfo));
    addRuleButton.classList.add('cp--noRuleAvailable');
    return addRuleButton;
}
