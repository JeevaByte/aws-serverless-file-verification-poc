import React, { useState } from 'react';
import './OTPVerification.css';

function OTPVerification({ email, onVerificationSuccess, onCancel }) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      // In a real implementation, this would call Lambda to verify OTP
      // For POC, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful verification
      onVerificationSuccess();
    } catch (err) {
      setError('Invalid or expired OTP. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResending(true);
    setError('');
    
    try {
      // In a real implementation, this would call Lambda to generate new OTP
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('A new OTP has been sent to your email');
      setOtp('');
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
  };

  return (
    <div className="otp-verification-container">
      <h2>Verify Your Email</h2>
      <p>We've sent a 6-digit verification code to:</p>
      <p className="email-display">{email}</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="otp">Enter OTP</label>
          <input
            type="text"
            id="otp"
            value={otp}
            onChange={handleOtpChange}
            placeholder="000000"
            maxLength={6}
            required
            disabled={loading}
            className="otp-input"
          />
          <small>The code will expire in 10 minutes</small>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="button-group">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading || otp.length !== 6}
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>

      <div className="resend-section">
        <p>Didn't receive the code?</p>
        <button 
          type="button"
          className="link-button"
          onClick={handleResendOTP}
          disabled={resending}
        >
          {resending ? 'Sending...' : 'Resend OTP'}
        </button>
      </div>
    </div>
  );
}

export default OTPVerification;
