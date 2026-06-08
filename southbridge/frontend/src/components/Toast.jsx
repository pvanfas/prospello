import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';

// Toast Context
const ToastContext = createContext();

// Custom hook to use toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Toast Provider Component
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((type, message, duration = 4000) => {
    const id = Date.now().toString();
    const newToast = { id, type, message, duration };
    setToasts(prevToasts => [...prevToasts, newToast]);
    
    return () => removeToast(id);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

// Individual Toast Component
const Toast = ({ id, type, message, onClose, duration = 4000 }) => {
  const [isExiting, setIsExiting] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  const toastConfig = {
    success: {
      bg: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
      text: 'text-white',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
      ),
    },
    error: {
      bg: 'bg-gradient-to-r from-rose-500 to-rose-600',
      text: 'text-white',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      ),
    },
    warning: {
      bg: 'bg-gradient-to-r from-amber-500 to-amber-600',
      text: 'text-gray-900',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
      ),
    },
    info: {
      bg: 'bg-gradient-to-r from-sky-500 to-sky-600',
      text: 'text-white',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      ),
    },
  };

  const { bg, text, icon } = toastConfig[type];

  return (
    <div
      className={`
        flex items-center justify-between w-full max-w-sm min-h-[56px] 
        px-4 py-4 rounded-xl shadow-lg transition-all duration-300
        ${bg} ${text}
        ${isExiting ? 'opacity-0 -translate-y-10' : 'opacity-100 translate-y-0'}
        transform backdrop-blur-sm bg-opacity-95
      `}
      style={{ 
        transition: 'opacity 300ms ease, transform 300ms ease',
      }}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center">
        <span className="mr-3 flex items-center justify-center w-6 h-6">
          {icon}
        </span>
        <span className="font-medium text-sm">{message}</span>
      </div>
      <button
        onClick={handleClose}
        className={`
          ml-4 text-xl font-bold hover:opacity-70 
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white
          transition-opacity duration-200
        `}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
};

// Toast Container Component
const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-sm px-4">
      <div className="flex flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="transition-all duration-300 ease-in-out"
            style={{
              transform: 'translateY(-1rem)',
              opacity: 0,
              animation: 'slideInFromTop 0.3s ease-out forwards'
            }}
          >
            <Toast
              id={toast.id}
              type={toast.type}
              message={toast.message}
              duration={toast.duration}
              onClose={removeToast}
            />
          </div>
        ))}
      </div>
      
      {/* Animation styles */}
      <style>
        {`
          @keyframes slideInFromTop {
            from {
              transform: translateY(-1rem);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};

