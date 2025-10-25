# Lambda Functions

This directory contains AWS Lambda functions for the file verification POC.

## otp_generator.py

The main Lambda function that handles OTP generation and verification.

### Features

- Generate random 6-digit OTP codes
- Store OTPs in DynamoDB with expiration
- Verify OTPs against stored values
- Send OTPs via AWS SES (email)

### Function Handler

```python
lambda_handler(event, context)
```

### Input Format

**Generate OTP:**
```json
{
  "action": "generate",
  "email": "user@example.com"
}
```

**Verify OTP:**
```json
{
  "action": "verify",
  "email": "user@example.com",
  "otp": "123456"
}
```

### Output Format

**Generate Response:**
```json
{
  "statusCode": 200,
  "body": {
    "message": "OTP generated successfully",
    "otp": "123456",
    "email": "user@example.com",
    "expiry_minutes": 10
  }
}
```

**Verify Response:**
```json
{
  "statusCode": 200,
  "body": {
    "verified": true,
    "message": "OTP verified successfully"
  }
}
```

### Environment Variables

- `OTP_TABLE_NAME`: DynamoDB table name (default: file-verification-poc-otp-table)

### Deployment

#### Create Deployment Package

```bash
# Install dependencies
pip install -r requirements.txt -t .

# Create ZIP file
zip -r otp_generator.zip otp_generator.py boto3 botocore
```

#### Deploy with AWS CLI

```bash
aws lambda update-function-code \
  --function-name file-verification-poc-otp-generator \
  --zip-file fileb://otp_generator.zip
```

#### Deploy with Terraform

The function is automatically deployed when running `terraform apply`.

### Testing

#### Local Testing

```python
import otp_generator

# Test OTP generation
event = {
    "action": "generate",
    "email": "test@example.com"
}
result = otp_generator.lambda_handler(event, None)
print(result)
```

#### AWS Console Testing

Use the Lambda console test feature with the input formats above.

### IAM Permissions Required

- `dynamodb:PutItem` - Store OTP
- `dynamodb:GetItem` - Retrieve OTP
- `dynamodb:DeleteItem` - Remove verified OTP
- `ses:SendEmail` - Send OTP via email
- `logs:CreateLogGroup` - CloudWatch logging
- `logs:CreateLogStream` - CloudWatch logging
- `logs:PutLogEvents` - CloudWatch logging

### Security Notes

1. **Production Warning**: Remove OTP from response in production
2. **Rate Limiting**: Implement rate limiting for OTP generation
3. **Email Validation**: Validate email format before processing
4. **TTL Configuration**: DynamoDB TTL automatically removes expired OTPs
5. **SES Sandbox**: Configure SES production access for unrestricted sending

### Error Handling

The function handles various error scenarios:
- Missing required parameters
- Invalid email format
- DynamoDB errors
- SES sending errors
- Expired OTPs
- Invalid OTPs

### Monitoring

Monitor the function using:
- CloudWatch Logs for detailed execution logs
- CloudWatch Metrics for performance metrics
- X-Ray for distributed tracing (optional)

### Future Improvements

- Add input validation with regex
- Implement retry logic for SES failures
- Add structured logging
- Support SMS OTP delivery
- Add rate limiting per email
- Implement OTP attempt tracking
