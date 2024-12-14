const t = SillyTavern.getContext().t;

export function icon(faClass, title) {
    const icon = document.createElement('i');
    if (title) icon.title = t`${title}`;
    icon.classList.add('fas', 'fa-fw', `fa-${faClass}`);
    return icon;
}
