# Validation & Testing Guide

This guide provides instructions for validating and testing the AWS Serverless File Verification POC.

## Automated Validation

### 1. Terraform Validation

```bash
cd terraform
terraform init
terraform validate
terraform fmt -check
```

Expected output: Configuration is valid

### 2. Python Lambda Validation

```bash
cd lambdas

# Syntax check
python3 -m py_compile otp_generator.py

# Install dependencies
pip install -r requirements.txt

# Run basic unit tests (if you add them)
pytest test_otp_generator.py
```

### 3. Frontend Validation

```bash
cd frontend

# Install dependencies
npm install

# Run linting
npm run lint  # if ESLint is configured

# Run tests
npm test

# Build for production
npm run build
```

Expected output: Build succeeds without errors

## Manual Testing

### Test 1: File Upload Flow

1. Start the frontend:
   ```bash
   cd frontend
   npm install
   npm start
   ```

2. Open browser to `http://localhost:3000`

3. Test the upload form:
   - Enter a valid email address
   - Select a file (< 10MB)
   - Click "Upload & Send OTP"
   - Verify navigation to OTP verification screen

### Test 2: OTP Verification Flow

1. On the OTP verification screen:
   - Enter a 6-digit code
   - Click "Verify"
   - Verify success message appears

2. Test "Resend OTP" functionality

3. Test "Cancel" to return to upload screen

### Test 3: Form Validation

1. **Email Validation**:
   - Try invalid email formats
   - Verify error messages appear

2. **File Validation**:
   - Try uploading without selecting a file
   - Try uploading a file > 10MB
   - Verify appropriate error messages

### Test 4: UI/UX

1. Test responsive design:
   - Desktop (1920x1080)
   - Tablet (768x1024)
   - Mobile (375x667)

2. Test browser compatibility:
   - Chrome
   - Firefox
   - Safari
   - Edge

## Integration Testing

### Test with AWS Services

1. **Deploy Infrastructure**:
   ```bash
   cd terraform
   terraform apply
   ```

2. **Test Lambda Function**:
   ```bash
   # Generate OTP
   aws lambda invoke \
     --function-name file-verification-poc-otp-generator \
     --payload '{"action":"generate","email":"test@example.com"}' \
     response.json
   
   # Verify OTP
   aws lambda invoke \
     --function-name file-verification-poc-otp-generator \
     --payload '{"action":"verify","email":"test@example.com","otp":"123456"}' \
     response.json
   ```

3. **Test S3 Upload**:
   ```bash
   aws s3 cp test-file.txt s3://file-verification-poc-uploads-{account-id}/
   aws s3 ls s3://file-verification-poc-uploads-{account-id}/
   ```

4. **Test DynamoDB**:
   ```bash
   aws dynamodb scan --table-name file-verification-poc-otp-table
   ```

5. **Test API Gateway**:
   ```bash
   curl -X POST https://{api-id}.execute-api.us-east-1.amazonaws.com/otp/generate \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com"}'
   ```

## End-to-End Testing

### Complete Flow Test

1. Deploy all infrastructure with Terraform
2. Configure SES and verify email addresses
3. Update frontend environment variables with API endpoint
4. Build and deploy frontend
5. Test complete user flow:
   - Upload file
   - Receive OTP email
   - Verify OTP
   - Confirm file stored in S3

## Performance Testing

### Lambda Performance

```bash
# Test Lambda cold start
aws lambda invoke --function-name file-verification-poc-otp-generator \
  --payload '{"action":"generate","email":"test@example.com"}' \
  --log-type Tail response.json | grep Duration

# Test Lambda warm start (run multiple times)
for i in {1..10}; do
  aws lambda invoke --function-name file-verification-poc-otp-generator \
    --payload '{"action":"generate","email":"test@example.com"}' \
    --log-type Tail response.json | grep Duration
done
```

### API Gateway Performance

```bash
# Use Apache Bench for load testing
ab -n 100 -c 10 -p payload.json -T application/json \
  https://{api-id}.execute-api.us-east-1.amazonaws.com/otp/generate
```

## Security Testing

### 1. Input Validation
- Test SQL injection attempts
- Test XSS attempts
- Test path traversal attempts

### 2. Authentication
- Verify OTP expiration (10 minutes)
- Test OTP reuse prevention
- Test rate limiting

### 3. CORS Configuration
- Test cross-origin requests
- Verify only allowed origins accepted

### 4. Data Encryption
- Verify S3 encryption at rest
- Verify HTTPS in transit
- Verify DynamoDB encryption

## Monitoring & Logs

### CloudWatch Logs

```bash
# View Lambda logs
aws logs tail /aws/lambda/file-verification-poc-otp-generator --follow

# View API Gateway logs
aws logs tail /aws/apigateway/file-verification-poc-api --follow
```

### CloudWatch Metrics

Monitor:
- Lambda invocations
- Lambda errors
- Lambda duration
- API Gateway 4XX/5XX errors
- DynamoDB read/write capacity

## Troubleshooting Tests

### Common Test Failures

1. **Frontend build fails**:
   - Check Node.js version (>= 16)
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall

2. **Lambda test fails**:
   - Check Python version (>= 3.11)
   - Verify boto3 is installed
   - Check IAM permissions

3. **Terraform apply fails**:
   - Check AWS credentials
   - Verify region availability
   - Check for existing resources

## Test Coverage Goals

- Unit tests: > 80% coverage
- Integration tests: All major flows
- E2E tests: Critical user paths
- Performance tests: All endpoints
- Security tests: OWASP Top 10

## Continuous Integration

Example GitHub Actions workflow:

```yaml
name: CI/CD

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Setup Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.11'
      
      - name: Test Frontend
        run: |
          cd frontend
          npm install
          npm test
          npm run build
      
      - name: Test Lambda
        run: |
          cd lambdas
          pip install -r requirements.txt
          python -m py_compile otp_generator.py
      
      - name: Validate Terraform
        uses: hashicorp/setup-terraform@v1
        with:
          terraform_version: 1.0.0
      - run: |
          cd terraform
          terraform init
          terraform validate
```

## Next Steps

After validation:
1. Create comprehensive unit tests
2. Add integration test suite
3. Implement E2E testing with Cypress
4. Set up CI/CD pipeline
5. Configure monitoring and alerting
6. Perform security audit
7. Conduct load testing
8. Document test results
