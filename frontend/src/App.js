import React, { useState } from 'react';
import './App.css';
import FileUpload from './components/FileUpload';
import OTPVerification from './components/OTPVerification';

function App() {
  const [step, setStep] = useState('upload'); // 'upload', 'verify', 'success'
  const [email, setEmail] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleFileUploaded = (userEmail, file) => {
    setEmail(userEmail);
    setUploadedFile(file);
    setStep('verify');
  };

  const handleVerificationSuccess = () => {
    setStep('success');
  };

  const handleReset = () => {
    setStep('upload');
    setEmail('');
    setUploadedFile(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>AWS Serverless File Verification POC</h1>
        <p>Upload files securely with email verification</p>
      </header>
      
      <main className="App-main">
        {step === 'upload' && (
          <FileUpload onFileUploaded={handleFileUploaded} />
        )}
        
        {step === 'verify' && (
          <OTPVerification 
            email={email} 
            onVerificationSuccess={handleVerificationSuccess}
            onCancel={handleReset}
          />
        )}
        
        {step === 'success' && (
          <div className="success-container">
            <h2>✓ Verification Successful</h2>
            <p>Your file has been uploaded and verified successfully!</p>
            <p>File: {uploadedFile?.name}</p>
            <button onClick={handleReset} className="btn btn-primary">
              Upload Another File
            </button>
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
