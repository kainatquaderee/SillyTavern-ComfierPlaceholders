import { EXTENSION_NAME, settingsKey } from '../consts.js';
import { availableWorkflows, currentWorkflowContent } from '../workflow/workflows.js';
import { iconButton, ButtonType } from './iconButton.js';
import { getWorkflow } from '../api/workflow.js';

const t = SillyTavern.getContext().t;

async function createAssociationRow(srcWorkflow, dstWorkflow) {
    const context = SillyTavern.getContext();
    const row = document.createElement('div');
    row.classList.add('association-row');
    row.style.display = 'flex';
    row.style.gap = '8px';
    row.style.alignItems = 'center';
    row.style.marginBottom = '8px';
    row.style.padding = '12px';
    row.style.border = '1px solid var(--SmartThemeBorderColor)';
    row.style.borderRadius = '8px';

    // Check if workflows exist
    const workflows = await availableWorkflows();
    const srcExists = workflows[srcWorkflow];
    const dstExists = workflows[dstWorkflow];

    const srcLabel = document.createElement('div');
    srcLabel.textContent = srcWorkflow;
    srcLabel.style.flex = '1';
    srcLabel.style.minWidth = '0';
    srcLabel.style.overflow = 'hidden';
    srcLabel.style.textOverflow = 'ellipsis';
    if (!srcExists) {
        srcLabel.style.color = 'var(--warning)';
        srcLabel.title = 'Source workflow not found';
        const warningIcon = document.createElement('i');
        warningIcon.classList.add('fas', 'fa-exclamation-triangle');
        warningIcon.style.marginLeft = '8px';
        warningIcon.style.marginRight = '4px';
        warningIcon.style.color = 'var(--warning)';
        srcLabel.appendChild(warningIcon);
    }

    const arrow = document.createElement('i');
    arrow.classList.add('fas', 'fa-arrow-right');
    arrow.style.margin = '0 10px';

    const dstLabel = document.createElement('div');
    dstLabel.textContent = dstWorkflow;
    dstLabel.style.flex = '1';
    dstLabel.style.minWidth = '0';
    dstLabel.style.overflow = 'hidden';
    dstLabel.style.textOverflow = 'ellipsis';
    if (!dstExists) {
        dstLabel.style.color = 'var(--warning)';
        dstLabel.title = 'Destination workflow not found';
        const warningIcon = document.createElement('i');
        warningIcon.classList.add('fas', 'fa-exclamation-triangle');
        warningIcon.style.marginLeft = '5px';
        warningIcon.style.color = 'var(--warning)';
        dstLabel.appendChild(warningIcon);
    }

    if (!srcExists || !dstExists) {
        row.style.backgroundColor = 'var(--SmartThemeWarningBgColor)';
    }

    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.display = 'flex';
    buttonsContainer.style.gap = '4px';
    buttonsContainer.style.minWidth = 'fit-content';
    buttonsContainer.style.marginLeft = 'auto';

    const exportButton = iconButton('Export', 'download', {
        title: 'Download both workflows',
        srOnly: true,
    });
    exportButton.addEventListener('click', async () => {
        try {
            // temporary workaround: pack both workflows into a single object
            const srcWorkflowJsonStr = await getWorkflow(srcWorkflow);
            const dstWorkflowJsonStr = await getWorkflow(dstWorkflow);

            console.log(`[${EXTENSION_NAME}]`,
                `${srcWorkflow} JSON str (${typeof srcWorkflowJsonStr}):`,
                srcWorkflowJsonStr);

            const srcWorkflowJson = JSON.parse(srcWorkflowJsonStr.trim());
            const dstWorkflowJson = JSON.parse(dstWorkflowJsonStr.trim());

            console.log(`[${EXTENSION_NAME}]`,
                `${srcWorkflow} JSON (${typeof srcWorkflowJson}):`,
                srcWorkflowJson);

            let value = { [srcWorkflow]: srcWorkflowJson, [dstWorkflow]: dstWorkflowJson };
            console.log(`[${EXTENSION_NAME}]`, 'Exporting workflows:', value);
            const content = JSON.stringify(value, null, 2);

            const blob = new Blob([content], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${srcWorkflow}_and_${dstWorkflow}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to export workflows:', error);
            toastr.error(error.message, 'Export failed');
        }
    });

    const updateButton = iconButton('Update', 'pen', {
        title: 'Update association',
        srOnly: true,
    });
    updateButton.addEventListener('click', async () => {
        try {
            const workflows = await availableWorkflows();
            
            // Create workflow selection popup content
            const srcSelect = document.createElement('select');
            srcSelect.style.width = '100%';
            srcSelect.style.marginBottom = '10px';
            Object.keys(workflows).forEach(name => {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                if (name === srcWorkflow) option.selected = true;
                srcSelect.appendChild(option);
            });

            const dstSelect = document.createElement('select');
            dstSelect.style.width = '100%';
            Object.keys(workflows).forEach(name => {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                if (name === dstWorkflow) option.selected = true;
                dstSelect.appendChild(option);
            });

            const popupContent = document.createElement('div');
            popupContent.appendChild(document.createTextNode('Source workflow:'));
            popupContent.appendChild(srcSelect);
            popupContent.appendChild(document.createTextNode('Destination workflow:'));
            popupContent.appendChild(dstSelect);

            // Show the popup
            const result = await context.callGenericPopup(popupContent, context.POPUP_TYPE.CONFIRM, 'Update Association');
            if (result !== context.POPUP_RESULT.AFFIRMATIVE) return;

            const newSrcName = srcSelect.value;
            const newDstName = dstSelect.value;

            if (newSrcName === newDstName) {
                toastr.error('Source and destination workflows must be different');
                return;
            }

            // Update the association
            const settings = context.extensionSettings[settingsKey];
            const savedAs = settings.savedAs[srcWorkflow];
            delete settings.savedAs[srcWorkflow];
            settings.savedAs[newSrcName] = {
                ...savedAs,
                apiWorkflowName: newSrcName,
                dstWorkflowName: newDstName,
                lastUpdated: new Date().toISOString()
            };
            context.saveSettingsDebounced();

            // Update UI by recreating the row
            const newRow = await createAssociationRow(newSrcName, newDstName);
            row.replaceWith(newRow);
            toastr.success('Association updated');
        } catch (error) {
            console.error('Failed to update association:', error);
            toastr.error(error.message, 'Update failed');
        }
    });

    const removeButton = iconButton('Remove', 'trash', {
        buttonType: ButtonType.DANGER,
        title: 'Remove association',
        srOnly: true,
    });
    removeButton.addEventListener('click', async () => {
        // Validate workflows still exist
        const workflows = await availableWorkflows();
        if (!workflows[srcWorkflow] && !workflows[dstWorkflow]) {
            const context = SillyTavern.getContext();
            const settings = context.extensionSettings[settingsKey];
            delete settings.savedAs[srcWorkflow];
            context.saveSettingsDebounced();
            row.remove();
            return;
        }

        if (!workflows[srcWorkflow]) {
            toastr.warning(`Source workflow "${srcWorkflow}" no longer exists`, 'Invalid association');
        }
        if (!workflows[dstWorkflow]) {
            toastr.warning(`Destination workflow "${dstWorkflow}" no longer exists`, 'Invalid association');
        }

        if (await context.callPopup('This association references workflows that still exist. Remove anyway?', 'confirm')) {
            delete settings.savedAs[srcWorkflow];
            context.saveSettingsDebounced();
            row.remove();
        }
    });

    buttonsContainer.append(exportButton, updateButton, removeButton);
    row.append(srcLabel, arrow, dstLabel, buttonsContainer);
    return row;
}

async function showAssociationsManagerDialog() {
    const context = SillyTavern.getContext();
    const settings = context.extensionSettings[settingsKey];

    const dialog = document.createElement('div');
    dialog.classList.add('associations-dialog');

    const header = document.createElement('div');
    header.style.marginBottom = '1em';
    const h3 = document.createElement('h3');
    h3.textContent = t`Workflow Associations`;
    header.appendChild(h3);
    dialog.appendChild(header);

    const description = document.createElement('p');
    description.textContent = t`Manage associations between original workflows and their saved versions.`;
    description.style.marginBottom = '1em';
    dialog.appendChild(description);

    const associationsList = document.createElement('div');
    associationsList.classList.add('associations-list');

    // Add existing associations
    for (const [srcWorkflow, savedAs] of Object.entries(settings.savedAs)) {
        const row = await createAssociationRow(srcWorkflow, savedAs.dstWorkflowName);
        associationsList.appendChild(row);
    }

    dialog.appendChild(associationsList);

    // Show empty state if no associations
    if (associationsList.children.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.classList.add('empty-state');
        emptyState.style.textAlign = 'center';
        emptyState.style.color = 'var(--SmartThemeEmColor)';
        emptyState.textContent = t`No workflow associations found`;
        associationsList.appendChild(emptyState);
    }

    await context.callGenericPopup(dialog, context.POPUP_TYPE.ALERT, t`Workflow Associations`);
}

export { showAssociationsManagerDialog };
