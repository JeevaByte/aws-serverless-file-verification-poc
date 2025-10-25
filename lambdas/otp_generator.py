"""
AWS Lambda function for OTP generation and verification.
This function generates one-time passwords and stores them in DynamoDB.
"""

import json
import os
import random
import string
import time
from datetime import datetime, timedelta
import boto3
from botocore.exceptions import ClientError

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb')
ses = boto3.client('ses')

# Environment variables
OTP_TABLE_NAME = os.environ.get('OTP_TABLE_NAME', 'file-verification-poc-otp-table')
OTP_LENGTH = 6
OTP_EXPIRY_MINUTES = 10


def generate_otp(length=OTP_LENGTH):
    """Generate a random OTP of specified length."""
    return ''.join(random.choices(string.digits, k=length))


def store_otp(email, otp):
    """Store OTP in DynamoDB with expiry timestamp."""
    table = dynamodb.Table(OTP_TABLE_NAME)
    
    expiry_time = int((datetime.now() + timedelta(minutes=OTP_EXPIRY_MINUTES)).timestamp())
    
    try:
        table.put_item(
            Item={
                'email': email,
                'otp': otp,
                'expiry': expiry_time,
                'created_at': int(time.time())
            }
        )
        return True
    except ClientError as e:
        print(f"Error storing OTP: {e}")
        return False


def verify_otp(email, otp):
    """Verify OTP from DynamoDB."""
    table = dynamodb.Table(OTP_TABLE_NAME)
    
    try:
        response = table.get_item(Key={'email': email})
        
        if 'Item' not in response:
            return False, "OTP not found"
        
        item = response['Item']
        current_time = int(time.time())
        
        if current_time > item['expiry']:
            return False, "OTP expired"
        
        if item['otp'] != otp:
            return False, "Invalid OTP"
        
        # Delete OTP after successful verification
        table.delete_item(Key={'email': email})
        return True, "OTP verified successfully"
        
    except ClientError as e:
        print(f"Error verifying OTP: {e}")
        return False, "Error verifying OTP"


def send_otp_email(email, otp):
    """Send OTP via AWS SES (placeholder - requires SES configuration)."""
    try:
        # Note: SES requires verified email addresses in sandbox mode
        response = ses.send_email(
            Source='noreply@example.com',  # Update with verified SES email
            Destination={'ToAddresses': [email]},
            Message={
                'Subject': {'Data': 'Your File Verification OTP'},
                'Body': {
                    'Text': {
                        'Data': f'Your OTP for file verification is: {otp}\n\n'
                                f'This OTP will expire in {OTP_EXPIRY_MINUTES} minutes.'
                    }
                }
            }
        )
        return True
    except ClientError as e:
        print(f"Error sending email: {e}")
        return False


def lambda_handler(event, context):
    """
    Main Lambda handler function.
    
    Expected event structure:
    {
        "action": "generate" or "verify",
        "email": "user@example.com",
        "otp": "123456" (only for verify action)
    }
    """
    
    try:
        # Parse request body if it's a string
        if isinstance(event.get('body'), str):
            body = json.loads(event['body'])
        else:
            body = event
        
        action = body.get('action')
        email = body.get('email')
        
        if not email:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Email is required'})
            }
        
        if action == 'generate':
            # Generate and store OTP
            otp = generate_otp()
            
            if store_otp(email, otp):
                # In production, send email here
                # send_otp_email(email, otp)
                
                return {
                    'statusCode': 200,
                    'body': json.dumps({
                        'message': 'OTP generated successfully',
                        'otp': otp,  # Remove this in production!
                        'email': email,
                        'expiry_minutes': OTP_EXPIRY_MINUTES
                    })
                }
            else:
                return {
                    'statusCode': 500,
                    'body': json.dumps({'error': 'Failed to store OTP'})
                }
        
        elif action == 'verify':
            otp = body.get('otp')
            
            if not otp:
                return {
                    'statusCode': 400,
                    'body': json.dumps({'error': 'OTP is required for verification'})
                }
            
            success, message = verify_otp(email, otp)
            
            return {
                'statusCode': 200 if success else 400,
                'body': json.dumps({
                    'verified': success,
                    'message': message
                })
            }
        
        else:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Invalid action. Use "generate" or "verify"'})
            }
    
    except Exception as e:
        print(f"Error in lambda_handler: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
