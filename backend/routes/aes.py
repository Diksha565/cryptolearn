from flask import Blueprint, request, jsonify
from services.aes_service import AESService
from services.utils import validate_required_fields, create_error_response

aes_bp = Blueprint('aes', __name__, url_prefix='/api/aes')

@aes_bp.route('/encrypt', methods=['POST'])
def encrypt():
    """Encrypt plaintext using AES"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify(create_error_response("No JSON data provided")[0]), 400
        
        # Validate required fields
        required_fields = ['plaintext', 'key']
        is_valid, error_msg = validate_required_fields(data, required_fields)
        if not is_valid:
            return jsonify(create_error_response(error_msg)[0]), 400
        
        plaintext = data['plaintext']
        key = data['key']
        mode = data.get('mode', 'CBC').upper()
        key_size = data.get('key_size', 256)
        iv = data.get('iv')
        
        result, status_code = AESService.encrypt(plaintext, key, mode, key_size, iv)
        return jsonify(result), status_code
    
    except Exception as e:
        return jsonify(create_error_response(f"Encryption request failed: {str(e)}")[0]), 500

@aes_bp.route('/decrypt', methods=['POST'])
def decrypt():
    """Decrypt ciphertext using AES"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify(create_error_response("No JSON data provided")[0]), 400
        
        # Validate required fields
        required_fields = ['ciphertext', 'key']
        is_valid, error_msg = validate_required_fields(data, required_fields)
        if not is_valid:
            return jsonify(create_error_response(error_msg)[0]), 400
        
        ciphertext = data['ciphertext']
        key = data['key']
        mode = data.get('mode', 'CBC').upper()
        key_size = data.get('key_size', 256)
        iv = data.get('iv')
        
        result, status_code = AESService.decrypt(ciphertext, key, mode, key_size, iv)
        return jsonify(result), status_code
    
    except Exception as e:
        return jsonify(create_error_response(f"Decryption request failed: {str(e)}")[0]), 500

@aes_bp.route('/info', methods=['GET'])
def info():
    """Get AES module information"""
    return jsonify({
        "module": "AES (Advanced Encryption Standard)",
        "supported_key_sizes": [128, 192, 256],
        "supported_modes": ["ECB", "CBC"],
        "endpoints": {
            "/encrypt": "Encrypt plaintext using AES",
            "/decrypt": "Decrypt ciphertext using AES",
            "/info": "Get module information"
        },
        "encrypt_parameters": {
            "plaintext": "Text to encrypt (required)",
            "key": "Encryption key (required)",
            "mode": "AES mode - ECB or CBC (optional, default: CBC)",
            "key_size": "Key size in bits - 128, 192, or 256 (optional, default: 256)",
            "iv": "IV for CBC mode (optional, will generate if not provided)"
        },
        "decrypt_parameters": {
            "ciphertext": "Base64 encoded ciphertext (required)",
            "key": "Decryption key (required)",
            "mode": "AES mode - ECB or CBC (optional, default: CBC)",
            "key_size": "Key size in bits - 128, 192, or 256 (optional, default: 256)",
            "iv": "Base64 encoded IV (required for CBC mode)"
        }
    })
