# Architecture Documentation

## System Architecture

### High-Level Overview

The AWS Serverless File Verification POC implements a secure, scalable file upload system with email-based OTP verification.

```
┌──────────────────────────────────────────────────────────────┐
│                         User Browser                          │
│                      (React Frontend)                         │
└───────────────────┬──────────────────────────────────────────┘
                    │
                    │ HTTPS
                    │
┌───────────────────┴──────────────────────────────────────────┐
│                      AWS Cloud                                │
│                                                                │
│  ┌──────────────┐           ┌──────────────┐                │
│  │   CloudFront │           │  API Gateway │                 │
│  │  (Optional)  │──────────▶│   (HTTP API) │                 │
│  └──────────────┘           └──────┬───────┘                 │
│                                     │                          │
│                    ┌────────────────┼────────────────┐        │
│                    │                │                │         │
│                    ▼                ▼                ▼         │
│            ┌──────────────┐ ┌──────────────┐ ┌─────────────┐│
│            │    Lambda    │ │    Lambda    │ │   Lambda    ││
│            │  (Generate   │ │   (Verify    │ │  (Upload    ││
│            │     OTP)     │ │     OTP)     │ │   Handler)  ││
│            └──────┬───────┘ └──────┬───────┘ └──────┬──────┘│
│                   │                │                │         │
│         ┌─────────┴────────┬───────┴────────┐       │        │
│         │                  │                │       │         │
│         ▼                  ▼                ▼       ▼         │
│  ┌──────────────┐   ┌──────────────┐  ┌──────────────┐     │
│  │  DynamoDB    │   │     SES      │  │      S3      │      │
│  │ (OTP Store)  │   │ (Email Send) │  │  (Files)     │      │
│  └──────────────┘   └──────────────┘  └──────────────┘      │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Frontend (React SPA)

**Purpose**: User interface for file upload and verification

**Technology Stack**:
- React 18.x
- React Hooks (useState, useEffect)
- Axios for API calls
- CSS3 for styling

**Components**:
- `App.js` - Main application container
- `FileUpload.js` - File selection and email input
- `OTPVerification.js` - OTP input and verification

**Key Features**:
- Responsive design
- Form validation
- Error handling
- Loading states
- User feedback

### 2. API Gateway (HTTP API)

**Purpose**: RESTful API endpoints for frontend communication

**Configuration**:
- Type: HTTP API (cheaper and faster than REST API)
- Protocol: HTTPS only
- CORS: Configured for frontend origin
- Throttling: 10,000 requests per second
- Auth: Optional (can add JWT/Cognito)

**Endpoints**:
```
POST /otp/generate    - Generate new OTP
POST /otp/verify      - Verify OTP
POST /file/upload     - Upload file with pre-signed URL
GET  /file/status     - Check file upload status
```

### 3. Lambda Functions

#### 3.1 OTP Generator Lambda

**Purpose**: Generate and store OTP codes

**Runtime**: Python 3.11
**Memory**: 128 MB
**Timeout**: 30 seconds
**Concurrency**: 100 (configurable)

**Process Flow**:
1. Receive email from API Gateway
2. Generate 6-digit random OTP
3. Store OTP in DynamoDB with 10-minute TTL
4. Send OTP via SES
5. Return success response

**Environment Variables**:
- `OTP_TABLE_NAME` - DynamoDB table name
- `SES_FROM_EMAIL` - Sender email address
- `OTP_EXPIRY_MINUTES` - OTP validity period

#### 3.2 OTP Verification Lambda

**Purpose**: Verify OTP codes

**Process Flow**:
1. Receive email and OTP from API Gateway
2. Query DynamoDB for stored OTP
3. Compare OTPs
4. Check expiration
5. Delete OTP on success
6. Return verification result

#### 3.3 File Upload Handler Lambda

**Purpose**: Generate pre-signed URLs for S3 upload

**Process Flow**:
1. Receive file metadata
2. Validate file type and size
3. Generate pre-signed S3 URL
4. Return URL to frontend
5. Frontend uploads directly to S3

### 4. S3 Bucket

**Purpose**: Secure file storage

**Configuration**:
- Versioning: Enabled
- Encryption: AES-256 (SSE-S3)
- Public Access: Blocked
- CORS: Configured for frontend
- Lifecycle Policy: 90-day retention

**Bucket Structure**:
```
uploads/
├── {email-hash}/
│   ├── {timestamp}-{filename}
│   └── metadata.json
└── verified/
    └── {email-hash}/
        └── {timestamp}-{filename}
```

**Security**:
- Pre-signed URLs for uploads (15-minute expiry)
- IAM policies for Lambda access only
- CloudTrail logging enabled
- Server-side encryption

### 5. DynamoDB Table

**Purpose**: Store OTP codes with automatic expiration

**Configuration**:
- Table Name: `file-verification-poc-otp-table`
- Primary Key: `email` (String)
- Billing Mode: On-demand
- TTL: Enabled on `expiry` attribute

**Schema**:
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "created_at": 1234567890,
  "expiry": 1234568490,
  "attempts": 0
}
```

**Indexes**: None (simple key-value lookup)

**TTL**: Automatically deletes expired items

### 6. SES (Simple Email Service)

**Purpose**: Send OTP emails to users

**Configuration**:
- Region: us-east-1 (or same as Lambda)
- Sandbox Mode: Initially (verify emails)
- Production Mode: Request for unrestricted sending

**Email Template**:
```
Subject: Your File Verification OTP

Dear User,

Your one-time password (OTP) for file verification is:

    123456

This OTP will expire in 10 minutes.

If you did not request this, please ignore this email.

Best regards,
File Verification System
```

## Data Flow

### File Upload Flow

```
1. User enters email and selects file
   │
   ▼
2. Frontend validates input
   │
   ▼
3. Frontend calls API Gateway: POST /otp/generate
   │
   ▼
4. API Gateway invokes OTP Generator Lambda
   │
   ▼
5. Lambda generates OTP and stores in DynamoDB
   │
   ▼
6. Lambda sends email via SES
   │
   ▼
7. User receives email with OTP
   │
   ▼
8. User enters OTP in frontend
   │
   ▼
9. Frontend calls API Gateway: POST /otp/verify
   │
   ▼
10. API Gateway invokes OTP Verification Lambda
    │
    ▼
11. Lambda verifies OTP from DynamoDB
    │
    ▼
12. Frontend calls: POST /file/upload
    │
    ▼
13. Upload Handler Lambda generates pre-signed URL
    │
    ▼
14. Frontend uploads file directly to S3
    │
    ▼
15. File stored successfully
```

## Security Architecture

### Defense in Depth

```
Layer 1: Network Security
├─ HTTPS/TLS 1.2+
├─ VPC (optional for Lambda)
└─ Security Groups

Layer 2: Authentication & Authorization
├─ Email verification via OTP
├─ Time-limited OTPs (10 minutes)
└─ Pre-signed URLs (15 minutes)

Layer 3: Application Security
├─ Input validation
├─ File type checking
├─ Size limits
└─ Rate limiting

Layer 4: Data Security
├─ S3 encryption at rest
├─ DynamoDB encryption
└─ CloudTrail logging

Layer 5: Monitoring & Response
├─ CloudWatch alarms
├─ Log aggregation
└─ Automated responses
```

### Security Controls

1. **Input Validation**
   - Email format validation
   - File type whitelist
   - File size limits
   - OTP format validation

2. **Access Control**
   - IAM least privilege
   - Resource-based policies
   - Pre-signed URLs only
   - No public S3 access

3. **Data Protection**
   - TLS in transit
   - AES-256 at rest
   - Automatic key rotation
   - Secure key storage

4. **Audit & Compliance**
   - CloudTrail enabled
   - S3 access logs
   - Lambda execution logs
   - Compliance reporting

## Scalability

### Auto-Scaling Components

1. **Lambda Functions**
   - Auto-scales to 1000 concurrent executions
   - Reserved concurrency available
   - Provisioned concurrency for latency

2. **DynamoDB**
   - On-demand billing auto-scales
   - Can switch to provisioned for predictable load
   - DAX caching available

3. **API Gateway**
   - Auto-scales to handle traffic
   - Default: 10,000 requests/second
   - Can request increase

4. **S3**
   - Unlimited storage
   - Auto-scales for requests
   - Transfer acceleration available

### Performance Optimization

- Lambda warm starts via scheduled events
- Connection pooling for DynamoDB
- S3 Transfer Acceleration
- CloudFront CDN for frontend
- Multi-AZ deployment

## Cost Optimization

### Cost Components

1. **Lambda**: $0.20 per 1M requests
2. **DynamoDB**: $0.25 per million write requests
3. **S3**: $0.023 per GB storage
4. **SES**: $0.10 per thousand emails
5. **API Gateway**: $1.00 per million requests

### Monthly Cost Estimate (10,000 users)

```
Lambda (30K invocations):      $0.01
DynamoDB (20K writes):         $0.01
S3 (10GB storage):             $0.23
SES (10K emails):              $1.00
API Gateway (40K requests):    $0.04
Data Transfer:                 $0.50
─────────────────────────────────────
Total:                         ~$2.00/month
```

### Cost Saving Strategies

- Use S3 lifecycle policies
- Implement DynamoDB TTL
- Optimize Lambda memory
- Use CloudFront caching
- Enable S3 Intelligent-Tiering

## Disaster Recovery

### Backup Strategy

1. **S3 Versioning**: Enabled
2. **Cross-Region Replication**: Optional
3. **DynamoDB Point-in-Time Recovery**: Enabled
4. **CloudFormation Stacks**: Version controlled

### Recovery Procedures

**RTO**: 1 hour
**RPO**: 5 minutes

1. Infrastructure: Re-deploy via Terraform
2. Data: Restore from S3 versioning
3. Database: Point-in-time recovery
4. Validation: Run integration tests

## Monitoring & Alerting

### Key Metrics

1. **Lambda**
   - Invocation count
   - Error rate
   - Duration
   - Throttles

2. **API Gateway**
   - Request count
   - 4XX/5XX errors
   - Latency
   - Cache hit ratio

3. **DynamoDB**
   - Read/write capacity
   - Throttled requests
   - System errors
   - User errors

4. **S3**
   - Total storage
   - Number of objects
   - Upload failures
   - Access patterns

### CloudWatch Alarms

- Lambda error rate > 5%
- API Gateway 5XX > 10 per minute
- S3 upload failures > 5 per hour
- DynamoDB throttling events
- SES bounce rate > 10%

## Future Enhancements

1. **Security**
   - Add WAF for API Gateway
   - Implement Cognito authentication
   - Add virus scanning (ClamAV)

2. **Features**
   - Multi-file upload
   - File preview
   - Progress tracking
   - Download with verification

3. **Performance**
   - Add CloudFront CDN
   - Implement caching
   - Use Lambda@Edge

4. **Monitoring**
   - X-Ray tracing
   - Custom metrics
   - Real-time dashboards

5. **Compliance**
   - GDPR compliance
   - HIPAA compliance
   - Audit reports
