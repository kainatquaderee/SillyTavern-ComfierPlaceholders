import { icon } from './icon.js';

export function iconButton(textContent, faClass, listener) {
    if (!textContent) {
        throw new Error('textContent is required');
    }
    if (!faClass) {
        throw new Error('faClass is required');
    }

    const actionButton = document.createElement('button');
    actionButton.classList.add('menu_button', 'menu_button_icon');

    const i = icon(faClass);
    actionButton.appendChild(i);
    actionButton.appendChild(document.createTextNode(textContent));

    if (listener) {
        actionButton.addEventListener('click', listener);
    }
    return actionButton;
}
