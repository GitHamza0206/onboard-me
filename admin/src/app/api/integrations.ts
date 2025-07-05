// Base URL for the backend API.
const API_URL = `${import.meta.env.VITE_API_URL}/composio`;

/**
 * Initiates the authorization process for a specific toolkit.
 *
 * This function calls the backend endpoint to get a redirect URL
 * for authorizing a third-party application (toolkit) via Composio.
 *
 * @param toolkit - The name of the toolkit to authorize (e.g., 'notion', 'gdrive').
 * @param token - The token for authentication.
 * @returns The redirect URL for the authorization page.
 */
export const authorizeToolkit = async (toolkit: string, token: string): Promise<{ redirect_url: string }> => {
  const response = await fetch(`${API_URL}/authorize/${toolkit}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to initiate toolkit authorization.");
  }

  // The backend now returns a JSON response with the redirect URL.
  const data = await response.json();
  return data;
};

/**
 * Validates the Composio setup.
 *
 * This function calls the backend endpoint to validate the Composio API Key
 * and Auth Config ID. This is useful for debugging purposes.
 *
 * @returns A promise that resolves with the validation result.
 */
export const validateComposio = async () => {
    const response = await fetch(`${API_URL}/validate`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to validate Composio setup.");
    }

    return response.json();
}; 