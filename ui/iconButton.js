import { icon } from './icon.js';

/**
 * Create an icon
 *
 * @param {string} textContent
 * @param {string} faClass
 * @param {boolean} srOnly
 * @returns {HTMLButtonElement}
 */
export function iconButton(textContent, faClass, srOnly = false) {
    if (!textContent) {
        throw new Error('textContent is required');
    }
    if (!faClass) {
        throw new Error('faClass is required');
    }

    const actionButton = document.createElement('button');
    actionButton.classList.add('menu_button', 'menu_button_icon');

    const i = icon(faClass, textContent);
    actionButton.appendChild(i);
    if (srOnly) {
        const sr = document.createElement('span');
        sr.classList.add('sr-only');
        sr.textContent = textContent;
        actionButton.appendChild(sr);
    } else {
        actionButton.appendChild(document.createTextNode(textContent));
    }
    return actionButton;
}
