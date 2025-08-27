from flask import Blueprint, request, jsonify
from services.rsa_service import RSAService
from services.utils import validate_required_fields, create_error_response

rsa_bp = Blueprint('rsa', __name__, url_prefix='/api/rsa')

@rsa_bp.route('/generate-keypair', methods=['POST'])
def generate_keypair():
    """Generate RSA public/private key pair"""
    try:
        data = request.get_json() or {}
        key_size = data.get('key_size', 2048)
        
        result, status_code = RSAService.generate_keypair(key_size)
        return jsonify(result), status_code
    
    except Exception as e:
        return jsonify(create_error_response(f"Key generation request failed: {str(e)}")[0]), 500

@rsa_bp.route('/encrypt', methods=['POST'])
def encrypt():
    """Encrypt plaintext using RSA public key"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify(create_error_response("No JSON data provided")[0]), 400
        
        # Validate required fields
        required_fields = ['plaintext', 'public_key']
        is_valid, error_msg = validate_required_fields(data, required_fields)
        if not is_valid:
            return jsonify(create_error_response(error_msg)[0]), 400
        
        plaintext = data['plaintext']
        public_key = data['public_key']
        
        # Handle both string and dict format for PUBLIC KEY
        if isinstance(public_key, str):
            # Check if it's a PEM key (starts with -----BEGIN)
            if public_key.strip().startswith('-----BEGIN'):
                # Use new text-based encryption
                result, status_code = RSAService.encrypt_text(plaintext, public_key)
            else:
                # Try to parse as JSON for old format compatibility
                result, status_code = RSAService.encrypt_with_public_key(plaintext, public_key)
        elif isinstance(public_key, dict) and 'n' in public_key and 'e' in public_key:
            result, status_code = RSAService.encrypt(plaintext, public_key['n'], public_key['e'])
        else:
            return jsonify(create_error_response("Invalid public key format. Expected PEM format or {'n': number, 'e': number}")[0]), 400
        
        return jsonify(result), status_code
    
    except Exception as e:
        return jsonify(create_error_response(f"Encryption request failed: {str(e)}")[0]), 500

@rsa_bp.route('/decrypt', methods=['POST'])
def decrypt():
    """Decrypt ciphertext using RSA private key"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify(create_error_response("No JSON data provided")[0]), 400
        
        # Validate required fields
        required_fields = ['ciphertext', 'private_key']
        is_valid, error_msg = validate_required_fields(data, required_fields)
        if not is_valid:
            return jsonify(create_error_response(error_msg)[0]), 400
        
        ciphertext = data['ciphertext']
        private_key = data['private_key']
        
        # Handle both string and dict format for PRIVATE KEY
        if isinstance(private_key, str):
            # Check if it's a PEM key (starts with -----BEGIN)
            if private_key.strip().startswith('-----BEGIN'):
                # Use new text-based decryption
                result, status_code = RSAService.decrypt_text(ciphertext, private_key)
            else:
                # Try to parse as JSON for old format compatibility
                result, status_code = RSAService.decrypt_with_private_key(ciphertext, private_key)
        elif isinstance(private_key, dict) and 'n' in private_key and 'd' in private_key:
            result, status_code = RSAService.decrypt(ciphertext, private_key['n'], private_key['d'])
        else:
            return jsonify(create_error_response("Invalid private key format. Expected PEM format or {'n': number, 'd': number}")[0]), 400
        
        return jsonify(result), status_code
    
    except Exception as e:
        return jsonify(create_error_response(f"Decryption request failed: {str(e)}")[0]), 500

@rsa_bp.route('/sign', methods=['POST'])
def sign():
    """Sign a message using RSA private key"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify(create_error_response("No JSON data provided")[0]), 400
        
        # Validate required fields
        required_fields = ['message', 'private_key']
        is_valid, error_msg = validate_required_fields(data, required_fields)
        if not is_valid:
            return jsonify(create_error_response(error_msg)[0]), 400
        
        message = data['message']
        private_key_pem = data['private_key']
        
        # Use the new sign method that supports PEM keys
        result, status_code = RSAService.sign(message, private_key_pem)
        return jsonify(result), status_code
    
    except Exception as e:
        return jsonify(create_error_response(f"Signing request failed: {str(e)}")[0]), 500

@rsa_bp.route('/verify', methods=['POST'])
def verify():
    """Verify a signature using RSA public key"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify(create_error_response("No JSON data provided")[0]), 400
        
        # Validate required fields
        required_fields = ['message', 'signature', 'public_key']
        is_valid, error_msg = validate_required_fields(data, required_fields)
        if not is_valid:
            return jsonify(create_error_response(error_msg)[0]), 400
        
        message = data['message']
        signature = data['signature']
        public_key_pem = data['public_key']
        
        # Use the new verify method that supports PEM keys
        result, status_code = RSAService.verify(message, signature, public_key_pem)
        return jsonify(result), status_code
    
    except Exception as e:
        return jsonify(create_error_response(f"Verification request failed: {str(e)}")[0]), 500

@rsa_bp.route('/info', methods=['GET'])
def info():
    """Get RSA module information"""
    return jsonify({
        "module": "RSA (Rivest-Shamir-Adleman)",
        "supported_key_sizes": [1024, 2048, 3072, 4096],
        "padding": "OAEP with SHA-256",
        "signature_scheme": "PSS with SHA-256",
        "endpoints": {
            "/generate-keypair": "Generate RSA public/private key pair",
            "/encrypt": "Encrypt plaintext using RSA public key",
            "/decrypt": "Decrypt ciphertext using RSA private key",
            "/sign": "Sign message using RSA private key",
            "/verify": "Verify signature using RSA public key",
            "/info": "Get module information"
        },
        "generate_keypair_parameters": {
            "key_size": "Key size in bits - 1024, 2048, 3072, or 4096 (optional, default: 2048)"
        },
        "encrypt_parameters": {
            "plaintext": "Text to encrypt (required)",
            "public_key": "PEM formatted RSA public key (required)"
        },
        "decrypt_parameters": {
            "ciphertext": "Base64 encoded ciphertext (required)",
            "private_key": "PEM formatted RSA private key (required)"
        },
        "sign_parameters": {
            "message": "Message to sign (required)",
            "private_key": "PEM formatted RSA private key (required)"
        },
        "verify_parameters": {
            "message": "Original message (required)",
            "signature": "Base64 encoded signature (required)",
            "public_key": "PEM formatted RSA public key (required)"
        }
    })


