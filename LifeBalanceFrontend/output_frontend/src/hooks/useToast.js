import { useState, useCallback } from 'react';

/**
 * Hook para mostrar toasts.
 * Retorna: { toast, showToast }
 */
export function useToast() {
  const [toast, setToast] = useState({ msg: '', type: '', visible: false });

  const showToast = useCallback((msg, type = '') => {
    setToast({ msg, type, visible: true });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3200);
  }, []);

  return { toast, showToast };
}
