"""
OTP Generator Lambda Function

This Lambda function generates a One-Time Password (OTP) for email verification
and stores it in DynamoDB with a TTL (Time To Live).
"""

import json
import os
import random
import string
from datetime import datetime, timedelta
import boto3
from botocore.exceptions import ClientError


# Initialize AWS clients
dynamodb = boto3.resource('dynamodb')
ses_client = boto3.client('ses')

# Environment variables
DYNAMODB_TABLE = os.environ.get('DYNAMODB_TABLE', 'otp-table')
OTP_LENGTH = 6
OTP_EXPIRY_MINUTES = 10
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'noreply@example.com')


def generate_otp(length=OTP_LENGTH):
    """
    Generate a random OTP of specified length using digits.
    
    Args:
        length (int): Length of the OTP to generate
        
    Returns:
        str: Generated OTP
    """
    return ''.join(random.choices(string.digits, k=length))


def store_otp_in_dynamodb(email, otp, expiry_timestamp):
    """
    Store the OTP in DynamoDB with TTL.
    
    Args:
        email (str): User's email address
        otp (str): Generated OTP
        expiry_timestamp (int): Unix timestamp for OTP expiry
        
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        table = dynamodb.Table(DYNAMODB_TABLE)
        
        table.put_item(
            Item={
                'email': email,
                'otp': otp,
                'expiry_time': expiry_timestamp,
                'created_at': int(datetime.utcnow().timestamp()),
                'verified': False
            }
        )
        return True
    except ClientError as e:
        print(f"Error storing OTP in DynamoDB: {e}")
        return False


def send_otp_email(email, otp):
    """
    Send OTP to user's email via Amazon SES.
    
    Args:
        email (str): Recipient email address
        otp (str): OTP to send
        
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    subject = "Your Verification Code"
    body_text = f"""
    Your verification code is: {otp}
    
    This code will expire in {OTP_EXPIRY_MINUTES} minutes.
    
    If you didn't request this code, please ignore this email.
    """
    
    body_html = f"""
    <html>
    <head></head>
    <body>
        <h2>Email Verification</h2>
        <p>Your verification code is:</p>
        <h1 style="color: #007bff; letter-spacing: 5px;">{otp}</h1>
        <p>This code will expire in <strong>{OTP_EXPIRY_MINUTES} minutes</strong>.</p>
        <p>If you didn't request this code, please ignore this email.</p>
    </body>
    </html>
    """
    
    try:
        response = ses_client.send_email(
            Source=SENDER_EMAIL,
            Destination={'ToAddresses': [email]},
            Message={
                'Subject': {'Data': subject},
                'Body': {
                    'Text': {'Data': body_text},
                    'Html': {'Data': body_html}
                }
            }
        )
        print(f"Email sent successfully. MessageId: {response['MessageId']}")
        return True
    except ClientError as e:
        print(f"Error sending email: {e}")
        return False


def lambda_handler(event, context):
    """
    Lambda handler function for OTP generation.
    
    Expected event format:
    {
        "body": {
            "email": "user@example.com"
        }
    }
    
    Args:
        event (dict): Lambda event object
        context (object): Lambda context object
        
    Returns:
        dict: API Gateway response format
    """
    try:
        # Parse the request body
        if isinstance(event.get('body'), str):
            body = json.loads(event['body'])
        else:
            body = event.get('body', {})
        
        email = body.get('email')
        
        # Validate email
        if not email or '@' not in email:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': 'Invalid email address'
                })
            }
        
        # Generate OTP
        otp = generate_otp()
        
        # Calculate expiry timestamp
        expiry_time = datetime.utcnow() + timedelta(minutes=OTP_EXPIRY_MINUTES)
        expiry_timestamp = int(expiry_time.timestamp())
        
        # Store OTP in DynamoDB
        if not store_otp_in_dynamodb(email, otp, expiry_timestamp):
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': 'Failed to generate OTP'
                })
            }
        
        # Send OTP via email
        if not send_otp_email(email, otp):
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': 'Failed to send OTP email'
                })
            }
        
        # Return success response
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'message': 'OTP sent successfully',
                'email': email,
                'expiry_minutes': OTP_EXPIRY_MINUTES
            })
        }
        
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': 'Internal server error'
            })
        }


# For local testing
if __name__ == '__main__':
    test_event = {
        'body': json.dumps({
            'email': 'test@example.com'
        })
    }
    
    result = lambda_handler(test_event, None)
    print(json.dumps(result, indent=2))
