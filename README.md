# AWS Serverless File Verification POC

AWS serverless architecture POC for file upload with email verification using OTP.

## Architecture Overview

This project demonstrates a serverless file verification system using AWS services:

```
┌─────────────┐
│   React     │
│  Frontend   │
└──────┬──────┘
       │
       ├─────────────────────┐
       │                     │
       ▼                     ▼
┌─────────────┐      ┌─────────────┐
│  API Gateway│      │     S3      │
└──────┬──────┘      │   Bucket    │
       │             │ (File Store)│
       │             └─────────────┘
       ▼
┌─────────────┐
│   Lambda    │
│OTP Generator│
└──────┬──────┘
       │
       ├─────────────────────┐
       │                     │
       ▼                     ▼
┌─────────────┐      ┌─────────────┐
│  DynamoDB   │      │     SES     │
│ (OTP Store) │      │(Email Send) │
└─────────────┘      └─────────────┘
```

### Components

1. **Frontend (React)**
   - User interface for file upload
   - Email input and file selection
   - OTP verification interface
   - Status notifications

2. **API Gateway**
   - RESTful API endpoints
   - Request validation
   - CORS configuration

3. **Lambda Functions**
   - OTP generation and validation
   - Email verification logic
   - Integration with DynamoDB and SES

4. **S3 Bucket**
   - Secure file storage
   - Lifecycle policies
   - Access controls

5. **DynamoDB**
   - OTP storage with TTL
   - Email-based lookup
   - Automatic expiration

6. **SES (Simple Email Service)**
   - Email delivery
   - OTP transmission
   - Bounce handling

## Project Structure

```
aws-serverless-file-verification-poc/
├── README.md                 # This file
├── .gitignore               # Git ignore patterns
├── terraform/               # Infrastructure as Code
│   └── main.tf             # Terraform configuration
├── lambdas/                # Lambda functions
│   ├── otp_generator.py    # OTP generation/verification
│   └── requirements.txt    # Python dependencies
└── frontend/               # React application
    ├── package.json        # Node dependencies
    ├── public/             # Static assets
    └── src/                # React components
        ├── App.js          # Main application
        ├── App.css         # App styles
        ├── index.js        # Entry point
        ├── index.css       # Global styles
        └── components/     # React components
            ├── FileUpload.js
            ├── FileUpload.css
            ├── OTPVerification.js
            └── OTPVerification.css
```

## Features

- ✅ Serverless architecture using AWS services
- ✅ Email-based OTP verification
- ✅ Secure file upload to S3
- ✅ Time-limited OTP (10 minutes expiry)
- ✅ Infrastructure as Code with Terraform
- ✅ Modern React frontend
- ✅ Responsive UI design

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI configured
- Terraform >= 1.0
- Node.js >= 16.x
- Python >= 3.11
- npm or yarn

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/JeevaByte/aws-serverless-file-verification-poc.git
cd aws-serverless-file-verification-poc
```

### 2. Deploy Infrastructure with Terraform

```bash
cd terraform

# Initialize Terraform
terraform init

# Review the deployment plan
terraform plan

# Deploy infrastructure
terraform apply

# Note the outputs (API endpoint, S3 bucket, etc.)
```

### 3. Deploy Lambda Function

```bash
cd ../lambdas

# Install dependencies
pip install -r requirements.txt -t .

# Create deployment package
zip -r otp_generator.zip otp_generator.py boto3 botocore

# Deploy using AWS CLI or Terraform will handle this
```

### 4. Configure SES (Email Service)

```bash
# Verify sender email address
aws ses verify-email-identity --email-address noreply@yourdomain.com

# For production, move out of SES sandbox:
# - Request production access in AWS Console
# - Configure DKIM and SPF records
```

### 5. Setup Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Create environment file
cat > .env.local << EOF
REACT_APP_API_ENDPOINT=<your-api-gateway-endpoint>
REACT_APP_S3_BUCKET=<your-s3-bucket-name>
EOF

# Start development server
npm start
```

The frontend will be available at `http://localhost:3000`

### 6. Build Frontend for Production

```bash
cd frontend

# Create production build
npm run build

# Deploy to S3 or CloudFront
aws s3 sync build/ s3://your-frontend-bucket/ --delete
```

## Usage

1. **Upload File**
   - Navigate to the frontend URL
   - Enter your email address
   - Select a file (max 10MB)
   - Click "Upload & Send OTP"

2. **Verify Email**
   - Check your email for the OTP code
   - Enter the 6-digit code
   - Click "Verify"

3. **Success**
   - File is verified and stored securely
   - Confirmation message displayed

## API Endpoints

### Generate OTP
```
POST /otp/generate
Body: {
  "email": "user@example.com"
}
```

### Verify OTP
```
POST /otp/verify
Body: {
  "email": "user@example.com",
  "otp": "123456"
}
```

## Configuration

### Environment Variables (Lambda)

- `OTP_TABLE_NAME`: DynamoDB table name for OTP storage
- `AWS_REGION`: AWS region (default: us-east-1)

### Environment Variables (Frontend)

- `REACT_APP_API_ENDPOINT`: API Gateway endpoint URL
- `REACT_APP_S3_BUCKET`: S3 bucket name for uploads

## Security Considerations

1. **OTP Expiry**: OTPs expire after 10 minutes
2. **HTTPS**: All communication over HTTPS
3. **CORS**: Configured for specific origins only
4. **IAM Roles**: Least privilege access
5. **S3 Encryption**: Server-side encryption enabled
6. **Input Validation**: Email and file validation

## Development

### Running Tests

```bash
# Frontend tests
cd frontend
npm test

# Lambda tests (add pytest)
cd lambdas
pytest
```

### Local Development

For local development, you can use:
- **LocalStack** for AWS services
- **SAM CLI** for Lambda testing
- **React Dev Server** for frontend

## Cost Estimation

This POC uses AWS free tier eligible services:
- Lambda: 1M requests/month free
- DynamoDB: 25GB storage free
- S3: 5GB storage free
- SES: 62,000 emails/month (from EC2)
- API Gateway: 1M requests/month free (first 12 months)

## Troubleshooting

### Common Issues

1. **SES Sandbox Mode**
   - Only verified emails can receive messages
   - Request production access for unrestricted sending

2. **CORS Errors**
   - Configure API Gateway CORS settings
   - Check frontend environment variables

3. **Lambda Timeout**
   - Increase timeout in Terraform configuration
   - Check CloudWatch logs for errors

4. **OTP Not Received**
   - Verify email address in SES
   - Check spam/junk folder
   - Review SES sending statistics

## Future Enhancements

- [ ] Add file type validation
- [ ] Implement file scanning (antivirus)
- [ ] Add user authentication (Cognito)
- [ ] Support multiple file uploads
- [ ] Add file download with verification
- [ ] Implement rate limiting
- [ ] Add monitoring and alerting
- [ ] Create CI/CD pipeline

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Author

JeevaByte

## Acknowledgments

- AWS Serverless Application Model
- React Documentation
- Terraform AWS Provider
