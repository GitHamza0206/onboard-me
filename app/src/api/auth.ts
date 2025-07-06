const apiUrl = import.meta.env.VITE_API_URL + "/auth"; // Base URL for auth routes

interface UserProfile {
  id: string;
  prenom: string | null;
  nom: string | null;
  is_admin: boolean;
  email: string;
}


export async function loginUser(credentials: any): Promise<any> {
    const response = await fetch(`${apiUrl}/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Login failed");
    return data;
}

export async function registerUser(payload: any): Promise<any> {
    const response = await fetch(`${apiUrl}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Registration failed");
    return data;
}


export async function fetchUserProfile(token: string): Promise<UserProfile> {
    const response = await fetch(`${apiUrl}/me`, {
        headers: { "Authorization": `Bearer ${token}` },
    });
    if (!response.ok) {
        if (response.status === 401) throw new Error("Unauthorized");
        throw new Error("Failed to fetch user profile");
    }
    return response.json();
}

// ----- NOUVELLES FONCTIONS -----

/**
 * Requests a password reset link for the given email.
 * @param email - The user's email address.
 * @returns A promise that resolves to the success message from the backend.
 */
export async function requestPasswordReset(email: string): Promise<{ message: string }> {
  const response = await fetch(`${apiUrl}/request-password-reset`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to request password reset.");
  }

  return data;
}

/**
 * Resets the user's password.
 * @param password - The new password.
 * @param token - The authentication token from the password recovery session.
 * @returns A promise that resolves to the success message.
 */
export async function resetPassword(password: string, token: string): Promise<{ message: string }> {
  const response = await fetch(`${apiUrl}/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": `Bearer ${token}`, // Use the recovery token
    },
    body: JSON.stringify({ password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to reset password.");
  }

  return data;
}