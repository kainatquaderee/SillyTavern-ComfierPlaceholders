import { settingsKey } from '../consts.js';
import { availableWorkflows } from '../workflow/workflows.js';
import { iconButton, ButtonType } from './iconButton.js';
import { getWorkflow } from '../api/workflow.js';
import { changeWorkflow } from '../workflow/workflows.js';
import { delay } from './workflowEditor.js';

const t = SillyTavern.getContext().t;

async function createAssociationRow(srcWorkflow, dstWorkflow) {
    const context = SillyTavern.getContext();
    const row = document.createElement('div');
    row.classList.add('association-row');
    row.style.display = 'flex';
    row.style.gap = '8px';
    row.style.marginBottom = '8px';
    row.style.padding = '12px';
    row.style.border = '1px solid var(--SmartThemeBorderColor)';
    row.style.borderRadius = '8px';

    // Create a container for the workflow names
    const namesContainer = document.createElement('div');
    namesContainer.style.display = 'flex';
    namesContainer.style.flexDirection = 'column';
    namesContainer.style.gap = '8px';
    namesContainer.style.flex = '1';
    namesContainer.style.minWidth = '0';

    // Check if workflows exist
    const workflows = await availableWorkflows();
    const srcExists = workflows[srcWorkflow];
    const dstExists = workflows[dstWorkflow];

    // Create source workflow row
    const srcRow = document.createElement('div');
    srcRow.style.display = 'flex';
    srcRow.style.alignItems = 'center';
    srcRow.style.gap = '8px';

    const srcLabel = document.createElement('a');
    srcLabel.href = '#';
    srcLabel.textContent = srcWorkflow;
    srcLabel.style.flex = '1';
    srcLabel.style.minWidth = '0';
    srcLabel.style.overflow = 'hidden';
    srcLabel.style.textOverflow = 'ellipsis';
    srcLabel.style.textDecoration = 'none';
    srcLabel.style.color = 'inherit';
    if (!srcExists) {
        srcLabel.style.color = 'var(--warning)';
        srcLabel.title = 'Source workflow not found';
    }
    srcLabel.addEventListener('click', async (e) => {
        e.preventDefault();
        if (srcExists) {
            // Close all open popups first
            document.querySelectorAll('.popup').forEach(popup => {
                const cancelBtn = popup.querySelector('.popup-button-cancel');
                if (cancelBtn) cancelBtn.click();
            });
            await delay(100);
            await changeWorkflow(srcWorkflow);
            await delay(100);
            const editorButton = document.getElementById('sd_comfy_open_workflow_editor');
            editorButton.click();
        }
    });

    const srcIcon = document.createElement('i');
    srcIcon.classList.add('fas', 'fa-file');
    if (!srcExists) {
        const warningIcon = document.createElement('i');
        warningIcon.classList.add('fas', 'fa-exclamation-triangle');
        warningIcon.style.marginLeft = '4px';
        warningIcon.style.color = 'var(--warning)';
        srcRow.append(srcIcon, srcLabel, warningIcon);
    } else {
        srcRow.append(srcIcon, srcLabel);
    }

    // Create arrow
    const arrow = document.createElement('i');
    arrow.classList.add('fas', 'fa-arrow-down');
    arrow.style.marginLeft = '12px';

    // Create destination workflow row
    const dstRow = document.createElement('div');
    dstRow.style.display = 'flex';
    dstRow.style.alignItems = 'center';
    dstRow.style.gap = '8px';

    const dstLabel = document.createElement('a');
    dstLabel.href = '#';
    dstLabel.textContent = dstWorkflow;
    dstLabel.style.flex = '1';
    dstLabel.style.minWidth = '0';
    dstLabel.style.overflow = 'hidden';
    dstLabel.style.textOverflow = 'ellipsis';
    dstLabel.style.textDecoration = 'none';
    dstLabel.style.color = 'inherit';
    if (!dstExists) {
        dstLabel.style.color = 'var(--warning)';
        dstLabel.title = 'Destination workflow not found';
    }
    dstLabel.addEventListener('click', async (e) => {
        e.preventDefault();
        if (dstExists) {
            // Close all open popups first
            document.querySelectorAll('.popup').forEach(popup => {
                const cancelBtn = popup.querySelector('.popup-button-cancel');
                if (cancelBtn) cancelBtn.click();
            });
            await delay(100);
            await changeWorkflow(dstWorkflow);
            await delay(100);
            const editorButton = document.getElementById('sd_comfy_open_workflow_editor');
            editorButton.click();
        }
    });

    const dstIcon = document.createElement('i');
    dstIcon.classList.add('fas', 'fa-file');
    if (!dstExists) {
        const warningIcon = document.createElement('i');
        warningIcon.classList.add('fas', 'fa-exclamation-triangle');
        warningIcon.style.marginLeft = '4px';
        warningIcon.style.color = 'var(--warning)';
        dstRow.append(dstIcon, dstLabel, warningIcon);
    } else {
        dstRow.append(dstIcon, dstLabel);
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
            // Download both workflows as separate files
            const srcWorkflowJsonStr = await getWorkflow(srcWorkflow);
            const dstWorkflowJsonStr = await getWorkflow(dstWorkflow);

            // Create and trigger download for source workflow
            const srcBlob = new Blob([srcWorkflowJsonStr], { type: 'application/json' });
            const srcUrl = window.URL.createObjectURL(srcBlob);
            const srcLink = document.createElement('a');
            srcLink.href = srcUrl;
            srcLink.download = srcWorkflow;
            document.body.appendChild(srcLink);
            srcLink.click();
            document.body.removeChild(srcLink);
            window.URL.revokeObjectURL(srcUrl);

            // Create and trigger download for destination workflow
            const dstBlob = new Blob([dstWorkflowJsonStr], { type: 'application/json' });
            const dstUrl = window.URL.createObjectURL(dstBlob);
            const dstLink = document.createElement('a');
            dstLink.href = dstUrl;
            dstLink.download = dstWorkflow;
            document.body.appendChild(dstLink);
            dstLink.click();
            document.body.removeChild(dstLink);
            window.URL.revokeObjectURL(dstUrl);
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
                lastUpdated: new Date().toISOString(),
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

        if (await context.callGenericPopup('This association references workflows that still exist. Remove anyway?', context.POPUP_TYPE.CONFIRM)) {
            const settings = context.extensionSettings[settingsKey];
            delete settings.savedAs[srcWorkflow];
            context.saveSettingsDebounced();
            row.remove();
        }
    });

    buttonsContainer.append(exportButton, updateButton, removeButton);
    namesContainer.append(srcRow, arrow, dstRow);
    row.append(namesContainer, buttonsContainer);
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
    h3.textContent = t`Workflow Links`;
    header.appendChild(h3);
    dialog.appendChild(header);

    const description = document.createElement('p');
    description.textContent = t`Manage links between original ComfyUI workflows and placeholder-inserted workflows.`;
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
