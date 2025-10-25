import React, { useState } from 'react';
import './App.css';

function App() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [file, setFile] = useState(null);
  const [step, setStep] = useState(1); // 1: Email input, 2: OTP verification, 3: File upload
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // TODO: Replace with your API Gateway endpoint
  const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT || 'https://your-api-gateway-url.com';

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      // TODO: Implement API call to generate OTP
      // const response = await axios.post(`${API_ENDPOINT}/generate-otp`, { email });
      
      // Mock response for demonstration
      console.log('Sending OTP to:', email);
      setMessage('OTP sent to your email. Please check your inbox.');
      setStep(2);
      
      // Uncomment when API is ready:
      /*
      const response = await fetch(`${API_ENDPOINT}/generate-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessage(data.message);
        setStep(2);
      } else {
        setError('Failed to send OTP. Please try again.');
      }
      */
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerification = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      // TODO: Implement API call to verify OTP
      // const response = await axios.post(`${API_ENDPOINT}/verify-otp`, { email, otp });
      
      // Mock verification for demonstration
      console.log('Verifying OTP:', otp, 'for email:', email);
      setMessage('Email verified successfully! You can now upload files.');
      setStep(3);
      
      // Uncomment when API is ready:
      /*
      const response = await fetch(`${API_ENDPOINT}/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessage(data.message);
        setStep(3);
      } else {
        setError('Invalid OTP. Please try again.');
      }
      */
    } catch (err) {
      setError('An error occurred during verification. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file size (e.g., max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (selectedFile.size > maxSize) {
        setError('File size exceeds 10MB limit.');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      // TODO: Implement file upload to S3 via presigned URL
      console.log('Uploading file:', file.name);
      setMessage(`File "${file.name}" uploaded successfully!`);
      
      // Uncomment when API is ready:
      /*
      // Step 1: Get presigned URL from backend
      const presignedResponse = await fetch(`${API_ENDPOINT}/get-upload-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          fileName: file.name,
          fileType: file.type,
        }),
      });
      
      if (!presignedResponse.ok) {
        throw new Error('Failed to get upload URL');
      }
      
      const { uploadUrl } = await presignedResponse.json();
      
      // Step 2: Upload file to S3 using presigned URL
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });
      
      if (uploadResponse.ok) {
        setMessage(`File "${file.name}" uploaded successfully!`);
        setFile(null);
      } else {
        setError('Failed to upload file. Please try again.');
      }
      */
    } catch (err) {
      setError('An error occurred during file upload. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setOtp('');
    setFile(null);
    setStep(1);
    setMessage('');
    setError('');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>AWS Serverless File Verification</h1>
        <p>Secure file upload with email verification</p>
      </header>

      <main className="App-main">
        {message && <div className="message success">{message}</div>}
        {error && <div className="message error">{error}</div>}

        {step === 1 && (
          <div className="form-container">
            <h2>Step 1: Enter Your Email</h2>
            <form onSubmit={handleEmailSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email Address:</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                  disabled={loading}
                />
              </div>
              <button type="submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="form-container">
            <h2>Step 2: Verify Your Email</h2>
            <p>We've sent a verification code to <strong>{email}</strong></p>
            <form onSubmit={handleOtpVerification}>
              <div className="form-group">
                <label htmlFor="otp">Enter OTP:</label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  maxLength="6"
                  pattern="[0-9]{6}"
                  required
                  disabled={loading}
                />
              </div>
              <button type="submit" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
              <button type="button" onClick={resetForm} className="secondary">
                Change Email
              </button>
            </form>
          </div>
        )}

        {step === 3 && (
          <div className="form-container">
            <h2>Step 3: Upload Your File</h2>
            <p>Email verified: <strong>{email}</strong></p>
            <form onSubmit={handleFileUpload}>
              <div className="form-group">
                <label htmlFor="file">Select File (max 10MB):</label>
                <input
                  type="file"
                  id="file"
                  onChange={handleFileChange}
                  disabled={loading}
                />
                {file && (
                  <div className="file-info">
                    <p>Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)</p>
                  </div>
                )}
              </div>
              <button type="submit" disabled={loading || !file}>
                {loading ? 'Uploading...' : 'Upload File'}
              </button>
              <button type="button" onClick={resetForm} className="secondary">
                Start Over
              </button>
            </form>
          </div>
        )}
      </main>

      <footer className="App-footer">
        <p>AWS Serverless File Verification POC</p>
      </footer>
    </div>
  );
}

export default App;
