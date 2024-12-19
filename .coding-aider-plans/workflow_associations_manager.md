[Coding Aider Plan]

# Workflow Associations Manager

See checklist: [workflow_associations_manager_checklist.md](workflow_associations_manager_checklist.md)

## Overview
Add functionality to manage associations between original and "saved as" versions of ComfyUI workflows, allowing users to track relationships between workflows and maintain them over time.

## Problem Description
Currently, when users save workflows under new names, there's no easy way to:
- View all workflow associations
- Update invalid associations
- Export both original and saved versions
- See the paired workflow name in the editor
- Clean up stale associations

## Goals
1. Create a new dialog to manage workflow associations
2. Show paired workflow names in the workflow editor
3. Add ability to export both workflows together
4. Provide UI to remove invalid associations
5. Allow updating associations when workflows are renamed

## Additional Notes and Constraints
- Must integrate with existing workflow editor UI
- Should handle cases where workflows are renamed/deleted
- Need to maintain backwards compatibility with existing savedAs data structure
- Should validate workflow existence before operations
- Consider UX for handling multiple saved versions of same workflow

## References
- Existing workflow editor code in ui/workflowEditor.js
- Workflow management in workflow/workflows.js
- Settings structure in index.js
