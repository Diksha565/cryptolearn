from flask import Blueprint, request, jsonify
from services.ecc_service import ECCService
from services.utils import validate_required_fields, create_error_response

ecc_bp = Blueprint('ecc', __name__, url_prefix='/api/ecc')

@ecc_bp.route('/generate-keypair', methods=['POST'])
def generate_keypair():
    """Generate ECC public/private key pair"""
    try:
        data = request.get_json() or {}
        curve = data.get('curve', 'secp256r1')
        
        result, status_code = ECCService.generate_keypair(curve)
        return jsonify(result), status_code
    
    except Exception as e:
        return jsonify(create_error_response(f"Key generation request failed: {str(e)}")[0]), 500

@ecc_bp.route('/sign', methods=['POST'])
def sign():
    """Sign a message using ECC private key (ECDSA)"""
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
        
        result, status_code = ECCService.sign(message, private_key_pem)
        return jsonify(result), status_code
    
    except Exception as e:
        return jsonify(create_error_response(f"Signing request failed: {str(e)}")[0]), 500

@ecc_bp.route('/verify', methods=['POST'])
def verify():
    """Verify a signature using ECC public key (ECDSA)"""
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
        
        result, status_code = ECCService.verify(message, signature, public_key_pem)
        return jsonify(result), status_code
    
    except Exception as e:
        return jsonify(create_error_response(f"Verification request failed: {str(e)}")[0]), 500

@ecc_bp.route('/shared-secret', methods=['POST'])
def shared_secret():
    """Generate shared secret using ECDH"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify(create_error_response("No JSON data provided")[0]), 400
        
        # Validate required fields
        required_fields = ['private_key', 'public_key']
        is_valid, error_msg = validate_required_fields(data, required_fields)
        if not is_valid:
            return jsonify(create_error_response(error_msg)[0]), 400
        
        private_key_pem = data['private_key']
        public_key_pem = data['public_key']
        
        result, status_code = ECCService.generate_shared_secret(private_key_pem, public_key_pem)
        return jsonify(result), status_code
    
    except Exception as e:
        return jsonify(create_error_response(f"Shared secret generation failed: {str(e)}")[0]), 500

@ecc_bp.route('/info', methods=['GET'])
def info():
    """Get ECC module information"""
    return jsonify({
        "module": "ECC (Elliptic Curve Cryptography)",
        "supported_curves": ["secp256r1", "secp384r1", "secp521r1"],
        "signature_scheme": "ECDSA with SHA-256",
        "key_exchange": "ECDH (Elliptic Curve Diffie-Hellman)",
        "endpoints": {
            "/generate-keypair": "Generate ECC public/private key pair",
            "/sign": "Sign message using ECC private key (ECDSA)",
            "/verify": "Verify signature using ECC public key (ECDSA)",
            "/shared-secret": "Generate shared secret using ECDH",
            "/info": "Get module information"
        },
        "generate_keypair_parameters": {
            "curve": "Elliptic curve name - secp256r1, secp384r1, or secp521r1 (optional, default: secp256r1)"
        },
        "sign_parameters": {
            "message": "Message to sign (required)",
            "private_key": "PEM formatted ECC private key (required)"
        },
        "verify_parameters": {
            "message": "Original message (required)",
            "signature": "Base64 encoded signature (required)",
            "public_key": "PEM formatted ECC public key (required)"
        },
        "shared_secret_parameters": {
            "private_key": "PEM formatted ECC private key (required)",
            "public_key": "PEM formatted ECC public key (required)"
        },
        "curve_details": {
            "secp256r1": "NIST P-256, 256-bit key size",
            "secp384r1": "NIST P-384, 384-bit key size",
            "secp521r1": "NIST P-521, 521-bit key size"
        }
    })
