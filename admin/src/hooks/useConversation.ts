import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

export const useConversation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [threadId, setThreadId] = useState<string | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    let currentThreadId = searchParams.get('thread_id');

    if (!currentThreadId) {
      currentThreadId = `thread_${uuidv4()}`;
      searchParams.set('thread_id', currentThreadId);
      navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true });
    }
    
    setThreadId(currentThreadId);
  }, [location.search, navigate, location.pathname]);

  const newConversation = () => {
    const newThreadId = `thread_${uuidv4()}`;
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('thread_id', newThreadId);
    navigate(`${location.pathname}?${searchParams.toString()}`);
    setThreadId(newThreadId);
  };

  return { threadId, newConversation };
}; 