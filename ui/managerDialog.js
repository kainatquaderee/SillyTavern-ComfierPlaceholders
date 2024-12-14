import { settingsKey } from '../consts.js';
import { showReplacementRuleDialog } from './replacementRuleDialog.js';
import { icon } from './icon.js';
import { iconButton } from './iconButton.js';
import { EXTENSION_NAME } from '../consts.js';

const t = SillyTavern.getContext().t;

function ruleFilter(className, text, title, faClass) {
    faClass = faClass || 'asterisk';
    const workflowIcon = icon(faClass, title);
    workflowIcon.style.marginRight = '5px';
    const workflowNameText = text || 'Any';
    const workflowNameLabel = document.createElement('div');
    workflowNameLabel.appendChild(workflowIcon);
    workflowNameLabel.classList.add(className, 'tag_name');
    workflowNameLabel.appendChild(document.createTextNode(workflowNameText));
    return workflowNameLabel;
}

/**
 * Edit a replacement rule
 *
 * @returns {Promise<void>}
 */
async function onEditButtonClick(callback) {
    console.log(`[${EXTENSION_NAME}]`, t`Editing replacement rule at index`, this.dataset.index);
    const context = SillyTavern.getContext();
    const settings = context.extensionSettings[settingsKey];

    const index = parseInt(this.dataset.index);
    const replacement = settings.replacements[index];
    const newReplacement = await showReplacementRuleDialog(replacement);
    if (!newReplacement) return;

    settings.replacements[index] = newReplacement;
    context.saveSettingsDebounced();
    // renderReplacements();
    callback();
}

/**
 * Crazy town
 *
 * @param callback
 * @returns {Promise<void>}
 */
async function onRemoveButtonClick(callback) {
    console.log(`[${EXTENSION_NAME}]`, t`Removing replacement rule at index`, this.dataset.index);
    const context = SillyTavern.getContext();
    const settings = context.extensionSettings[settingsKey];
    const index = parseInt(this.dataset.index);
    console.log(`[${EXTENSION_NAME}] Removing replacement rule at index`, index, 'this:', this, settings.replacements[index]);
    settings.replacements.splice(index, 1);
    context.saveSettingsDebounced();
    // renderReplacements();
    callback();
}

/**
 * Create a card for a replacement rule
 *
 * @param replacement
 * @param index
 * @param onEditButtonClick
 * @param onRemoveButtonClick
 * @returns {HTMLDivElement}
 */
function createReplacementCard(replacement, index, onEditButtonClick, onRemoveButtonClick) {
    const card = document.createElement('div');
    card.classList.add('replacement-card');
    card.style.border = '1px solid #666';
    card.style.borderRadius = '8px';
    card.style.padding = '10px';
    card.style.backgroundColor = '--SmartThemeBodyColor)';

    const workflowNameLabel = ruleFilter('workflow-name', replacement.workflowName, 'Workflow Name', 'code-branch');
    const nodeTitleLabel = ruleFilter('node-title', replacement.nodeTitle, 'Node Title', 'martini-glass');
    const nodeClassLabel = ruleFilter('node-class', replacement.nodeClass, 'Node Class', 'code-commit');
    const inputNameLabel = ruleFilter('input-name', replacement.inputName, 'Input Name', 'code');
    const placeholderLabel = ruleFilter('placeholder', `%${replacement.placeholder}%`, 'Placeholder', 'percent');

    const cardHeader = document.createElement('div');
    cardHeader.classList.add('flex-container');
    cardHeader.style.marginBottom = '8px';

    const cardDescription = document.createElement('h4');
    cardDescription.textContent = replacement.description || replacement.placeholder;
    cardDescription.classList.add('flexGrow', 'justifyLeft');
    cardHeader.appendChild(cardDescription);

    const editButton = iconButton('Edit', 'edit', true);
    editButton.dataset.index = `${index}`;
    editButton.addEventListener('click', onEditButtonClick);
    cardHeader.appendChild(editButton);

    const removeButton = iconButton('Remove', 'trash-alt', true);
    removeButton.dataset.index = `${index}`;
    removeButton.classList.add('remove-button', 'text-danger');
    removeButton.addEventListener('click', onRemoveButtonClick);
    cardHeader.appendChild(removeButton);

    const cardBody = document.createElement('div');
    cardBody.append(workflowNameLabel, nodeTitleLabel, nodeClassLabel, inputNameLabel, placeholderLabel);
    cardBody.classList.add('flex-container', 'flexFlowColumn');

    card.appendChild(cardHeader);
    card.appendChild(cardBody);
    return card;
}



function createReplacementsList() {
    const context = SillyTavern.getContext();
    const settings = context.extensionSettings[settingsKey];

    const container = document.createElement('div');
    container.classList.add('replacements-list');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '10px';

    function renderReplacements() {
        container.innerHTML = '';
        settings.replacements.forEach((replacement, index) => {
            const onEdit = () => onEditButtonClick.call({ dataset: { index } }, renderReplacements);
            const onRemove = () => onRemoveButtonClick.call({ dataset: { index } }, renderReplacements);
            const card = createReplacementCard(replacement, index, onEdit, onRemove);
            container.appendChild(card);
        });
    }

    renderReplacements();
    return { container, renderReplacements };
}

async function showManagerDialog() {
    const context = SillyTavern.getContext();
    const settings = context.extensionSettings[settingsKey];

    const dialog = document.createElement('div');
    dialog.classList.add('replacements-dialog');
    // dialog.style.maxWidth = '800px';
    // dialog.style.width = '100%';

    const header = document.createElement('div');
    header.style.marginBottom = '1em';
    header.innerHTML = '<h3>Manage Replacements</h3>';

    const addButton = iconButton('Add rule', 'plus');

    const { container, renderReplacements } = createReplacementsList();

    addButton.style.alignSelf = 'flex-start';
    addButton.addEventListener('click', onAddRuleClick);

    async function onAddRuleClick() {
        const newReplacement = await showReplacementRuleDialog();
        if (!newReplacement) return;

        settings.replacements.push(newReplacement);
        context.saveSettingsDebounced();
        renderReplacements();
    }

    dialog.append(header, addButton, container);
    await context.callGenericPopup(dialog, context.POPUP_TYPE.TEXT, '', {
        wide: true,
        large: true,
        allowVerticalScrolling: true,
        okButton: 'Close',
    });
}

export { showManagerDialog };
