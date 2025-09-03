# CryptoLearn Backend API

A comprehensive Flask-based REST API for cryptography learning and experimentation.

## Features

### 🔐 Symmetric Encryption

- **AES (Advanced Encryption Standard)**: ECB and CBC modes with 128/192/256-bit keys

### 🔐 Asymmetric Encryption

- **RSA**: Key generation, encryption/decryption, digital signatures
- **ECC**: Key generation, ECDSA signatures, ECDH key exchange

### 🔏 Digital Signatures

- Support for both RSA and ECC-based signatures
- Complete workflows for signing and verification

### 🖼️ Image Processing

- **Steganography**: LSB-based message hiding in images
- **Watermarking**: Visible text/image watermarks and invisible frequency-domain watermarks

## Installation

1. **Install Python dependencies:**

   ```powershell
   cd backend
   pip install -r requirements.txt
   ```

2. **Run the application:**

   ```powershell
   python app.py
   ```

3. **Access the API:**
   - Base URL: `http://localhost:5000`
   - Test endpoint: `http://localhost:5000/test`
   - API documentation: `http://localhost:5000`

## API Endpoints

### General

- `GET /` - API information and documentation
- `GET /test` - Test endpoint
- `GET /health` - Health check

### AES Module (`/api/aes`)

- `POST /encrypt` - Encrypt plaintext
- `POST /decrypt` - Decrypt ciphertext
- `GET /info` - Module information

### RSA Module (`/api/rsa`)

- `POST /generate-keypair` - Generate RSA key pair
- `POST /encrypt` - Encrypt with public key
- `POST /decrypt` - Decrypt with private key
- `POST /sign` - Sign message
- `POST /verify` - Verify signature
- `GET /info` - Module information

### ECC Module (`/api/ecc`)

- `POST /generate-keypair` - Generate ECC key pair
- `POST /sign` - Sign message (ECDSA)
- `POST /verify` - Verify signature (ECDSA)
- `POST /shared-secret` - Generate shared secret (ECDH)
- `GET /info` - Module information

### Digital Signatures (`/api/signature`)

- `POST /generate-keypair` - Generate key pair (RSA/ECC)
- `POST /sign` - Sign message
- `POST /verify` - Verify signature
- `POST /sign-and-verify` - Complete workflow
- `GET /info` - Module information

### Steganography (`/api/steganography`)

- `POST /embed` - Embed message in image
- `POST /embed-download` - Embed and download image
- `POST /extract` - Extract hidden message
- `POST /capacity` - Get image capacity
- `POST /compare` - Compare original/encoded images
- `GET /info` - Module information

### Watermarking (`/api/watermark`)

- `POST /text` - Add text watermark
- `POST /text-download` - Add text watermark and download
- `POST /image` - Add image watermark
- `POST /image-download` - Add image watermark and download
- `POST /invisible` - Add invisible watermark
- `POST /extract-invisible` - Extract invisible watermark
- `GET /info` - Module information

## Usage Examples

### AES Encryption

```bash
curl -X POST http://localhost:5000/api/aes/encrypt \
  -H "Content-Type: application/json" \
  -d '{
    "plaintext": "Hello, World!",
    "key": "my-secret-key",
    "mode": "CBC",
    "key_size": 256
  }'
```

### RSA Key Generation

```bash
curl -X POST http://localhost:5000/api/rsa/generate-keypair \
  -H "Content-Type: application/json" \
  -d '{"key_size": 2048}'
```

### Steganography (Embed Message)

```bash
curl -X POST http://localhost:5000/api/steganography/embed \
  -F "image=@path/to/image.png" \
  -F "message=Secret message"
```

## Project Structure

```
backend/
├── app.py                     # Main Flask application
├── requirements.txt          # Python dependencies
├── config/
│   ├── __init__.py
│   └── config.py            # Configuration and CORS setup
├── routes/
│   ├── __init__.py
│   ├── aes.py              # AES encryption routes
│   ├── rsa.py              # RSA encryption routes
│   ├── ecc.py              # ECC routes
│   ├── signature.py        # Digital signature routes
│   ├── steganography.py    # Steganography routes
│   └── watermark.py        # Watermarking routes
├── services/
│   ├── __init__.py
│   ├── aes_service.py      # AES implementation
│   ├── rsa_service.py      # RSA implementation
│   ├── ecc_service.py      # ECC implementation
│   ├── signature_service.py # Digital signatures
│   ├── steganography_service.py # Steganography
│   ├── watermarking_service.py  # Watermarking
│   └── utils.py            # Shared utilities
└── static/                 # Temporary file storage
```

## Testing

You can test the API using:

- **Postman**: Import the API endpoints and test with various parameters
- **curl**: Use command-line requests as shown in examples above
- **Python requests**: Write Python scripts to interact with the API

## Security Notes

- This is for educational purposes only
- Use strong keys in production environments
- The API allows CORS from localhost:3000 for frontend integration
- File uploads are limited to 16MB
- Temporary files are stored in the `static/` directory

## Dependencies

- Flask: Web framework
- Flask-CORS: Cross-origin resource sharing
- cryptography: Modern cryptography library
- pycryptodome: Additional crypto algorithms
- ecdsa: Elliptic curve digital signatures
- rsa: RSA implementation
- Pillow: Image processing
- opencv-python: Computer vision operations
- numpy: Numerical operations
- scipy: Scientific computing

## Contributing

This is an educational project. Feel free to extend it with additional cryptographic algorithms or features!
