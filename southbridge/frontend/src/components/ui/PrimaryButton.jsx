import React from 'react';


const PrimaryButton = ({ children, onClick, disabled = false, ...props }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="w-full min-h-[44px] bg-cta text-white font-medium rounded-xl bg-orange-600 focus:ring-2 focus:ring-accent focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    {...props}
  >
    {children}
  </button>
);

export default PrimaryButton;