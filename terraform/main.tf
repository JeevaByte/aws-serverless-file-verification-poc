# AWS Serverless File Verification POC - Terraform Configuration

# Configure AWS Provider
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
# TODO: Implement S3 bucket with appropriate policies

# Lambda Functions
# TODO: Implement Lambda for OTP generation
# TODO: Implement Lambda for email verification

# API Gateway
# TODO: Implement API Gateway for REST endpoints

# DynamoDB Tables
# TODO: Implement DynamoDB for OTP storage

# SES Configuration
# TODO: Implement SES for email sending
