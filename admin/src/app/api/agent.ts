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
export const streamAgentResponse = async (topic: string, callbacks: StreamCallbacks) => {
  const { onMessage, onUpdate, onValues, onError, onClose } = callbacks;

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
              content: `${topic}`,
            },
          ],
        },
        // We request specific stream modes to get different types of data.
        stream_mode: ["messages", "updates", "values"],
      }),
      
      /**
       * `onopen` is called when a connection is established.
       * It must return a Promise. Here, we're just logging that the connection is open.
       */
      async onopen(response) {
        if (response.ok) {
          console.log("Connection opened for SSE.");
          return; // Everything is good.
        } else if (response.status >= 400 && response.status < 500 && response.status !== 429) {
          const error = await response.json();
          console.error("Client-side error:", error);
          throw new Error(JSON.stringify(error));
        } else {
          console.error("Server-side error:", response.statusText);
          throw new Error(response.statusText);
        }
      },

      /**
       * `onmessage` is called for each event received from the server.
       */
      onmessage(event) {
        // The server sends a '[DONE]' message to signal the end of the stream.
        if (event.data === "[DONE]") {
          console.log("Stream finished.");
          if (onClose) {
            onClose();
          }
          return;
        }

        try {
          const [eventType, payload] = JSON.parse(event.data);

          // We switch on the event type to call the appropriate callback.
          switch (eventType) {
            case "messages":
              if (onMessage) onMessage(payload);
              console.log("messages", payload);
              break;
            case "updates":
              if (onUpdate) onUpdate(payload);
              break;
            case "values":
                if (onValues) onValues(payload);
                break;
            case "error":
              console.error("Stream error event:", payload);
              if (onError) onError(payload as ErrorPayload);
              break;
            default:
              // console.warn("Unhandled SSE event type:", eventType);
              break;
          }
        } catch (e) {
          console.error("Failed to parse SSE message data:", event.data, e);
          if (onError) {
            onError(new Error("Failed to parse message from server."));
          }
        }
      },

      /**
       * `onclose` is called when the connection is closed.
       */
      onclose() {
        console.log("Connection closed by server.");
      },

      /**
       * `onerror` is called when a network error occurs.
       */
      onerror(err) {
        console.error("SSE fetch error:", err);
        if (onError) {
          onError(err);
        }
        // The library will automatically retry, so we throw the error
        // to stop it from retrying on fatal errors.
        throw err;
      },
    });
  } catch (err) {
    console.error("Failed to start stream:", err);
    if (onError) {
      onError(err as Error);
    }
  }
}; 