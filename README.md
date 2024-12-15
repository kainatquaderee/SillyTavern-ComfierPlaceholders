# Comfier Placeholders

Automatically inserts placeholders into ComfyUI workflows, to connect them to the SillyTavern image generation controls.

<img width="514" alt="replaced" src="https://github.com/user-attachments/assets/5cafb588-7301-4154-964b-3b358abe1816" />

Suggested workflow:

1. Get your ComfyUI workflow into ST, per the [Workflow Editor documentation](https://docs.sillytavern.app/extensions/stable-diffusion/#workflow-editor).
2. Use "Save As" to save a copy of your workflow with a second name, to be used as the version with placeholders.
3. Use "Switch" to switch to the version with placeholders.
4. Use "Replace..." to inspect the workflow for any image generation controls, and replace them with placeholders if desired.
5. Click "Save" to save the modified workflow with placeholders. Try it out.
<img width="143" alt="replacer" src="https://github.com/user-attachments/assets/ec1eca0e-59a4-4b8b-9667-19e4b5b38bed" />

## Features

- remembers replacements you've made so you never have to do it again
- can replace all image generation controls in a workflow with placeholders in one click
- creates custom placeholders if needed
- keeps the unmodified version around, so when you need to modify it in ComfyUI, you can switch back to it
- import and export lists of placeholder insertion rules

<img width="400" alt="before" src="https://github.com/user-attachments/assets/f5e94a45-d929-4af6-8285-66c1866d9ace" />
<img width="400" alt="after" src="https://github.com/user-attachments/assets/07f01037-b34b-4819-9826-c0fa2ce26f4b" />

## Roadmap

- link custom placeholders to macro variables or dynamically created sliders/controls
- export a set of workflows with placeholders to a single file for distribution

## Installation and Usage

### Installation

Install with the SillyTavern [Extension Manager](https://docs.sillytavern.app/extensions/).

Paste the following URL into the "Install from URL" field:

```
https://github.com/ceruleandeep/SillyTavern-ComfierPlaceholders
```

### Usage

Add insertion rules from Workflow Editor

<img width="475" alt="entry" src="https://github.com/user-attachments/assets/7b23e243-278a-4915-a685-6d7fa8323a03" />

Rules list maintenance from settings drawer

<img width="256" alt="manage" src="https://github.com/user-attachments/assets/ce88fa70-9b3f-4de1-a3fa-9a3eba7799d9" />

Add/edit/delete/export/import rules

<img width="520" alt="rules-list" src="https://github.com/user-attachments/assets/85301d2b-f36b-4b34-9240-52079edd6945" />


*Explain how to use this extension.*

## Prerequisites

*Specify the version of ST necessary here.*

## Support and Contributions

Code status: extremely ragged.

## License

AGPL-3.0
