/**
 * This file centralizes all API calls related to user authentication,
 * including login, registration, and fetching user profiles. This is a good practice
 * for separating concerns, making the codebase cleaner and more maintainable.
 */

// The base URL for the API, retrieved from environment variables.
const apiUrl = import.meta.env.VITE_API_URL;

/**
 * Interface for the user profile data received from the backend.
 * Keeping a consistent type definition helps with type safety.
 */
interface UserProfile {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  registration_date: string;
  subscription_type: string;
}

/**
 * Logs in a user by sending their credentials to the /signin endpoint.
 * @param credentials - An object containing the user's email and password.
 * @returns A promise that resolves to an object containing the access token.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function loginUser(credentials: any): Promise<any> {
    const response = await fetch(`${apiUrl}/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
        // Use the error detail from the backend if available for better error messages.
        throw new Error(data.detail || "Login failed");
    }
    
    return data;
}

/**
 * Registers a new user.
 * @param payload - The user's registration details (first name, last name, email, password).
 * @returns A promise that resolves to the newly created user's profile.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function registerUser(payload: any): Promise<UserProfile> {
    const response = await fetch(`${apiUrl}/signup`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        body: JSON.stringify({
            email: payload.email,
            password: payload.password,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        // Use the error detail from the backend for more specific feedback.
        const errorMessage = data?.detail || "Registration failed. Please try again.";
        throw new Error(errorMessage);
    }

    return data;
}

/**
 * Fetches the profile of the currently authenticated user using a JWT.
 * @param token - The JWT for authorization.
 * @returns A promise that resolves to the user's profile.
 */
export async function fetchUserProfile(token: string): Promise<UserProfile> {
    const response = await fetch(`${apiUrl}/me`, {
        method: "GET",
        headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        // If the token is invalid (e.g., 401 Unauthorized), it's a clear sign to log the user out.
        // Throwing a specific error helps the caller decide on the action to take.
        if (response.status === 401) {
            console.warn("Token invalid or expired during profile fetch.");
            throw new Error("Unauthorized");
        }
        throw new Error(`Error ${response.status} fetching user profile`);
    }

    return response.json();
}

/**
 * Signs out the current user by calling the backend endpoint.
 * @returns A promise that resolves if signout is successful.
 */
export async function signoutUser(): Promise<void> {
    const response = await fetch(`${apiUrl}/signout`, {
        method: "POST",
        headers: {
            "Accept": "application/json",
        },
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Signout failed");
    }
} 