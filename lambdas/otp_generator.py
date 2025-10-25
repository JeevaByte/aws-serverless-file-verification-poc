import json
import random
import string
import os
from datetime import datetime, timedelta

def generate_otp(length=6):
    """
    Generate a random numeric OTP of specified length.
    
    Args:
        length (int): Length of OTP (default: 6)
    
    Returns:
        str: Generated OTP
    """
    return ''.join(random.choices(string.digits, k=length))

def lambda_handler(event, context):
    """
    AWS Lambda handler for OTP generation.
    
    Expected event format:
    {
        "email": "user@example.com",
        "purpose": "file_verification"
    }
    
    Returns:
        dict: Response with OTP and metadata
    """
    try:
        # Parse input
        body = json.loads(event.get('body', '{}')) if isinstance(event.get('body'), str) else event
        email = body.get('email')
        purpose = body.get('purpose', 'file_verification')
        
        if not email:
            return {
                'statusCode': 400,
                'body': json.dumps({
                    'error': 'Email is required'
                })
            }
        
        # Generate OTP
        otp = generate_otp()
        
        # Calculate expiration (default: 10 minutes)
        expiration_minutes = int(os.environ.get('OTP_EXPIRATION_MINUTES', 10))
        expires_at = (datetime.utcnow() + timedelta(minutes=expiration_minutes)).isoformat()
        
        # TODO: Store OTP in DynamoDB with expiration
        # TODO: Send OTP via SES email
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'message': 'OTP generated successfully',
                'email': email,
                'expires_at': expires_at,
                'otp_length': len(otp)
                # Note: Never return actual OTP in response for security
            })
        }
        
    except Exception as e:
        print(f"Error generating OTP: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': 'Internal server error',
                'message': str(e)
            })
        }
