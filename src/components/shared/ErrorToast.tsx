import { useEffect, useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

export interface ErrorToastData {
  symbol: string;
  suggestions: string[];
}

interface ErrorToastProps {
  error: ErrorToastData | null;
  onDismiss: () => void;
  autoDismissMs?: number;
}

export function ErrorToast({ error, onDismiss, autoDismissMs = 5000 }: ErrorToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (error) {
      setIsVisible(true);
      setIsLeaving(false);
      
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoDismissMs);
      
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleDismiss = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      onDismiss();
    }, 300);
  };

  if (!error || !isVisible) return null;

  return (
    <div
      className={`fixed top-20 right-4 z-50 max-w-sm rounded-lg border border-error/30 bg-error-container px-4 py-3 shadow-lg transition-all duration-300 ${
        isLeaving ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
      }`}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 flex-shrink-0 text-error mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-on_error_container">
            Stock {error.symbol} not found.
          </p>
          {error.suggestions.length > 0 && (
            <p className="text-sm text-on_error_container mt-1">
              Did you mean:{' '}
              <span className="font-medium">{error.suggestions.join(', ')}</span>
            </p>
          )}
          <button
            onClick={handleDismiss}
            className="mt-2 text-sm font-medium text-error hover:underline"
          >
            Got it
          </button>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 -m-1 rounded hover:bg-error/10"
        >
          <X className="h-4 w-4 text-on_error_container" />
        </button>
      </div>
    </div>
  );
}