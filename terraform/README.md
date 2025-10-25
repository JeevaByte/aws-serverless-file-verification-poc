# Terraform Infrastructure

This directory contains Terraform configuration for deploying the AWS serverless file verification infrastructure.

## Overview

The infrastructure includes:
- S3 bucket for file uploads
- DynamoDB table for OTP storage
- Lambda function for OTP generation/verification
- API Gateway for REST endpoints
- IAM roles and policies
- CloudWatch logs

## Prerequisites

- Terraform >= 1.0
- AWS CLI configured with credentials
- AWS account with appropriate permissions

## Quick Start

```bash
# Initialize Terraform
terraform init

# Validate configuration
terraform validate

# Preview changes
terraform plan

# Deploy infrastructure
terraform apply

# View outputs
terraform output
```

## Configuration

### Variables

Edit `main.tf` or create `terraform.tfvars` to customize:

```hcl
aws_region   = "us-east-1"
project_name = "file-verification-poc"
```

### Available Variables

- `aws_region` (default: "us-east-1"): AWS region for resources
- `project_name` (default: "file-verification-poc"): Project name prefix

## Resources Created

### S3 Bucket
- **Name**: `{project_name}-uploads-{account_id}`
- **Purpose**: Store uploaded files
- **Features**: Versioning, encryption, lifecycle policies

### DynamoDB Table
- **Name**: `{project_name}-otp-table`
- **Purpose**: Store OTP codes with expiration
- **Key Schema**: email (hash key)
- **Billing**: Pay per request
- **TTL**: Enabled on 'expiry' attribute

### Lambda Function
- **Name**: `{project_name}-otp-generator`
- **Runtime**: Python 3.11
- **Memory**: 128 MB (default)
- **Timeout**: 30 seconds (default)
- **Handler**: otp_generator.lambda_handler

### API Gateway
- **Type**: HTTP API
- **Name**: `{project_name}-api`
- **CORS**: Configured for frontend origin

### IAM Role
- **Name**: `{project_name}-lambda-role`
- **Purpose**: Lambda execution role
- **Permissions**: DynamoDB, SES, CloudWatch Logs

## Outputs

After deployment, Terraform provides:

- `s3_bucket_name`: S3 bucket for uploads
- `dynamodb_table_name`: DynamoDB table name
- `lambda_function_name`: Lambda function name
- `api_endpoint`: API Gateway endpoint URL

## Commands

### Initialize

```bash
terraform init
```

Downloads required providers and modules.

### Plan

```bash
terraform plan
```

Shows what changes will be made.

### Apply

```bash
terraform apply
```

Creates or updates infrastructure. Requires confirmation unless `-auto-approve` is used.

### Destroy

```bash
terraform destroy
```

Removes all created resources. **Use with caution!**

### Output

```bash
# View all outputs
terraform output

# View specific output
terraform output api_endpoint
```

## State Management

### Local State

By default, Terraform stores state locally in `terraform.tfstate`.

### Remote State (Recommended for Production)

Configure S3 backend:

```hcl
terraform {
  backend "s3" {
    bucket = "my-terraform-state"
    key    = "file-verification/terraform.tfstate"
    region = "us-east-1"
    dynamodb_table = "terraform-locks"
    encrypt = true
  }
}
```

## Security Best Practices

1. **State File Security**
   - Store state in S3 with encryption
   - Enable versioning on state bucket
   - Use DynamoDB for state locking

2. **IAM Permissions**
   - Use least privilege principle
   - Avoid hardcoding credentials
   - Use AWS profiles or IAM roles

3. **Resource Encryption**
   - Enable S3 bucket encryption
   - Use encrypted DynamoDB tables
   - Enable CloudWatch log encryption

4. **Network Security**
   - Configure VPC endpoints (optional)
   - Use security groups
   - Enable VPC flow logs

## Cost Optimization

- Use S3 lifecycle policies to transition old files
- Set DynamoDB to on-demand billing
- Configure Lambda reserved concurrency if needed
- Enable S3 Intelligent-Tiering

## Troubleshooting

### Common Issues

**Issue**: `Error: AccessDenied`
- **Solution**: Check AWS credentials and IAM permissions

**Issue**: `Error: BucketAlreadyExists`
- **Solution**: S3 bucket names must be globally unique. Change project_name variable

**Issue**: Lambda deployment fails
- **Solution**: Ensure otp_generator.zip exists in lambdas directory

**Issue**: API Gateway not accessible
- **Solution**: Check CORS configuration and security group rules

## Maintenance

### Updating Lambda Code

```bash
# After updating Lambda code
cd ../lambdas
zip -r otp_generator.zip otp_generator.py

# Trigger Terraform update
cd ../terraform
terraform apply
```

### Scaling

The infrastructure auto-scales:
- Lambda: Concurrent executions (default: 1000)
- DynamoDB: On-demand capacity
- API Gateway: Auto-scaling

### Monitoring

Add CloudWatch alarms:

```hcl
resource "aws_cloudwatch_metric_alarm" "lambda_errors" {
  alarm_name          = "${var.project_name}-lambda-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name        = "Errors"
  namespace          = "AWS/Lambda"
  period             = "60"
  statistic          = "Sum"
  threshold          = "5"
  
  dimensions = {
    FunctionName = aws_lambda_function.otp_generator.function_name
  }
}
```

## Advanced Configuration

### Custom Domain

Add custom domain for API Gateway:

```hcl
resource "aws_apigatewayv2_domain_name" "api" {
  domain_name = "api.yourdomain.com"
  
  domain_name_configuration {
    certificate_arn = aws_acm_certificate.api.arn
    endpoint_type   = "REGIONAL"
    security_policy = "TLS_1_2"
  }
}
```

### Environment-Specific Workspaces

```bash
# Create workspaces
terraform workspace new dev
terraform workspace new staging
terraform workspace new prod

# Switch workspace
terraform workspace select dev

# Use workspace in config
resource "aws_s3_bucket" "uploads" {
  bucket = "${var.project_name}-${terraform.workspace}-uploads"
}
```

## References

- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS Lambda](https://docs.aws.amazon.com/lambda/)
- [API Gateway](https://docs.aws.amazon.com/apigateway/)
- [DynamoDB](https://docs.aws.amazon.com/dynamodb/)
