import React from 'react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline';
  }[];
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, actions }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000] animate-[fadeIn_0.2s_ease-out]" onClick={onClose}>
      <div 
        className="bg-white dark:bg-[#1e1e1e] rounded-xl max-w-[500px] w-[90%] max-h-[80vh] overflow-y-auto shadow-2xl animate-[slideUp_0.3s_ease-out]" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-[#333]">
          <h2 className="m-0 text-2xl text-[#333] dark:text-white">{title}</h2>
          <button 
            className="bg-transparent border-none text-[2rem] text-[#999] cursor-pointer p-0 w-8 h-8 flex items-center justify-center rounded transition-all hover:bg-gray-100 hover:text-[#333] dark:hover:bg-[#333] dark:hover:text-white" 
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="p-6 text-[#555] dark:text-[#ccc] leading-relaxed">{children}</div>
        {actions && actions.length > 0 && (
          <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-[#333] justify-end">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'primary'}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
