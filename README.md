# AWS Serverless File Verification POC

AWS serverless architecture proof of concept for file upload with email verification using One-Time Password (OTP).

## Architecture Overview

This POC demonstrates a serverless file verification system built on AWS services:

### Components

1. **Frontend (React)**
   - User interface for file upload
   - Email input and OTP verification
   - Built with React 18 and Axios for API calls

2. **API Gateway**
   - RESTful API endpoints for file upload and OTP verification
   - CORS-enabled for frontend integration

3. **AWS Lambda Functions**
   - **OTP Generator**: Generates and stores time-limited OTPs
   - **File Upload Handler**: Manages S3 file uploads
   - **OTP Verifier**: Validates user-submitted OTPs

4. **S3 Bucket**
   - Secure storage for uploaded files
   - Pre-signed URLs for direct uploads

5. **DynamoDB**
   - OTP storage with TTL (Time To Live)
   - User session management

6. **Amazon SES (Simple Email Service)**
   - Sends OTP verification emails
   - Email templates for consistent branding

### Architecture Flow

```
User → Frontend → API Gateway → Lambda (OTP Generator) → DynamoDB
                                                        ↓
                                                      SES → Email

User → Frontend → API Gateway → Lambda (File Upload) → S3

User → Frontend → API Gateway → Lambda (OTP Verifier) → DynamoDB
```

## Project Structure

```
aws-serverless-file-verification-poc/
├── terraform/          # Infrastructure as Code
│   └── main.tf        # Terraform configuration for AWS resources
├── lambdas/           # Lambda function code
│   └── otp_generator.py  # OTP generation Lambda
├── frontend/          # React application
│   ├── package.json   # Frontend dependencies
│   └── src/
│       └── App.js     # Main React component
└── README.md          # This file
```

## Setup Instructions

### Prerequisites

- AWS Account with appropriate permissions
- AWS CLI configured with credentials
- Terraform >= 1.0
- Node.js >= 16.x
- Python >= 3.9

### 1. Infrastructure Deployment

```bash
# Navigate to terraform directory
cd terraform

# Initialize Terraform
terraform init

# Review planned changes
terraform plan

# Apply infrastructure changes
terraform apply
```

### 2. Lambda Deployment

```bash
# Navigate to lambdas directory
cd lambdas

# Package Lambda function
zip -r otp_generator.zip otp_generator.py

# Deploy using AWS CLI (replace with your function name)
aws lambda update-function-code \
  --function-name otp-generator \
  --zip-file fileb://otp_generator.zip
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file with API Gateway endpoint
echo "REACT_APP_API_ENDPOINT=<your-api-gateway-url>" > .env

# Start development server
npm start

# Build for production
npm run build
```

### 4. Environment Configuration

Ensure the following environment variables are set:

**Lambda Functions:**
- `OTP_EXPIRATION_MINUTES`: OTP validity period (default: 10)
- `DYNAMODB_TABLE_NAME`: DynamoDB table for OTP storage
- `SES_SENDER_EMAIL`: Verified SES sender email address

**Frontend:**
- `REACT_APP_API_ENDPOINT`: API Gateway base URL

## Security Best Practices

- ⚠️ **Never commit AWS credentials or secrets to version control**
- Use AWS Secrets Manager or Parameter Store for sensitive data
- Enable S3 bucket encryption
- Implement API Gateway request throttling
- Use IAM roles with least privilege principle
- Enable CloudWatch logging for all Lambda functions
- Implement CORS policies appropriately

## Testing

1. Access the frontend application
2. Enter your email address
3. Select a file to upload
4. Click "Upload File" - you'll receive an OTP via email
5. Enter the OTP to verify your email
6. File upload completes upon successful verification

## TODO - Future Enhancements

- [ ] Complete Terraform resource definitions
- [ ] Implement DynamoDB OTP storage in Lambda
- [ ] Configure SES email sending
- [ ] Add API Gateway endpoints configuration
- [ ] Implement file upload Lambda function
- [ ] Add OTP verification Lambda function
- [ ] Create CloudWatch alarms and monitoring
- [ ] Add unit tests for Lambda functions
- [ ] Implement frontend error handling
- [ ] Add loading states and better UX
- [ ] Configure CloudFront for frontend hosting

## Contributing

This is a POC project. Feel free to fork and extend functionality.

## License

This project is provided as-is for demonstration purposes.
