import { MessageCircle } from 'lucide-react';

interface ChatTriggerProps {
  onClick: () => void;
}

export function ChatTrigger({ onClick }: ChatTriggerProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-primary to-primary-container text-surface font-medium shadow-lg hover:shadow-xl transition-all hover:scale-105 z-30"
    >
      <MessageCircle className="h-6 w-6" />
    </button>
  );
}