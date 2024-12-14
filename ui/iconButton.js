import { icon } from './icon.js';

/**
 * Use CSS vars in preference to applying classes, because the classes are used for UI interactions
 * as well as styling
 *
 * @typedef {Object} ButtonType
 * @property {string} name
 * @property {string} [cssVar]
 */

/** @enum {typeof ButtonType[keyof typeof ButtonType]} */
const ButtonType = Object.freeze({
    DEFAULT: /** @type {ButtonType}*/({ name: 'default' }),
    WARNING: /** @type {ButtonType}*/({ name: 'warning', cssVar: '--warning' }),
    DANGER: /** @type {ButtonType}*/({ name: 'danger', cssVar: '--crimson70a' }),
    SUCCESS: /** @type {ButtonType}*/({ name: 'success', cssVar: '--okGreen70a' }),
});

/**
 * @typedef  ButtonOptions
 * @property {ButtonType} [buttonType]
 * @property {string} [id] Button ID
 * @property {boolean} [disabled]
 * @property {boolean} [srOnly]
 * @property {string} [title]
 * @property {string} [className]
 * @property {string} [cssVar]
 */

/**
 * Create an icon button
 * @param {string} textContent Button text
 * @param {string} faClass Font Awesome class
 * @param {ButtonOptions} options Button options
 * @returns {HTMLButtonElement} Button element
 */
function iconButton(textContent, faClass, options = {
    buttonType: ButtonType.DEFAULT,
    id: '',
    disabled: false,
    srOnly: false,
    title: '',
    className: '',
}) {
    // todo: i18n

    if (!textContent) {
        throw new Error('textContent is required');
    }
    if (!faClass) {
        throw new Error('faClass is required');
    }

    const buttonElement = document.createElement('button');
    buttonElement.classList.add('menu_button', 'menu_button_icon');
    if (options.id) buttonElement.id = options.id;

    const i = icon(faClass, textContent);
    buttonElement.appendChild(i);
    if (options.srOnly) {
        const sr = document.createElement('span');
        sr.classList.add('sr-only');
        sr.textContent = textContent;
        buttonElement.appendChild(sr);
    } else {
        buttonElement.appendChild(document.createTextNode(textContent));
    }
    if (options.disabled) {
        buttonElement.disabled = true;
        buttonElement.classList.add('disabled');
    }
    if (options.title) {
        buttonElement.title = options.title;
    }
    if (options.className) {
        buttonElement.classList.add(options.className);
    }
    if (options.buttonType?.name) {
        buttonElement.classList.add(`emma--${options.buttonType.name}`);
    }
    if (options.buttonType?.cssVar) {
        buttonElement.style.backgroundColor = `var(${options.buttonType.cssVar})`;
    }

    return buttonElement;
}

export { iconButton, ButtonType };
