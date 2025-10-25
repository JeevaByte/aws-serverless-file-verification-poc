# AWS Serverless File Verification POC - Terraform Configuration

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

# S3 Bucket for file uploads
resource "aws_s3_bucket" "file_uploads" {
  bucket = "${var.project_name}-uploads-${data.aws_caller_identity.current.account_id}"
  
  tags = {
    Name        = "File Uploads Bucket"
    Project     = var.project_name
  }
}

# DynamoDB table for OTP storage
resource "aws_dynamodb_table" "otp_table" {
  name           = "${var.project_name}-otp-table"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "email"
  
  attribute {
    name = "email"
    type = "S"
  }
  
  ttl {
    attribute_name = "expiry"
    enabled        = true
  }
  
  tags = {
    Name        = "OTP Table"
    Project     = var.project_name
  }
}

# IAM Role for Lambda
resource "aws_iam_role" "lambda_role" {
  name = "${var.project_name}-lambda-role"

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
    Name        = "Lambda Execution Role"
    Project     = var.project_name
  }
}

# Lambda function placeholder
resource "aws_lambda_function" "otp_generator" {
  filename      = "../lambdas/otp_generator.zip"
  function_name = "${var.project_name}-otp-generator"
  role          = aws_iam_role.lambda_role.arn
  handler       = "otp_generator.lambda_handler"
  runtime       = "python3.11"
  
  environment {
    variables = {
      OTP_TABLE_NAME = aws_dynamodb_table.otp_table.name
    }
  }
  
  tags = {
    Name        = "OTP Generator Lambda"
    Project     = var.project_name
  }
}

# API Gateway (stub for future expansion)
resource "aws_apigatewayv2_api" "api" {
  name          = "${var.project_name}-api"
  protocol_type = "HTTP"
  
  tags = {
    Name        = "File Verification API"
    Project     = var.project_name
  }
}

# Data source for AWS account ID
data "aws_caller_identity" "current" {}

# Outputs
output "s3_bucket_name" {
  description = "Name of the S3 bucket for file uploads"
  value       = aws_s3_bucket.file_uploads.id
}

output "dynamodb_table_name" {
  description = "Name of the DynamoDB table for OTP storage"
  value       = aws_dynamodb_table.otp_table.name
}

output "lambda_function_name" {
  description = "Name of the OTP generator Lambda function"
  value       = aws_lambda_function.otp_generator.function_name
}

output "api_endpoint" {
  description = "API Gateway endpoint URL"
  value       = aws_apigatewayv2_api.api.api_endpoint
}
