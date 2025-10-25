import React, { useState } from 'react';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploadStatus('');
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  const handleFileUpload = async () => {
    if (!file || !email) {
      setUploadStatus('Please select a file and enter your email.');
      return;
    }

    try {
      setUploadStatus('Uploading file and generating OTP...');
      
      // TODO: Implement API call to upload file to S3
      // TODO: Implement API call to generate OTP
      
      // Placeholder response
      setUploadStatus('File uploaded successfully! Check your email for OTP.');
    } catch (error) {
      setUploadStatus(`Error: ${error.message}`);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setVerificationStatus('Please enter the OTP.');
      return;
    }

    try {
      setVerificationStatus('Verifying OTP...');
      
      // TODO: Implement API call to verify OTP
      
      // Placeholder response
      setVerificationStatus('OTP verified successfully!');
    } catch (error) {
      setVerificationStatus(`Error: ${error.message}`);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>AWS Serverless File Verification POC</h1>
        <p>Upload a file and verify your email with OTP</p>
      </header>
      
      <main className="App-main">
        <section className="upload-section">
          <h2>Step 1: Upload File</h2>
          <div className="form-group">
            <label htmlFor="email">Email Address:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="your.email@example.com"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="file">Select File:</label>
            <input
              type="file"
              id="file"
              onChange={handleFileChange}
            />
          </div>
          
          <button onClick={handleFileUpload} className="btn-primary">
            Upload File
          </button>
          
          {uploadStatus && (
            <div className="status-message">{uploadStatus}</div>
          )}
        </section>
        
        <section className="verify-section">
          <h2>Step 2: Verify OTP</h2>
          <div className="form-group">
            <label htmlFor="otp">Enter OTP:</label>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={handleOtpChange}
              placeholder="123456"
              maxLength="6"
            />
          </div>
          
          <button onClick={handleVerifyOtp} className="btn-primary">
            Verify OTP
          </button>
          
          {verificationStatus && (
            <div className="status-message">{verificationStatus}</div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
