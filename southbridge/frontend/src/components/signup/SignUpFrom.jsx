import React, { useState } from "react";
import InputField from "./InputField";
import PrimaryButton from "../ui/PrimaryButton";

const SignupForm = ({ onSubmit, switchToOtp, loading }) => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    phone: '',
    role: 'shipper' // Default role
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[0-9]{10,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <InputField
        label="Email"
        type="email"
        name="email"
        placeholder="Enter your email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
      />
      
      <InputField
        label="Username"
        type="text"
        name="username"
        placeholder="Choose a username"
        required
        value={formData.username}
        onChange={handleChange}
        error={errors.username}
      />
      
      <InputField
        label="Phone Number"
        type="tel"
        name="phone"
        placeholder="Enter your phone number"
        required
        value={formData.phone}
        onChange={handleChange}
        error={errors.phone}
      />
      
      {/* Role Selection Field */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Role <span className="text-red-500">*</span>
        </label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.role ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="shipper">Shipper</option>
          <option value="broker">Broker</option>
          <option value="driver">Driver</option>
        </select>
        {errors.role && (
          <p className="mt-1 text-sm text-red-500">{errors.role}</p>
        )}
      </div>
      
      <div className="mt-6">
        <PrimaryButton type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Sign up with Password'}
        </PrimaryButton>
      </div>
      
      <div className="mt-4 text-center">
        <button 
          type="button" 
          onClick={switchToOtp}
          className="text-accent hover:underline text-sm font-medium"
        >
          Or sign up with OTP instead
        </button>
      </div>
    </form>
  );
};
export default SignupForm;