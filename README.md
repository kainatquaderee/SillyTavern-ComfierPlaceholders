# Comfier Placeholders

Automatically inserts placeholders into ComfyUI workflows, to connect them to the SillyTavern image generation controls.

Suggested workflow:

1. Get your ComfyUI workflow into ST, per the [Workflow Editor documentation](https://docs.sillytavern.app/extensions/stable-diffusion/#workflow-editor).
2. Use "Save As" to save a copy of your workflow with a second name, to be used as the version with placeholders.
3. Use "Switch" to switch to the version with placeholders.
4. Use "Replace..." to inspect the workflow for any image generation controls, and replace them with placeholders if desired.
5. Click "Save" to save the modified workflow with placeholders. Try it out.

## Features

- remembers replacements you've made so you never have to do it again
- can replace all image generation controls in a workflow with placeholders in one click
- creates custom placeholders if needed
- keeps the unmodified version around, so when you need to modify it in ComfyUI, you can switch back to it
- import and export lists of placeholder insertion rules

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

*Explain how to use this extension.*

## Prerequisites

*Specify the version of ST necessary here.*

## Support and Contributions

Code status: extremely ragged.

## License

AGPL-3.0
