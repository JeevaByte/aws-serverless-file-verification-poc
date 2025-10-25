# Contributing to AWS Serverless File Verification POC

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Code Standards](#code-standards)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- Git installed
- AWS account (for testing)
- AWS CLI configured
- Terraform >= 1.0
- Node.js >= 16.x
- Python >= 3.11
- Code editor (VS Code recommended)

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   # Replace YOUR_USERNAME with your GitHub username
   git clone https://github.com/YOUR_USERNAME/aws-serverless-file-verification-poc.git
   cd aws-serverless-file-verification-poc
   ```
3. Add upstream remote:
   ```bash
   # Replace with the original repository URL if different
   git remote add upstream https://github.com/JeevaByte/aws-serverless-file-verification-poc.git
   ```

## Development Setup

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

The app will run on `http://localhost:3000`

### Lambda Setup

```bash
cd lambdas
pip install -r requirements.txt
python3 otp_generator.py  # Test syntax
```

### Terraform Setup

```bash
cd terraform
terraform init
terraform plan
```

## Code Standards

### General Guidelines

- Write clear, readable code
- Follow existing code style
- Add comments for complex logic
- Keep functions small and focused
- Use meaningful variable names

### Python (Lambda)

- Follow PEP 8 style guide
- Use type hints where appropriate
- Write docstrings for functions
- Handle exceptions properly
- Use logging instead of print statements

Example:
```python
def generate_otp(length: int = 6) -> str:
    """
    Generate a random OTP of specified length.
    
    Args:
        length: Number of digits in OTP (default: 6)
    
    Returns:
        String containing random digits
    """
    return ''.join(random.choices(string.digits, k=length))
```

### JavaScript/React (Frontend)

- Use ES6+ syntax
- Follow React best practices
- Use functional components with hooks
- Implement proper error handling
- Keep components small and reusable

Example:
```javascript
// Good: Functional component with hooks
function FileUpload({ onFileUploaded }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  
  // Component logic
  
  return (
    // JSX
  );
}
```

### Terraform (Infrastructure)

- Use consistent naming conventions
- Add comments for complex resources
- Use variables for configurable values
- Follow HashiCorp style guide
- Group related resources together

Example:
```hcl
# S3 bucket for file uploads
resource "aws_s3_bucket" "file_uploads" {
  bucket = "${var.project_name}-uploads-${data.aws_caller_identity.current.account_id}"
  
  tags = {
    Name    = "File Uploads Bucket"
    Project = var.project_name
  }
}
```

## Testing

### Running Tests

Before submitting a PR, ensure all tests pass:

```bash
# Frontend tests
cd frontend
npm test
npm run build

# Lambda tests
cd lambdas
python3 -m py_compile otp_generator.py

# Terraform validation
cd terraform
terraform validate
```

### Writing Tests

#### Frontend Tests

Create test files alongside components:

```javascript
// FileUpload.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import FileUpload from './FileUpload';

test('renders file upload form', () => {
  render(<FileUpload onFileUploaded={() => {}} />);
  expect(screen.getByText('Upload File')).toBeInTheDocument();
});
```

#### Lambda Tests

Create test files for Lambda functions:

```python
# test_otp_generator.py
import pytest
from otp_generator import generate_otp, verify_otp

def test_generate_otp():
    otp = generate_otp(6)
    assert len(otp) == 6
    assert otp.isdigit()
```

## Pull Request Process

### 1. Create a Branch

Create a descriptive branch name:

```bash
git checkout -b feature/add-file-scanner
git checkout -b fix/otp-expiry-bug
git checkout -b docs/update-readme
```

### 2. Make Changes

- Write your code
- Follow code standards
- Add tests for new features
- Update documentation

### 3. Commit Changes

Write clear commit messages:

```bash
git add .
git commit -m "Add file type validation to upload component"
```

Commit message format:
```
<type>: <subject>

<body>

<footer>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Build process or auxiliary tool changes

Example:
```
feat: Add file type validation

- Add file type whitelist
- Display error for unsupported types
- Update tests for validation

Closes #123
```

### 4. Push Changes

```bash
git push origin feature/add-file-scanner
```

### 5. Create Pull Request

1. Go to GitHub repository
2. Click "New Pull Request"
3. Select your branch
4. Fill in PR template:
   - Description of changes
   - Related issues
   - Testing performed
   - Screenshots (if UI changes)

### 6. Code Review

- Address reviewer feedback
- Make requested changes
- Push updates to your branch
- Re-request review when ready

### 7. Merge

Once approved, your PR will be merged by a maintainer.

## Issue Reporting

### Before Creating an Issue

- Search existing issues
- Check if it's already fixed
- Gather relevant information

### Creating an Issue

Use issue templates when available:

**Bug Report:**
```markdown
**Describe the bug**
A clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen

**Screenshots**
If applicable, add screenshots

**Environment**
- OS: [e.g., macOS 12.0]
- Browser: [e.g., Chrome 95]
- Node version: [e.g., 16.13.0]
```

**Feature Request:**
```markdown
**Is your feature request related to a problem?**
A clear description of the problem

**Describe the solution you'd like**
What you want to happen

**Describe alternatives you've considered**
Other solutions you've considered

**Additional context**
Any other context or screenshots
```

## Code Review Guidelines

### As a Reviewer

- Be constructive and respectful
- Explain the reasoning behind suggestions
- Approve when ready, request changes if needed
- Test the changes locally if possible

### As a Contributor

- Respond to feedback promptly
- Ask for clarification if needed
- Don't take criticism personally
- Thank reviewers for their time

## Development Workflow

### Daily Workflow

1. Pull latest changes:
   ```bash
   git checkout main
   git pull upstream main
   ```

2. Create feature branch:
   ```bash
   git checkout -b feature/my-feature
   ```

3. Make changes and test

4. Commit and push:
   ```bash
   git add .
   git commit -m "Description"
   git push origin feature/my-feature
   ```

5. Create pull request

### Keeping Branch Updated

```bash
git checkout main
git pull upstream main
git checkout feature/my-feature
git rebase main
git push origin feature/my-feature --force-with-lease
```

## Documentation

### Updating Documentation

When making changes, update relevant documentation:

- README.md - Overview and setup
- TESTING.md - Testing procedures
- Code comments - Complex logic
- API documentation - Endpoint changes

### Writing Good Documentation

- Use clear, simple language
- Include code examples
- Add screenshots for UI changes
- Keep it up to date
- Use proper markdown formatting

## Community

### Communication Channels

- GitHub Issues - Bug reports and features
- GitHub Discussions - General questions
- Pull Requests - Code contributions

### Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Respect different viewpoints

## Recognition

Contributors will be recognized in:
- README.md Contributors section
- Release notes
- GitHub contributors page

Thank you for contributing! 🎉
