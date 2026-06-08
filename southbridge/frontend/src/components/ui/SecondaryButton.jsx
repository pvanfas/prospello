import React from "react";
const SecondaryButton = ({ children, onClick, disabled = false, ...props }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="w-full min-h-[44px] bg-white border border-accent text-accent font-medium rounded-lg hover:bg-steel-50 focus:ring-2 focus:ring-accent focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    {...props}
  >
    {children}
  </button>
);
export default SecondaryButton;