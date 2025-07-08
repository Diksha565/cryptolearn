from flask import Blueprint, request, jsonify
from services.signature_service import SignatureService
from services.utils import validate_required_fields, create_error_response

signature_bp = Blueprint('signature', __name__, url_prefix='/api/signature')

@signature_bp.route('/generate-keypair', methods=['POST'])
def generate_keypair():
    """Generate key pair for digital signatures"""
    try:
        data = request.get_json() or {}
        algorithm = data.get('algorithm', 'RSA').upper()
        
        if algorithm == 'RSA':
            key_size = data.get('key_size', 2048)
            result, status_code = SignatureService.generate_keypair(algorithm, key_size=key_size)
        elif algorithm == 'ECC':
            curve = data.get('curve', 'secp256r1')
            result, status_code = SignatureService.generate_keypair(algorithm, curve=curve)
        else:
            return jsonify(create_error_response("Algorithm must be 'RSA' or 'ECC'")[0]), 400
        
        return jsonify(result), status_code
    
    except Exception as e:
        return jsonify(create_error_response(f"Key generation request failed: {str(e)}")[0]), 500

@signature_bp.route('/sign', methods=['POST'])
def sign():
    """Sign a message using private key"""
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
        algorithm = data.get('algorithm', 'RSA').upper()
        
        result, status_code = SignatureService.sign_message(message, private_key_pem, algorithm)
        return jsonify(result), status_code
    
    except Exception as e:
        return jsonify(create_error_response(f"Signing request failed: {str(e)}")[0]), 500

@signature_bp.route('/verify', methods=['POST'])
def verify():
    """Verify a digital signature"""
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
        algorithm = data.get('algorithm', 'RSA').upper()
        
        result, status_code = SignatureService.verify_signature(message, signature, public_key_pem, algorithm)
        return jsonify(result), status_code
    
    except Exception as e:
        return jsonify(create_error_response(f"Verification request failed: {str(e)}")[0]), 500

@signature_bp.route('/sign-and-verify', methods=['POST'])
def sign_and_verify():
    """Complete workflow: generate keys, sign message, and verify signature"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify(create_error_response("No JSON data provided")[0]), 400
        
        # Validate required fields
        required_fields = ['message']
        is_valid, error_msg = validate_required_fields(data, required_fields)
        if not is_valid:
            return jsonify(create_error_response(error_msg)[0]), 400
        
        message = data['message']
        algorithm = data.get('algorithm', 'RSA').upper()
        
        # Get algorithm-specific parameters
        kwargs = {}
        if algorithm == 'RSA':
            kwargs['key_size'] = data.get('key_size', 2048)
        elif algorithm == 'ECC':
            kwargs['curve'] = data.get('curve', 'secp256r1')
        
        result, status_code = SignatureService.sign_and_verify(message, algorithm, **kwargs)
        return jsonify(result), status_code
    
    except Exception as e:
        return jsonify(create_error_response(f"Sign and verify workflow failed: {str(e)}")[0]), 500

@signature_bp.route('/info', methods=['GET'])
def info():
    """Get digital signature module information"""
    return jsonify({
        "module": "Digital Signatures",
        "supported_algorithms": ["RSA", "ECC"],
        "rsa_key_sizes": [1024, 2048, 3072, 4096],
        "ecc_curves": ["secp256r1", "secp384r1", "secp521r1"],
        "hash_algorithm": "SHA-256",
        "endpoints": {
            "/generate-keypair": "Generate key pair for digital signatures",
            "/sign": "Sign message using private key",
            "/verify": "Verify digital signature",
            "/sign-and-verify": "Complete workflow: generate keys, sign, and verify",
            "/info": "Get module information"
        },
        "generate_keypair_parameters": {
            "algorithm": "Algorithm type - RSA or ECC (optional, default: RSA)",
            "key_size": "RSA key size in bits - 1024, 2048, 3072, or 4096 (optional, default: 2048)",
            "curve": "ECC curve name - secp256r1, secp384r1, or secp521r1 (optional, default: secp256r1)"
        },
        "sign_parameters": {
            "message": "Message to sign (required)",
            "private_key": "PEM formatted private key (required)",
            "algorithm": "Algorithm type - RSA or ECC (optional, default: RSA)"
        },
        "verify_parameters": {
            "message": "Original message (required)",
            "signature": "Base64 encoded signature (required)",
            "public_key": "PEM formatted public key (required)",
            "algorithm": "Algorithm type - RSA or ECC (optional, default: RSA)"
        },
        "sign_and_verify_parameters": {
            "message": "Message to sign and verify (required)",
            "algorithm": "Algorithm type - RSA or ECC (optional, default: RSA)",
            "key_size": "RSA key size in bits (optional, default: 2048)",
            "curve": "ECC curve name (optional, default: secp256r1)"
        }
    })
