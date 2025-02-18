import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import React from 'react';

const ValidateOtp = () => {
  const { validateOtp, loading, error, flowType } = useAuth();
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '']);
  const inputsRef = useRef<HTMLInputElement[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (flowType === null) {
      navigate('/login');
    }
  }, [flowType, navigate]);

  const handleChange = (index: number, value: string) => {
    if (/^\d*$/.test(value) && value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 4) {
        inputsRef.current[index + 1]?.focus();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await validateOtp(otp.join(''));
  };

  return (
    <div>
      <h1>Validate OTP</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        {otp.map((digit, index) => (
          <input
            key={index}
            type="text"
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            maxLength={1}
            ref={(el) => {
              inputsRef.current[index] = el as HTMLInputElement;
            }}
            style={{ width: '2em', margin: '0.5em' }}
          />
        ))}
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Submit'}
        </button>
      </form>
    </div>
  );
};

export default ValidateOtp;