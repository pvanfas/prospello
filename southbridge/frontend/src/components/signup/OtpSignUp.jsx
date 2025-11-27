import React, { useState, useEffect } from 'react';
import InputField from './InputField';
import OtpInput from '../ui/OtpInput';
import PrimaryButton from '../ui/PrimaryButton';

const OtpSignup = ({ 
  onSubmit, 
  switchToPassword, 
  loading, 
  isVerificationMode = false, 
  phoneNumber = '' 
}) => {
  const [step, setStep] = useState(isVerificationMode ? 2 : 1);
  const [phone, setPhone] = useState(phoneNumber || '');
  const [otp, setOtp] = useState('');
  const [username, setUsername] = useState('');
  const [errors, setErrors] = useState({});

  // Update phone number if passed as prop
  useEffect(() => {
    if (phoneNumber) {
      setPhone(phoneNumber);
      setStep(2);
    }
  }, [phoneNumber]);

  const validatePhone = () => {
    if (!phone.trim()) {
      setErrors({ phone: 'Phone number is required' });
      return false;
    }
    
    if (!/^\+?[0-9]{10,15}$/.test(phone.replace(/\s/g, ''))) {
      setErrors({ phone: 'Please enter a valid phone number' });
      return false;
    }
    
    setErrors({});
    return true;
  };

  const validateOtp = () => {
    if (otp.length !== 6) {
      setErrors({ otp: 'Please enter the 6-digit code' });
      return false;
    }
    
    setErrors({});
    return true;
  };

  const validateUsername = () => {
    if (!username.trim()) {
      setErrors({ username: 'Username is required' });
      return false;
    }
    
    setErrors({});
    return true;
  };

  const handleSendOtp = () => {
    if (validatePhone()) {
      // In a real app, this would call an API to send the OTP
      setStep(2);
    }
  };

  const handleVerifyOtp = () => {
    if (validateOtp()) {
      if (isVerificationMode) {
        // If in verification mode, submit the OTP for user creation
        onSubmit({ otp });
      } else {
        // Original flow - proceed to username step
        setStep(3);
      }
    }
  };

  const handleSetUsername = () => {
    if (validateUsername()) {
      onSubmit({ phone, username });
    }
  };

  return (
    <div className="w-full">
      {step === 1 && (
        <>
          <InputField
            label="Phone Number"
            type="tel"
            placeholder="Enter your phone number"
            required
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (errors.phone) setErrors({});
            }}
            error={errors.phone}
          />
          
          <div className="mt-6">
            <PrimaryButton onClick={handleSendOtp} disabled={loading}>
              Send OTP
            </PrimaryButton>
          </div>
          
          <div className="mt-4 text-center">
            <button 
              type="button" 
              onClick={switchToPassword}
              className="text-accent hover:underline text-sm font-medium"
            >
              {isVerificationMode ? 'Back to signup' : 'Or sign up with password instead'}
            </button>
          </div>
        </>
      )}
      
      {step === 2 && (
        <>
          <p className="text-default text-sm mb-4">
            We've sent a verification code to {phone}
          </p>
          
          <OtpInput
            value={otp}
            onChange={setOtp}
            error={errors.otp}
          />
          
          <div className="mt-6">
            <PrimaryButton onClick={handleVerifyOtp} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </PrimaryButton>
          </div>
          
          {!isVerificationMode && (
            <div className="mt-4 text-center">
              <button 
                type="button" 
                onClick={() => setStep(1)}
                className="text-accent hover:underline text-sm font-medium"
              >
                Change phone number
              </button>
            </div>
          )}
          
          {isVerificationMode && (
            <div className="mt-4 text-center">
              <button 
                type="button" 
                onClick={switchToPassword}
                className="text-accent hover:underline text-sm font-medium"
              >
                Back to signup form
              </button>
            </div>
          )}
        </>
      )}
      
      {step === 3 && (
        <>
          <InputField
            label="Username"
            type="text"
            placeholder="Choose a username"
            required
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (errors.username) setErrors({});
            }}
            error={errors.username}
          />
          
          <div className="mt-6">
            <PrimaryButton onClick={handleSetUsername} disabled={loading}>
              {loading ? 'Creating account...' : 'Complete Sign Up'}
            </PrimaryButton>
          </div>
        </>
      )}
    </div>
  );
};

export default OtpSignup;