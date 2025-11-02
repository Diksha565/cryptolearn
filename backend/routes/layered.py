"""
Routes for layered encryption operations
DEPRECATED: Please use /api/advanced-layered endpoints for the new 5-layer system
This endpoint is kept for backward compatibility but redirects to advanced system
"""

from flask import Blueprint, request, jsonify
from services.advanced_layered_service import AdvancedLayeredService
from services.utils import validate_required_fields, create_error_response

layered_bp = Blueprint('layered', __name__, url_prefix='/api/layered')


@layered_bp.route('/generate-keys', methods=['POST'])
def generate_keys():
    """
    DEPRECATED: Generate keys for layered encryption
    This now uses the advanced 5-layer system
    Please use /api/advanced-layered/generate-keys instead
    """
    try:
        data = request.get_json()
        use_ecc = data.get('use_ecc', False) if data else False
        
        # Use the new advanced layered service
        result = AdvancedLayeredService.generate_keys(use_ecc=use_ecc)
        
        if result.get('success'):
            return jsonify({
                'success': True,
                'keys': result['keys'],
                'warning': 'This endpoint is deprecated. Please use /api/advanced-layered/generate-keys',
                'new_endpoint': '/api/advanced-layered/generate-keys'
            }), 200
        else:
            return jsonify(result), 500
        
    except Exception as e:
        return jsonify({'success': False, 'error': f'Key generation failed: {str(e)}'}), 500


@layered_bp.route('/encrypt', methods=['POST'])
def encrypt_layered():
    """
    DEPRECATED: Encrypt text through cryptographic layers
    This now uses the advanced 5-layer system (AES→RSA/ECC→Watermark→Signature→Stego)
    Please use /api/advanced-layered/encrypt instead
    
    Expected JSON:
    {
        "plaintext": "text to encrypt",
        "sender_identifier": "Alice",  // optional, defaults to "System"
        "keys": {...},  // optional, will generate if not provided
        "use_ecc": false,  // optional, use ECC instead of RSA
        "cover_text": "..."  // optional, for steganography
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'error': 'No JSON data provided'}), 400
        
        # Validate required fields
        if 'plaintext' not in data:
            return jsonify({'success': False, 'error': 'Plaintext is required'}), 400
        
        plaintext = data['plaintext']
        sender_identifier = data.get('sender_identifier', 'System')
        keys = data.get('keys')
        use_ecc = data.get('use_ecc', False)
        cover_text = data.get('cover_text')
        
        print(f"\n{'='*60}")
        print(f"DEPRECATED ENDPOINT CALLED: /api/layered/encrypt")
        print(f"Redirecting to advanced 5-layer system")
        print(f"Plaintext: '{plaintext}' (length: {len(plaintext)})")
        print(f"Sender: {sender_identifier}")
        print(f"{'='*60}\n")
        
        # Use the new advanced layered service
        result = AdvancedLayeredService.encrypt_advanced(
            plaintext=plaintext,
            sender_identifier=sender_identifier,
            keys=keys,
            use_ecc=use_ecc,
            cover_text=cover_text
        )
        
        if result.get('success'):
            return jsonify({
                **result,
                'warning': 'This endpoint is deprecated. Please use /api/advanced-layered/encrypt',
                'new_endpoint': '/api/advanced-layered/encrypt'
            }), 200
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
    DEPRECATED: Decrypt layered encrypted text
    This now uses the advanced 5-layer system
    Please use /api/advanced-layered/decrypt instead
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'error': 'No JSON data provided'}), 400
        
        # Support both old and new parameter names
        stego_text = data.get('stego_text') or data.get('encrypted_data')
        
        if not stego_text:
            return jsonify({'success': False, 'error': 'Stego text / encrypted data is required'}), 400
        
        keys = data.get('keys')
        if not keys:
            return jsonify({'success': False, 'error': 'Keys are required'}), 400
        
        # Use the new advanced layered service
        result = AdvancedLayeredService.decrypt_advanced(
            stego_text=stego_text,
            keys=keys,
            encrypted_aes_key=data.get('encrypted_aes_key', ''),
            digital_signature=data.get('digital_signature', ''),
            ciphertext_hash=data.get('ciphertext_hash', ''),
            aes_iv=data.get('aes_iv', ''),
            use_ecc=data.get('use_ecc', False)
        )
        
        if result.get('success'):
            return jsonify({
                **result,
                'warning': 'This endpoint is deprecated. Please use /api/advanced-layered/decrypt',
                'new_endpoint': '/api/advanced-layered/decrypt'
            }), 200
        else:
            return jsonify(result), 400
        
    except Exception as e:
        return jsonify({'success': False, 'error': f'Decryption failed: {str(e)}'}), 500


@layered_bp.route('/info', methods=['GET'])
def get_info():
    """Get information about layered encryption"""
    return jsonify({
        'success': True,
        'status': 'DEPRECATED',
        'message': 'This endpoint is deprecated. Please use /api/advanced-layered/info',
        'new_endpoint': '/api/advanced-layered/info',
        'old_system': {
            'supported_algorithms': ['rsa', 'signature', 'aes'],
            'encryption_order': 'RSA → Digital Signature → AES',
        },
        'new_system': {
            'layers': 5,
            'encryption_order': 'AES-256 → RSA/ECC → Watermark → Signature → Stego',
            'features': [
                'AES-256-CBC symmetric encryption',
                'RSA-2048 or ECC key encryption',
                'Zero-width character watermarking',
                'SHA-256 + RSA/ECDSA signature',
                'Whitespace text steganography'
            ]
        }
    }), 200
