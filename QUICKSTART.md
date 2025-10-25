# Quick Start Guide

Get the AWS Serverless File Verification POC up and running in minutes!

## Prerequisites

Before you begin, ensure you have:

- ✅ AWS Account
- ✅ AWS CLI installed and configured
- ✅ Terraform >= 1.0
- ✅ Node.js >= 16.x
- ✅ Python >= 3.11

## 5-Minute Setup

### Step 1: Clone Repository

```bash
# Replace with your repository URL if you've forked this project
git clone https://github.com/YOUR_USERNAME/aws-serverless-file-verification-poc.git
cd aws-serverless-file-verification-poc
```

### Step 2: Deploy Infrastructure

```bash
cd terraform
terraform init
terraform apply -auto-approve
```

Save the output values (API endpoint, bucket name, etc.)

### Step 3: Configure SES

```bash
# Verify your email address
aws ses verify-email-identity --email-address your@email.com

# Check verification status
aws ses get-identity-verification-attributes --identities your@email.com
```

Check your email and click the verification link.

### Step 4: Setup Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Create environment file
cat > .env.local << EOF
REACT_APP_API_ENDPOINT=https://your-api-id.execute-api.us-east-1.amazonaws.com
EOF

# Start development server
npm start
```

### Step 5: Test the Application

1. Open browser to `http://localhost:3000`
2. Enter your verified email address
3. Select a test file
4. Click "Upload & Send OTP"
5. Check your email for OTP
6. Enter OTP and verify

🎉 **Success!** Your POC is now running!

## What's Next?

### For Development

- Read [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines
- Check [TESTING.md](TESTING.md) for testing procedures
- Review [ARCHITECTURE.md](ARCHITECTURE.md) for system details

### For Production

1. **Move SES out of sandbox mode**:
   - Request production access in AWS Console
   - Configure DKIM and SPF records

2. **Add custom domain**:
   - Register domain in Route 53
   - Configure CloudFront distribution
   - Set up SSL certificate

3. **Enable monitoring**:
   - Configure CloudWatch dashboards
   - Set up alarms
   - Enable X-Ray tracing

4. **Implement CI/CD**:
   - Set up GitHub Actions
   - Configure automated testing
   - Automate deployments

## Common Commands

### Infrastructure

```bash
# View infrastructure
terraform show

# Update infrastructure
terraform apply

# Destroy infrastructure
terraform destroy
```

### Frontend

```bash
# Development server
npm start

# Production build
npm run build

# Run tests
npm test
```

### Lambda

```bash
# Test Lambda locally
aws lambda invoke \
  --function-name file-verification-poc-otp-generator \
  --payload '{"action":"generate","email":"test@example.com"}' \
  response.json

# View logs
aws logs tail /aws/lambda/file-verification-poc-otp-generator --follow
```

### Monitoring

```bash
# View CloudWatch metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Invocations \
  --dimensions Name=FunctionName,Value=file-verification-poc-otp-generator \
  --statistics Sum \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-02T00:00:00Z \
  --period 3600
```

## Troubleshooting

### Issue: SES email not received

**Solution**: 
1. Verify email in SES console
2. Check spam/junk folder
3. Review SES sending statistics
4. Check Lambda CloudWatch logs

### Issue: Frontend can't connect to API

**Solution**:
1. Verify API endpoint in `.env.local`
2. Check CORS configuration in API Gateway
3. Ensure API Gateway is deployed
4. Check browser console for errors

### Issue: Terraform apply fails

**Solution**:
1. Check AWS credentials: `aws sts get-caller-identity`
2. Verify IAM permissions
3. Check for resource naming conflicts
4. Review Terraform error messages

### Issue: Lambda timeout

**Solution**:
1. Increase timeout in Terraform config
2. Optimize Lambda code
3. Check DynamoDB connection
4. Review CloudWatch logs for bottlenecks

## Architecture Overview

```
User → React App → API Gateway → Lambda → DynamoDB/S3/SES
```

- **React App**: User interface
- **API Gateway**: RESTful API endpoints
- **Lambda**: Business logic (OTP generation/verification)
- **DynamoDB**: OTP storage with TTL
- **S3**: File storage
- **SES**: Email delivery

## Cost Estimate

For 10,000 monthly users:
- **~$2.00/month** in AWS free tier
- **~$5-10/month** after free tier

Most costs from:
- SES email sending
- S3 storage
- Lambda invocations

## Getting Help

- 📖 [Full Documentation](README.md)
- 🏗️ [Architecture Details](ARCHITECTURE.md)
- 🧪 [Testing Guide](TESTING.md)
- 🤝 [Contributing Guide](CONTRIBUTING.md)
- 🐛 [Report Issues](https://github.com/JeevaByte/aws-serverless-file-verification-poc/issues)

## Next Steps

1. ✅ Test the basic flow
2. ✅ Review the code
3. ✅ Customize for your needs
4. ✅ Deploy to production
5. ✅ Share your feedback

Happy building! 🚀
