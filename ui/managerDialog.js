import { settingsKey } from '../consts.js';
import { showReplacementRuleDialog } from './replacementRuleDialog.js';

const t = SillyTavern.getContext().t;

function icon(faClass, title) {
    const icon = document.createElement('i');
    if (title) icon.title = t`${title}`;
    icon.classList.add('fas', 'fa-fw', `fa-${faClass}`);
    return icon;
}

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

function createReplacementsList(settings, context) {
    const container = document.createElement('div');
    container.classList.add('replacements-list');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '10px';

    function renderReplacements() {
        container.innerHTML = '';
        settings.replacements.forEach((replacement, index) => {
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
            const cardBody = document.createElement('div');
            cardHeader.style.display = 'flex';
            cardHeader.style.justifyContent = 'space-between';
            cardHeader.style.alignItems = 'center';
            cardHeader.style.marginBottom = '8px';
            cardHeader.appendChild(document.createTextNode(replacement.description || 'No description'));

            const removeButton = document.createElement('button');
            removeButton.classList.add('menu_button');
            removeButton.textContent = t`Remove`;
            removeButton.dataset.index = `${index}`;
            cardHeader.appendChild(removeButton);

            cardBody.append(workflowNameLabel, nodeTitleLabel, nodeClassLabel, inputNameLabel, placeholderLabel);

            cardBody.classList.add('flex-container', 'flexFlowColumn');

            card.appendChild(cardHeader);
            card.appendChild(cardBody);

            container.appendChild(card);
        });

        // Add event listeners to remove buttons
        container.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', () => {
                const index = parseInt(button.dataset.index);
                settings.replacements.splice(index, 1);
                context.saveSettingsDebounced();
                renderReplacements();
            });
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
    dialog.style.maxWidth = '800px';
    dialog.style.width = '100%';

    const header = document.createElement('div');
    header.style.marginBottom = '1em';
    header.innerHTML = '<h3>Manage Replacements</h3>';

    const addButton = document.createElement('button');
    addButton.classList.add('menu_button');
    addButton.textContent = 'Add Replacement';
    addButton.style.marginBottom = '1em';

    const { container, renderReplacements } = createReplacementsList(settings, context);

    addButton.style.alignSelf = 'flex-start';
    addButton.addEventListener('click', async () => {
        const newReplacement = await showReplacementRuleDialog();
        if (!newReplacement) return;

        settings.replacements.push(newReplacement);
        context.saveSettingsDebounced();
        renderReplacements();
    });

    dialog.append(header, addButton, container);
    await context.callGenericPopup(dialog, context.POPUP_TYPE.TEXT, '', {
        wide: true,
        large: true,
        allowVerticalScrolling: true,
        okButton: 'Close',
    });
}

export { showManagerDialog };
