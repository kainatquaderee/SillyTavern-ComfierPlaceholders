import { iconButton } from './iconButton.js';
import { getCurrentPlaceholders, getPlaceholderOptionValues } from '../workflow/placeholders.js';
import { EXTENSION_NAME } from '../consts.js';
import { onInputReplaceClick, onAddRuleClick } from './replacerDialog.js';

const t = SillyTavern.getContext().t;

/**
 * Replace button for an input
 * @param nodeId
 * @param {NodeInputInfo} nodeInputInfo
 * @returns {HTMLButtonElement}
 */
export function replaceButton(nodeId, nodeInputInfo) {
    const log = `${nodeId}` === '5' && nodeInputInfo.value === '%sampler%';

    console.log(`[${EXTENSION_NAME}]`, 'Replace button for', nodeId);
    if (log) console.log(`[${EXTENSION_NAME}]`, 'Replace button for', nodeId, nodeInputInfo);

    const placeholders = getCurrentPlaceholders();
    const placeholderValues = getPlaceholderOptionValues();

    const replaceButton = iconButton('Replace', 'square-caret-right');
    const addRuleButton = iconButton('Add rule', 'plus');
    const doneButton = iconButton('Replaced', 'check', true);
    doneButton.disabled = true;
    doneButton.classList.add('disabled');

    const oopsButton = iconButton('Oops', 'times', true);

    const nodeMatchesPlaceholder = nodeInputInfo.value === `%${nodeInputInfo.placeholder}%`;
    const noRuleAvailable = nodeInputInfo.placeholder === '';

    // want to know if the current value of the node is a placeholder that exists
    const currentValueValid = placeholderValues.includes(nodeInputInfo.value);
    if (log) console.log(`[${EXTENSION_NAME}]`, 'valid:', currentValueValid, 'Current value:', nodeInputInfo.value, 'in placeholders:', placeholderValues);

    // want to know if the proposed value is a placeholder that exists
    const proposedValueValid = nodeInputInfo.placeholder in placeholders;

    if (log) console.log(`[${EXTENSION_NAME}]`, 'Replace button for', nodeId, 'nodeId', nodeInputInfo, 'currentValueValid:', currentValueValid, 'proposedValueValid:', proposedValueValid, 'nodeMatchesPlaceholder:', nodeMatchesPlaceholder, 'noRuleAvailable:', noRuleAvailable);

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
        oopsButton.classList.add('cp--nodeMatchesPlaceholder');
        return oopsButton;
    }
    if (noRuleAvailable) {
        addRuleButton.addEventListener('click', () => onAddRuleClick(addRuleButton, nodeId, nodeInputInfo.name, nodeInputInfo));
        addRuleButton.classList.add('cp--noRuleAvailable');
        return addRuleButton;
    }

    if (log) console.log(`[${EXTENSION_NAME}]`, 'Replace button for', nodeInputInfo);
    oopsButton.classList.add('cp--default');
    return oopsButton;
}
