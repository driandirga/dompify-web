import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import React from 'react';

const SendOtp = () => {
  const [email, setEmail] = useState('');
  const { sendOtp, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendOtp(email);
  };

  return (
    <div>
      <h1>Send OTP</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Send OTP'}
        </button>
      </form>
      <Link to="/login">Back to Login</Link>
    </div>
  );
};

export default SendOtp;