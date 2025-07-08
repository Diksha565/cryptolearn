# 🔐 CryptoLearn - Cryptography Learning Platform

A comprehensive full-stack application for learning and experimenting with cryptographic algorithms, featuring both educational content and practical implementation tools.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Development Setup](#development-setup)
- [Environment Configuration](#environment-configuration)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [Branch Setup](#branch-setup)
- [Troubleshooting](#troubleshooting)

## 🌟 Overview

CryptoLearn is an educational platform that combines theoretical cryptography learning with hands-on implementation. It provides interactive tools for encryption, digital signatures, steganography, and watermarking.

## ✨ Features

### 🔐 Cryptographic Algorithms
- **AES Encryption**: ECB and CBC modes with 128/192/256-bit keys
- **RSA Encryption**: Key generation, encryption/decryption, digital signatures
- **ECC**: Elliptic Curve Cryptography with ECDSA signatures and ECDH key exchange

### 🖼️ Image Processing
- **Steganography**: LSB-based message hiding in images
- **Digital Watermarking**: Visible and invisible watermarks

### 📚 Educational Content
- Interactive tutorials and explanations
- Step-by-step algorithm walkthroughs
- Visual demonstrations with animations

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (React)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Language**: TypeScript
- **State Management**: React Hooks

### Backend
- **Framework**: Flask (Python)
- **Cryptography**: cryptography library, pycryptodome
- **Image Processing**: Pillow, OpenCV
- **API**: RESTful endpoints

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher)
- **Python** (3.8 or higher)
- **npm/yarn/pnpm** for frontend dependencies
- **pip** for Python dependencies

### 1. Clone the Repository
```bash
git clone https://github.com/Diksha565/cryptolearn.git
cd cryptolearn
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv
# Windows
venv\\Scripts\\activate
# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the backend server
python app.py
```
**Backend will run on:** http://localhost:5000

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install
# or
yarn install
# or
pnpm install

# Run the development server
npm run dev
# or
yarn dev
# or
pnpm dev
```
**Frontend will run on:** http://localhost:3000

## 📁 Project Structure

```
cryptolearn/
├── README.md                    # Main project documentation
├── .gitignore                   # Root gitignore
├── requirements.txt             # Python dependencies (if any)
│
├── backend/                     # Flask API server
│   ├── app.py                   # Main Flask application
│   ├── requirements.txt         # Backend Python dependencies
│   ├── README.md               # Backend-specific documentation
│   ├── .gitignore              # Backend gitignore
│   │
│   ├── config/                 # Configuration files
│   │   ├── __init__.py
│   │   └── config.py
│   │
│   ├── routes/                 # API route handlers
│   │   ├── __init__.py
│   │   ├── aes.py              # AES encryption endpoints
│   │   ├── rsa.py              # RSA encryption endpoints
│   │   ├── ecc.py              # ECC endpoints
│   │   ├── signature.py        # Digital signature endpoints
│   │   ├── steganography.py    # Steganography endpoints
│   │   └── watermark.py        # Watermarking endpoints
│   │
│   ├── services/               # Business logic
│   │   ├── __init__.py
│   │   ├── aes_service.py
│   │   ├── rsa_service.py
│   │   ├── ecc_service.py
│   │   ├── signature_service.py
│   │   ├── steganography_service.py
│   │   ├── watermarking_service.py
│   │   └── utils.py
│   │
│   └── static/                 # Static files (uploads, generated images)
│
└── frontend/                   # Next.js React application
    ├── package.json            # Frontend dependencies
    ├── next.config.js          # Next.js configuration
    ├── tailwind.config.js      # Tailwind CSS configuration
    ├── tsconfig.json           # TypeScript configuration
    ├── .gitignore              # Frontend gitignore
    │
    ├── app/                    # Next.js app directory
    │   ├── layout.tsx          # Root layout
    │   ├── page.tsx            # Home page
    │   ├── globals.css         # Global styles
    │   │
    │   ├── aes/                # AES encryption page
    │   ├── rsa/                # RSA encryption page
    │   ├── ecc/                # ECC page
    │   ├── digital-signature/  # Digital signature page
    │   ├── steganography/      # Steganography page
    │   ├── watermarking/       # Watermarking page
    │   └── learn/              # Educational content pages
    │
    ├── components/             # Reusable React components
    │   ├── ui/                 # shadcn/ui components
    │   ├── layout/             # Layout components
    │   └── providers/          # Context providers
    │
    ├── lib/                    # Utility functions
    │   ├── api.ts              # API client functions
    │   └── utils.ts            # General utilities
    │
    └── public/                 # Static assets
```

## 🔧 Development Setup

### Environment Variables

Create `.env.local` in the `frontend` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=CryptoLearn
```

Create `.env` in the `backend` directory:
```env
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=your-secret-key-here
UPLOAD_FOLDER=static/uploads
MAX_CONTENT_LENGTH=16777216
```

### Database Setup (if applicable)
```bash
# If using a database, add setup instructions here
cd backend
# Database initialization commands
```

## 📚 API Documentation

The backend provides RESTful API endpoints for all cryptographic operations:

### Base URL: `http://localhost:5000`

### Available Endpoints:

#### AES Encryption
- `POST /aes/encrypt` - Encrypt data using AES
- `POST /aes/decrypt` - Decrypt AES-encrypted data

#### RSA Encryption
- `POST /rsa/generate-keys` - Generate RSA key pair
- `POST /rsa/encrypt` - Encrypt data using RSA
- `POST /rsa/decrypt` - Decrypt RSA-encrypted data

#### Digital Signatures
- `POST /signature/sign` - Create digital signature
- `POST /signature/verify` - Verify digital signature

#### Steganography
- `POST /steganography/hide` - Hide message in image
- `POST /steganography/extract` - Extract message from image

#### Watermarking
- `POST /watermark/add` - Add watermark to image
- `POST /watermark/detect` - Detect watermark in image

For detailed API documentation, visit: http://localhost:5000 when the backend is running.

## 🤝 Contributing

### Setting Up Your Branch

1. **Fork the repository** (if external contributor)
2. **Create a new branch** from main:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

3. **Follow the setup instructions** above to get your environment running

4. **Make your changes** and test thoroughly

5. **Commit your changes**:
   ```bash
   git add .
   git commit -m "Add: your descriptive commit message"
   ```

6. **Push to your branch**:
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request** to the main branch

### Code Style Guidelines

#### Frontend (TypeScript/React)
- Use TypeScript for all new code
- Follow React functional component patterns
- Use Tailwind CSS for styling
- Implement proper error handling

#### Backend (Python/Flask)
- Follow PEP 8 style guidelines
- Use type hints where appropriate
- Implement proper error handling and logging
- Write docstrings for functions and classes

## 🔄 Branch Setup for New Developers

### First Time Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Diksha565/cryptolearn.git
   cd cryptolearn
   ```

2. **Set up Python virtual environment**:
   ```bash
   # Create virtual environment
   python -m venv venv
   
   # Activate it
   # Windows:
   venv\\Scripts\\activate
   # macOS/Linux:
   source venv/bin/activate
   ```

3. **Install backend dependencies**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

4. **Install frontend dependencies**:
   ```bash
   cd ../frontend
   npm install
   ```

5. **Set up environment variables** (see Environment Configuration section)

6. **Test the setup**:
   ```bash
   # Terminal 1 - Backend
   cd backend
   python app.py
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

### Working on Your Branch

1. **Always pull the latest changes** before starting work:
   ```bash
   git checkout main
   git pull origin main
   git checkout your-branch-name
   git merge main
   ```

2. **Keep your branch updated** regularly:
   ```bash
   git fetch origin
   git merge origin/main
   ```

3. **Test your changes** before committing:
   ```bash
   # Test backend
   cd backend
   python -m pytest tests/  # if tests exist
   
   # Test frontend
   cd frontend
   npm run build
   npm run lint
   ```

## 🐛 Troubleshooting

### Common Issues

#### Backend Issues
- **"Module not found" errors**: Ensure virtual environment is activated and dependencies are installed
- **Port 5000 already in use**: Kill existing processes or change port in `app.py`
- **CORS errors**: Check CORS configuration in Flask app

#### Frontend Issues
- **"Command not found" errors**: Ensure Node.js and npm are properly installed
- **Port 3000 already in use**: Use different port: `npm run dev -- --port 3001`
- **API connection errors**: Verify backend is running and `NEXT_PUBLIC_API_URL` is correct

#### General Issues
- **Git conflicts**: Use `git status` to identify conflicted files and resolve manually
- **Environment variables not loaded**: Restart development servers after changing `.env` files



**Happy Coding! 🚀**


