import { fetchEventSource } from "@microsoft/fetch-event-source";

// Base URL for the backend API.
// It's good practice to use environment variables for this in a real application.
const API_URL = import.meta.env.VITE_API_URL + "/agent";

/**
 * Helper types based on the backend's Python `agent.py` script.
 * These define the shape of the data coming from the SSE stream.
 */
interface Message {
  role: string;
  type: string;
  content: string;
  id?: string | null;
  tool_calls?: {
    id: string;
    name: string;
    args: Record<string, unknown>;
  }[];
  tool_call_id?: string;
  name?: string;
}

export interface UpdatePayload {
  node: string;
  messages: Message[];
  thread_id: string;
}

export type ValuesPayload = Record<string, unknown> & { thread_id: string };

export type ErrorPayload = { type: 'error'; message: string; } | Error;

/**
 * Defines the structure for callbacks to handle different stream events.
 * 
 * @param onMessage - Called when a 'messages' event is received with a token.
 * @param onUpdate - Called when an 'updates' event provides new state information.
 * @param onValues - Called when a 'values' event provides other data.
 * @param onError - Called when an error occurs in the stream.
 * @param onClose - Called when the stream is closed by the server.
 */
export interface StreamCallbacks {
  onMessage?: (token: string) => void;
  onUpdate?: (update: UpdatePayload) => void;
  onValues?: (values: ValuesPayload) => void;
  onError?: (error: ErrorPayload) => void;
  onClose?: () => void;
}

/**
 * Initiates a streaming connection to the creator agent backend.
 * 
 * This function communicates with the backend's Server-Sent Events (SSE) endpoint
 * to get a real-time stream of responses from the AI agent. It uses the
 * `@microsoft/fetch-event-source` library to handle the connection.
 * 
 * @param topic - The topic or message to send to the agent.
 * @param callbacks - An object containing callback functions to handle stream events.
 */
export const streamAgentResponse = async (text: string, threadId: string | null, callbacks: StreamCallbacks) => {
  const { onMessage, onValues, onError, onClose } = callbacks;

  try {
    await fetchEventSource(`${API_URL}/runs/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: {
          messages: [
            {
              type: "human",
              content: text,
            },
          ],
        },
        config: {
          configurable: {
            thread_id: threadId,
          },
        },
        stream_mode: ["messages", "updates", "values"],
      }),
      
      // The rest of the function remains the same
      async onopen(response) {
        if (response.ok) {
          return;
        } else if (response.status >= 400 && response.status < 500 && response.status !== 429) {
          const error = await response.json();
          throw new Error(JSON.stringify(error));
        } else {
          throw new Error(response.statusText);
        }
      },

      onmessage(event) {
        if (event.data === "[DONE]") {
          onClose?.();
          return;
        }
        try {
          const [eventType, payload] = JSON.parse(event.data);
          switch (eventType) {
            case "messages":
              onMessage?.(payload);
              break;
            case "values":
              onValues?.(payload);
              break;
            // Removed onUpdate as it's not used
            case "error":
              onError?.(payload as ErrorPayload);
              break;
            default:
              break;
          }
        } catch (e) {
          console.error("Failed to parse SSE message data:", event.data, e);
          onError?.(new Error("Failed to parse message from server."));
        }
      },

      onclose() {
        console.log("Connection closed by server.");
      },

      onerror(err) {
        console.error("SSE fetch error:", err);
        onError?.(err);
        throw err;
      },
    });
  } catch (err) {
    console.error("Failed to start stream:", err);
    onError?.(err as Error);
  }
};