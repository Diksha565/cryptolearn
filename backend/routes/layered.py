"""
Routes for layered encryption operations
"""

from flask import Blueprint, request, jsonify
from services.layered_service import LayeredEncryptionService
from services.utils import validate_required_fields, create_error_response

layered_bp = Blueprint('layered', __name__, url_prefix='/api/layered')


@layered_bp.route('/generate-keys', methods=['POST'])
def generate_keys():
    """Generate keys for all specified algorithms"""
    try:
        data = request.get_json()
        
        if not data or 'algorithms' not in data:
            return jsonify({'success': False, 'error': 'No algorithms specified'}), 400
        
        algorithms = data['algorithms']
        
        if not isinstance(algorithms, list) or len(algorithms) == 0:
            return jsonify({'success': False, 'error': 'Invalid algorithms list'}), 400
        
        keys = LayeredEncryptionService.generate_all_keys(algorithms)
        
        if not keys:
            return jsonify({'success': False, 'error': 'Key generation failed'}), 500
        
        return jsonify({
            'success': True,
            'keys': keys,
            'algorithms': algorithms
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': f'Key generation failed: {str(e)}'}), 500


@layered_bp.route('/encrypt', methods=['POST'])
def encrypt_layered():
    """
    Encrypt text through multiple cryptographic layers
    
    Expected JSON:
    {
        "plaintext": "text to encrypt",
        "layers": ["aes", "rsa", "signature", "ecc"],
        "keys": {...}  // optional, will generate if not provided
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'error': 'No JSON data provided'}), 400
        
        # Validate required fields
        required_fields = ['plaintext', 'layers']
        is_valid, error_msg = validate_required_fields(data, required_fields)
        if not is_valid:
            return jsonify({'success': False, 'error': error_msg}), 400
        
        plaintext = data['plaintext']
        layers = data['layers']
        keys = data.get('keys')
        
        # DEBUG: Log what we received
        print(f"\n{'='*60}")
        print(f"ENCRYPT REQUEST")
        print(f"Plaintext: '{plaintext}' (length: {len(plaintext)})")
        print(f"Layers: {layers}")
        print(f"Keys provided: {keys is not None}")
        print(f"{'='*60}\n")
        
        # Validate layers
        if not isinstance(layers, list) or len(layers) == 0:
            return jsonify({'success': False, 'error': 'Invalid layers configuration'}), 400
        
        # Check if all layers are supported
        supported = ['rsa', 'signature', 'aes']
        for layer in layers:
            if layer not in supported:
                return jsonify({
                    'success': False,
                    'error': f'Unsupported algorithm: {layer}. Supported: {supported}'
                }), 400
        
        # Perform layered encryption
        result = LayeredEncryptionService.encrypt_layered(plaintext, layers, keys)
        
        # DEBUG: Log result
        if result.get('success'):
            print(f"Encryption successful! Output length: {len(result['encrypted_data'])}")
            print(f"Output preview: {result['encrypted_data'][:100]}...\n")
        else:
            print(f"Encryption FAILED: {result.get('error')}\n")
        
        if result.get('success'):
            return jsonify(result), 200
        else:
            return jsonify(result), 400
        
    except Exception as e:
        print(f"EXCEPTION in encrypt: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': f'Encryption failed: {str(e)}'}), 500


@layered_bp.route('/decrypt', methods=['POST'])
def decrypt_layered():
    """
    Decrypt layered encrypted text
    
    Expected JSON:
    {
        "encrypted_data": "encrypted text",
        "layers": ["aes", "rsa", "signature", "ecc"],
        "keys": {...}  // must include all private keys
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'error': 'No JSON data provided'}), 400
        
        # Validate required fields
        required_fields = ['encrypted_data', 'layers', 'keys']
        is_valid, error_msg = validate_required_fields(data, required_fields)
        if not is_valid:
            return jsonify({'success': False, 'error': error_msg}), 400
        
        encrypted_data = data['encrypted_data']
        layers = data['layers']
        keys = data['keys']
        
        # Perform layered decryption
        result = LayeredEncryptionService.decrypt_layered(encrypted_data, layers, keys)
        
        if result.get('success'):
            return jsonify(result), 200
        else:
            return jsonify(result), 400
        
    except Exception as e:
        return jsonify({'success': False, 'error': f'Decryption failed: {str(e)}'}), 500


@layered_bp.route('/info', methods=['GET'])
def get_info():
    """Get information about layered encryption"""
    return jsonify({
        'success': True,
        'supported_algorithms': ['rsa', 'signature', 'aes'],
        'recommended_order': ['rsa', 'signature', 'aes'],
        'encryption_order': 'RSA → Digital Signature → AES',
        'decryption_order': 'AES → Digital Signature → RSA',
        'description': 'Simplified multi-layer encryption: RSA encrypts plaintext, signature authenticates, AES encrypts final output',
        'features': [
            'Sequential layering: RSA → Digital Signature → AES',
            'Automatic key generation',
            'Step-by-step encryption tracking',
            'Layer-by-layer output display',
            'Secure decryption chain'
        ]
    }), 200
