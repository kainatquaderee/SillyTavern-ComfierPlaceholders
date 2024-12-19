/* functions to interact directly with the ST Comfy API */

/**
 * Get the workflow JSON (stringified) for the given file name
 *
 * @param {string} file_name
 * @returns {Promise<string>}
 */
export async function getWorkflow(file_name) {
    const headers = SillyTavern.getContext().getRequestHeaders();
    const workflowResponse = await fetch('/api/sd/comfy/workflow', {
        method: 'POST',
        headers,
        body: JSON.stringify({ file_name }),
    });
    if (!workflowResponse.ok) {
        const text = await workflowResponse.text();
        console.error(`Failed to load workflow: ${text}`);
        throw new Error(`Failed to load workflow.\n\n${text}`);
    }
    // parsing the response as JSON gets us the stringified workflow JSON
    // if you want the actual workflow as objects, JSON.parse() it after this
    return await workflowResponse.json();
}
