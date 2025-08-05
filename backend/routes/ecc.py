from flask import Blueprint, request, jsonify
from services.ecc_service import ECCService
from services.utils import validate_required_fields, create_error_response

ecc_bp = Blueprint('ecc', __name__, url_prefix='/api/ecc')

@ecc_bp.route('/generate-keypair', methods=['POST'])
def generate_keypair():
    """Generate ECC public/private key pair (ECDSA)"""
    try:
        data = request.get_json() or {}
        curve = data.get('curve', 'secp256r1')
        
        result, status_code = ECCService.generate_keypair(curve)
        return jsonify(result), status_code
    
    except Exception as e:
        return jsonify(create_error_response(f"Key generation request failed: {str(e)}")[0]), 500

@ecc_bp.route('/generate-ecdh-keypair', methods=['POST'])
def generate_ecdh_keypair():
    """Generate ECDH key pair for key exchange"""
    try:
        data = request.get_json() or {}
        curve = data.get('curve', 'brainpoolP256r1')
        
        result, status_code = ECCService.generate_ecdh_keypair(curve)
        return jsonify(result), status_code
    
    except Exception as e:
        return jsonify(create_error_response(f"ECDH key generation request failed: {str(e)}")[0]), 500

@ecc_bp.route('/ecdh-shared-secret', methods=['POST'])
def ecdh_shared_secret():
    """Calculate ECDH shared secret"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify(create_error_response("No JSON data provided")[0]), 400
        
        # Validate required fields
        required_fields = ['private_key_a', 'public_key_b_x', 'public_key_b_y']
        is_valid, error_msg = validate_required_fields(data, required_fields)
        if not is_valid:
            return jsonify(create_error_response(error_msg)[0]), 400
        
        private_key_a = data['private_key_a']
        public_key_b_x = data['public_key_b_x']
        public_key_b_y = data['public_key_b_y']
        curve = data.get('curve', 'brainpoolP256r1')
        
        result, status_code = ECCService.ecdh_shared_secret(
            private_key_a, public_key_b_x, public_key_b_y, curve
        )
        return jsonify(result), status_code
    
    except Exception as e:
        return jsonify(create_error_response(f"ECDH shared secret calculation failed: {str(e)}")[0]), 500

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

@ecc_bp.route('/curve-info', methods=['POST'])
def curve_info():
    """Get information about an elliptic curve"""
    try:
        data = request.get_json() or {}
        curve = data.get('curve', 'brainpoolP256r1')
        
        result, status_code = ECCService.get_curve_info(curve)
        return jsonify(result), status_code
    
    except Exception as e:
        return jsonify(create_error_response(f"Curve info request failed: {str(e)}")[0]), 500

@ecc_bp.route('/compare-rsa', methods=['POST'])
def compare_rsa():
    """Compare ECC key size with RSA equivalent"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify(create_error_response("No JSON data provided")[0]), 400
        
        # Validate required fields
        required_fields = ['ecc_key_size']
        is_valid, error_msg = validate_required_fields(data, required_fields)
        if not is_valid:
            return jsonify(create_error_response(error_msg)[0]), 400
        
        ecc_key_size = data['ecc_key_size']
        
        result, status_code = ECCService.compare_with_rsa(ecc_key_size)
        return jsonify(result), status_code
    
    except Exception as e:
        return jsonify(create_error_response(f"RSA comparison failed: {str(e)}")[0]), 500

@ecc_bp.route('/info', methods=['GET'])
def info():
    """Get ECC module information"""
    return jsonify({
        "module": "ECC (Elliptic Curve Cryptography)",
        "algorithms": {
            "ECDSA": "Elliptic Curve Digital Signature Algorithm",
            "ECDH": "Elliptic Curve Diffie-Hellman Key Exchange"
        },
        "supported_curves": {
            "ECDSA": ["secp256r1", "secp384r1", "secp521r1"],
            "ECDH": ["brainpoolP256r1", "brainpoolP384r1", "brainpoolP512r1", 
                    "secp192r1", "secp224r1", "secp256r1", "secp384r1", "secp521r1"]
        },
        "features": [
            "Key pair generation for ECDSA and ECDH",
            "Digital signature creation and verification",
            "Key exchange using ECDH protocol",
            "Curve information and comparison with RSA",
            "Support for multiple elliptic curves"
        ],
        "security_benefits": [
            "Smaller key sizes compared to RSA",
            "Equivalent security with better performance",
            "Lower bandwidth requirements",
            "Faster computations"
        ]
    })
