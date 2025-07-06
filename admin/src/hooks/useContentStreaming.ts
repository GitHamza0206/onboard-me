// src/hooks/useContentStreaming.ts
import { useState, useEffect, useRef, useCallback } from 'react';

export interface StreamingEvent {
  type: 'status' | 'messages' | 'updates' | 'progress' | 'values' | 'error';
  data: any;
}

export interface StreamingProgress {
  currentLesson?: {
    id: string;
    title: string;
    progress: string;
    streamingContent?: string; // Accumulate streaming content
  };
  totalLessons?: number;
  completedLessons?: number;
  isGenerating: boolean;
  isCompleted: boolean;
  error?: string;
  messages: string[];
  currentStreamingContent: string; // Accumulate current lesson content being streamed
}

export interface UseContentStreamingReturn {
  progress: StreamingProgress;
  isConnected: boolean;
  startStreaming: (courseStructure: any) => void;
  stopStreaming: () => void;
  clearMessages: () => void;
}

export function useContentStreaming(
  token: string | null,
  apiUrl: string = "http://localhost:8000"
): UseContentStreamingReturn {
  const [progress, setProgress] = useState<StreamingProgress>({
    isGenerating: false,
    isCompleted: false,
    messages: [],
    currentStreamingContent: '',
  });
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const streamingRef = useRef(false);

  const stopStreaming = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsConnected(false);
    streamingRef.current = false;
  }, []);

  const startStreaming = useCallback(async (courseStructure: any) => {
    if (!token || streamingRef.current) return;

    streamingRef.current = true;
    setProgress(prev => ({
      ...prev,
      isGenerating: true,
      isCompleted: false,
      error: undefined,
      messages: [],
      currentStreamingContent: '',
    }));

    try {
      setIsConnected(true);
      
      // Use fetch with streaming to handle POST request with body
      const response = await fetch(`${apiUrl}/agent/content/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({ structure: courseStructure }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body for streaming');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      const readStream = async () => {
        try {
          while (streamingRef.current) {
            const { done, value } = await reader.read();
            
            if (done) {
              console.log('Stream completed');
              break;
            }

            // Decode the chunk and add it to buffer
            buffer += decoder.decode(value, { stream: true });
            
            // Process complete messages in buffer
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep incomplete line in buffer

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const jsonData = line.slice(6); // Remove 'data: ' prefix
                  if (jsonData.trim()) {
                    const [eventType, eventData] = JSON.parse(jsonData);
                    
                    setProgress(prev => {
                      const newProgress = { ...prev };
                      
                      switch (eventType) {
                        case 'status':
                          if (eventData.completed) {
                            newProgress.isGenerating = false;
                            newProgress.isCompleted = true;
                          }
                          newProgress.messages = [...prev.messages, eventData.message];
                          break;
                          
                        case 'messages':
                          // Accumulate token-by-token content for the current lesson
                          newProgress.currentStreamingContent = prev.currentStreamingContent + eventData;
                          break;
                          
                        case 'updates':
                          if (eventData.messages) {
                            const updateMessages = eventData.messages.map((msg: any) => msg.content);
                            newProgress.messages = [...prev.messages, ...updateMessages];
                            
                            // Check if this is a lesson completion message
                            const completionMsg = updateMessages.find((msg: string) => 
                              msg.includes('✅ Leçon terminée:') || msg.includes('✅💾 Leçon sauvegardée:')
                            );
                            if (completionMsg) {
                              // Lesson completed, reset streaming content for next lesson
                              newProgress.currentStreamingContent = '';
                            }
                          }
                          break;
                          
                        case 'progress':
                          newProgress.completedLessons = eventData.outputs_count;
                          break;
                          
                        case 'values':
                          if (eventData.lesson_generated) {
                            newProgress.currentLesson = {
                              id: eventData.lesson_generated.lesson_id,
                              title: eventData.lesson_generated.lesson_title,
                              progress: eventData.lesson_generated.progress,
                              streamingContent: prev.currentStreamingContent,
                            };
                          }
                          if (eventData.formation_completed) {
                            newProgress.isGenerating = false;
                            newProgress.isCompleted = true;
                            newProgress.totalLessons = eventData.formation_completed.total_lessons;
                            newProgress.currentStreamingContent = '';
                          }
                          break;
                          
                        case 'error':
                          newProgress.error = eventData.message;
                          newProgress.isGenerating = false;
                          break;
                      }
                      
                      return newProgress;
                    });
                  }
                } catch (parseError) {
                  console.error('Failed to parse SSE message:', parseError, 'Raw line:', line);
                }
              }
            }
          }
        } catch (readError) {
          console.error('Stream reading error:', readError);
          setProgress(prev => ({
            ...prev,
            error: 'Stream reading error occurred',
            isGenerating: false,
          }));
        } finally {
          reader.releaseLock();
          setIsConnected(false);
          streamingRef.current = false;
        }
      };

      // Start reading the stream
      readStream();

    } catch (error) {
      console.error('Failed to start streaming:', error);
      setProgress(prev => ({
        ...prev,
        error: 'Failed to establish streaming connection',
        isGenerating: false,
      }));
      setIsConnected(false);
      streamingRef.current = false;
    }
  }, [token, apiUrl]);

  const clearMessages = useCallback(() => {
    setProgress(prev => ({ ...prev, messages: [] }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStreaming();
    };
  }, [stopStreaming]);

  return {
    progress,
    isConnected,
    startStreaming,
    stopStreaming,
    clearMessages,
  };
}