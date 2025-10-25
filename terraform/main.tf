# AWS Provider Configuration
terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
  
  # Authentication is handled via AWS CLI, environment variables, or IAM roles
  # Never hardcode credentials here
}

# Variables
variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "file-verification-poc"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "dev"
}

# DynamoDB Table for OTP Storage
resource "aws_dynamodb_table" "otp_table" {
  name           = "${var.project_name}-otp-${var.environment}"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "email"
  
  attribute {
    name = "email"
    type = "S"
  }
  
  ttl {
    attribute_name = "expiry_time"
    enabled        = true
  }
  
  tags = {
    Name        = "${var.project_name}-otp-table"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# S3 Bucket for File Storage
resource "aws_s3_bucket" "file_storage" {
  bucket = "${var.project_name}-files-${var.environment}-${data.aws_caller_identity.current.account_id}"
  
  tags = {
    Name        = "${var.project_name}-file-storage"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# S3 Bucket Versioning
resource "aws_s3_bucket_versioning" "file_storage_versioning" {
  bucket = aws_s3_bucket.file_storage.id
  
  versioning_configuration {
    status = "Enabled"
  }
}

# S3 Bucket Encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "file_storage_encryption" {
  bucket = aws_s3_bucket.file_storage.id
  
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# S3 Bucket Public Access Block
resource "aws_s3_bucket_public_access_block" "file_storage_public_access_block" {
  bucket = aws_s3_bucket.file_storage.id
  
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# IAM Role for Lambda Functions
resource "aws_iam_role" "lambda_role" {
  name = "${var.project_name}-lambda-role-${var.environment}"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
  
  tags = {
    Name        = "${var.project_name}-lambda-role"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# IAM Policy for Lambda Functions
resource "aws_iam_role_policy" "lambda_policy" {
  name = "${var.project_name}-lambda-policy-${var.environment}"
  role = aws_iam_role.lambda_role.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem",
          "dynamodb:GetItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = aws_dynamodb_table.otp_table.arn
      },
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject"
        ]
        Resource = "${aws_s3_bucket.file_storage.arn}/*"
      },
      {
        Effect = "Allow"
        Action = [
          "ses:SendEmail",
          "ses:SendRawEmail"
        ]
        Resource = "*"
      }
    ]
  })
}

# Lambda Function - OTP Generator (Placeholder)
resource "aws_lambda_function" "otp_generator" {
  filename         = "${path.module}/../lambdas/otp_generator.zip"
  function_name    = "${var.project_name}-otp-generator-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "otp_generator.lambda_handler"
  source_code_hash = fileexists("${path.module}/../lambdas/otp_generator.zip") ? filebase64sha256("${path.module}/../lambdas/otp_generator.zip") : null
  runtime         = "python3.9"
  timeout         = 30
  
  environment {
    variables = {
      DYNAMODB_TABLE = aws_dynamodb_table.otp_table.name
      ENVIRONMENT    = var.environment
    }
  }
  
  tags = {
    Name        = "${var.project_name}-otp-generator"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# API Gateway REST API
resource "aws_api_gateway_rest_api" "main" {
  name        = "${var.project_name}-api-${var.environment}"
  description = "API Gateway for File Verification POC"
  
  tags = {
    Name        = "${var.project_name}-api"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# Data source for current AWS account
data "aws_caller_identity" "current" {}

# Outputs
output "dynamodb_table_name" {
  description = "DynamoDB table name for OTP storage"
  value       = aws_dynamodb_table.otp_table.name
}

output "s3_bucket_name" {
  description = "S3 bucket name for file storage"
  value       = aws_s3_bucket.file_storage.id
}

output "lambda_role_arn" {
  description = "IAM role ARN for Lambda functions"
  value       = aws_iam_role.lambda_role.arn
}

output "api_gateway_id" {
  description = "API Gateway REST API ID"
  value       = aws_api_gateway_rest_api.main.id
}
