import { useState, useCallback } from 'react';
import { ToastMessage } from '../components/common/Toast';

let toastId = 0;

export const useToast = () => {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${toastId++}`;
    const newMessage: ToastMessage = { ...toast, id };
    
    setMessages(prev => [...prev, newMessage]);
    
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setMessages(prev => prev.filter(message => message.id !== id));
  }, []);

  const success = useCallback((title: string, message?: string, duration?: number) => {
    return addToast({ type: 'success', title, message, duration });
  }, [addToast]);

  const error = useCallback((title: string, message?: string, action?: ToastMessage['action']) => {
    return addToast({ 
      type: 'error', 
      title, 
      message, 
      duration: 7000, // 에러는 더 오래 표시
      action 
    });
  }, [addToast]);

  const warning = useCallback((title: string, message?: string, duration?: number) => {
    return addToast({ type: 'warning', title, message, duration });
  }, [addToast]);

  const info = useCallback((title: string, message?: string, duration?: number) => {
    return addToast({ type: 'info', title, message, duration });
  }, [addToast]);

  const clearAll = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
    clearAll
  };
};

export default useToast;