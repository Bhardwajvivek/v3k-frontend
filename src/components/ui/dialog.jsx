import * as React from "react";

// Simple Modal Dialog without external dependencies
export function Dialog({ open, onOpenChange, children }) {
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Modal */}
      <div className="relative z-50 w-full max-w-4xl rounded-xl bg-white dark:bg-gray-900 p-6 shadow-xl animate-in fade-in-0 zoom-in-95">
        {children}
      </div>
    </div>
  );
}

export function DialogTrigger({ children, onClick }) {
  return (
    <div onClick={onClick} className="cursor-pointer">
      {children}
    </div>
  );
}

export function DialogContent({ children, className = "" }) {
  return (
    <div className={`text-sm text-gray-700 dark:text-gray-200 ${className}`}>
      {children}
    </div>
  );
}

export function DialogHeader({ children, className = "" }) {
  return (
    <div className={`mb-4 border-b border-gray-200 dark:border-gray-700 pb-2 ${className}`}>
      {children}
    </div>
  );
}

export function DialogTitle({ children, className = "" }) {
  return (
    <h2 className={`text-lg font-semibold leading-6 text-gray-900 dark:text-white ${className}`}>
      {children}
    </h2>
  );
}