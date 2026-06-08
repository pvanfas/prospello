import React from "react";

const OtpInput = ({ value, onChange, error }) => {
  const handleChange = (e, index) => {
    const val = e.target.value;
    
    if (!/^\d*$/.test(val)) return;
    
    const newValue = value.split('');
    newValue[index] = val;
    onChange(newValue.join(''));
    
    // Auto focus to next input if a digit was entered
    if (val && index < 5) {
      setTimeout(() => {
        document.getElementById(`otp-${index + 1}`).focus();
      }, 0);
    }
  };
  
  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };
  
  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    
    if (pasteData.length > 0) {
      // Create a 6-character string, padding with empty spaces if needed
      const paddedData = pasteData.padEnd(6, ' ');
      onChange(paddedData);
      
      // Focus on the next empty field or the last filled field
      const nextEmptyIndex = Math.min(pasteData.length, 5);
      setTimeout(() => {
        const nextInput = document.getElementById(`otp-${nextEmptyIndex}`);
        if (nextInput) {
          nextInput.focus();
        }
      }, 0);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-default mb-3">
        Enter verification code
        <span className="text-red-500">*</span>
      </label>
      <div className="flex justify-between space-x-2">
        {[...Array(6)].map((_, i) => (
          <input
            key={i}
            id={`otp-${i}`}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength="1"
            value={value[i] || ''}
            onChange={(e) => handleChange(e, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            onPaste={i === 0 ? handlePaste : undefined}
            className="w-12 h-14 text-center text-xl border border-steel-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-white"
          />
        ))}
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};
export default OtpInput;