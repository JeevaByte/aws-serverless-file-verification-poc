# AWS Serverless File Verification POC

A proof-of-concept implementation of a serverless file upload system with email verification using One-Time Password (OTP) authentication.

## Architecture Overview

This project demonstrates a serverless architecture on AWS for handling file uploads with email-based OTP verification. The system consists of:

### Components

1. **Frontend (React)**
   - User interface for file upload
   - Email input and OTP verification forms
   - File upload progress tracking
   - Built with React for a modern, responsive experience

2. **API Gateway**
   - RESTful API endpoints for frontend communication
   - Request validation and throttling
   - Integration with Lambda functions

3. **Lambda Functions**
   - **OTP Generator**: Generates and stores OTPs for email verification
   - **OTP Validator**: Validates user-provided OTPs
   - **File Upload Handler**: Manages secure file uploads to S3
   - **Email Sender**: Sends OTP emails via SES

4. **Amazon S3**
   - Secure storage for uploaded files
   - Presigned URLs for secure uploads
   - Lifecycle policies for data retention

5. **Amazon SES (Simple Email Service)**
   - Sends verification emails with OTP codes
   - Email templates for consistent branding

6. **Amazon DynamoDB**
   - Stores OTP codes with TTL (Time To Live)
   - Tracks verification status
   - User session management

### Workflow

1. User enters email address in the frontend
2. System generates OTP and stores it in DynamoDB
3. OTP is sent to user's email via SES
4. User enters OTP to verify email
5. Upon successful verification, user can upload files
6. Files are securely uploaded to S3 with presigned URLs
7. Upload confirmation is displayed to user

## Project Structure

```
.
├── frontend/           # React frontend application
│   ├── src/
│   │   └── App.js     # Main application component
│   └── package.json   # NPM dependencies
├── lambdas/           # AWS Lambda functions
│   └── otp_generator.py  # OTP generation Lambda
├── terraform/         # Infrastructure as Code
│   └── main.tf       # Terraform configuration
└── README.md         # This file
```

## Prerequisites

- Node.js 16.x or higher
- Python 3.9 or higher
- Terraform 1.0 or higher
- AWS CLI configured with appropriate credentials
- AWS account with permissions for Lambda, S3, DynamoDB, SES, and API Gateway

## Setup Instructions

### 1. Frontend Setup

```bash
cd frontend
npm install
npm start
```

The React app will start on `http://localhost:3000`

### 2. Lambda Functions Setup

Lambda functions are written in Python and will be deployed via Terraform.

To test locally:
```bash
cd lambdas
python3 -m pip install -r requirements.txt
python3 otp_generator.py
```

### 3. Infrastructure Setup with Terraform

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

**Note**: Before running `terraform apply`, ensure you:
- Configure AWS credentials via AWS CLI or environment variables
- Update variables in `main.tf` for your specific environment
- Verify SES email addresses in AWS console

### 4. Environment Configuration

Create environment-specific configuration files (not tracked in git):
- `.env` for frontend environment variables
- `terraform.tfvars` for Terraform variables

**Important**: Never commit credentials, API keys, or sensitive data to the repository.

## Security Considerations

- All credentials should be stored in AWS Secrets Manager or Parameter Store
- Use IAM roles with least privilege principle
- Enable encryption at rest for S3 and DynamoDB
- Implement API rate limiting and throttling
- Use HTTPS/TLS for all communications
- Implement CORS policies appropriately
- Set appropriate TTL for OTPs (e.g., 5-10 minutes)

## Development

### Running Tests

```bash
# Frontend tests
cd frontend
npm test

# Lambda function tests
cd lambdas
python3 -m pytest
```

### Local Development

For local development, consider using:
- AWS SAM CLI for local Lambda testing
- LocalStack for local AWS service emulation
- React development server for frontend

## Deployment

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Deploy infrastructure:
   ```bash
   cd terraform
   terraform apply
   ```

3. Deploy Lambda functions (automated via Terraform)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This is a proof-of-concept project for educational purposes.

## Support

For questions or issues, please open an issue in the GitHub repository.
