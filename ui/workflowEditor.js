function handleReplacerButtonClick() {
    const workflowNameElement = document.getElementById('sd_comfy_workflow_editor_name');
    const workflowName = workflowNameElement?.textContent || 'Unknown workflow';
    alert(`Opening replacer for workflow: ${workflowName}`);
}

function injectReplacerButton() {
    // Wait a short moment for the popup to be fully created
    setTimeout(() => {
        const container = document.querySelector('.sd_comfy_workflow_editor_placeholder_container');
        if (!container) {
            console.warn('Could not find workflow editor container');
            return;
        }

        const replacerSection = document.createElement('div');
        replacerSection.classList.add('sd_comfy_workflow_editor_replacer_section', 'flex-container', 'justifyCenter', 'alignItemsCenter');

        const button = document.createElement('button');
        button.className = 'menu_button';
        button.textContent = 'Open Replacer';
        button.style.marginTop = '10px';
        button.addEventListener('click', handleReplacerButtonClick);

        replacerSection.appendChild(button);
        container.appendChild(replacerSection);
    }, 100);
}

export { injectReplacerButton };
