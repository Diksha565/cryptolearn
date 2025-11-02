"""
Advanced Layered Encryption Routes
5-Layer Cryptographic Workflow:
1. AES encryption of plaintext
2. RSA/ECC encryption of AES key
3. Digital signature of ciphertext hash
4. Text watermarking with sender identifier
5. Text steganography in cover text
"""

from flask import Blueprint, request, jsonify
from services.advanced_layered_service import AdvancedLayeredService

advanced_layered_bp = Blueprint('advanced_layered', __name__, url_prefix='/api/advanced-layered')


@advanced_layered_bp.route('/generate-keys', methods=['POST'])
def generate_keys():
    """
    Generate all required keys for advanced layered encryption
    
    Expected JSON:
    {
        "use_ecc": false  // optional, default false (use RSA)
    }
    """
    try:
        data = request.get_json() or {}
        use_ecc = data.get('use_ecc', False)
        
        result = AdvancedLayeredService.generate_keys(use_ecc=use_ecc)
        
        if result.get('success'):
            return jsonify(result), 200
        else:
            return jsonify(result), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Key generation failed: {str(e)}'
        }), 500


@advanced_layered_bp.route('/encrypt', methods=['POST'])
def encrypt():
    """
    Encrypt using 5-layer advanced workflow
    
    Expected JSON:
    {
        "plaintext": "Secret message",
        "sender_identifier": "Alice",
        "use_ecc": false,  // optional
        "cover_text": "...",  // optional
        "keys": {...}  // optional, will generate if not provided
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        plaintext = data.get('plaintext')
        sender_identifier = data.get('sender_identifier')
        use_ecc = data.get('use_ecc', False)
        cover_text = data.get('cover_text')
        keys = data.get('keys')
        
        if not plaintext:
            return jsonify({
                'success': False,
                'error': 'Plaintext is required'
            }), 400
        
        if not sender_identifier:
            return jsonify({
                'success': False,
                'error': 'Sender identifier is required'
            }), 400
        
        result = AdvancedLayeredService.encrypt_advanced(
            plaintext=plaintext,
            sender_identifier=sender_identifier,
            keys=keys,
            use_ecc=use_ecc,
            cover_text=cover_text
        )
        
        if result.get('success'):
            return jsonify(result), 200
        else:
            return jsonify(result), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Encryption failed: {str(e)}'
        }), 500


@advanced_layered_bp.route('/decrypt', methods=['POST'])
def decrypt():
    """
    Decrypt using reverse 5-layer workflow
    
    Expected JSON:
    {
        "stego_text": "...",
        "keys": {...},
        "encrypted_aes_key": "...",
        "digital_signature": "...",
        "ciphertext_hash": "...",
        "aes_iv": "...",
        "use_ecc": false
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        stego_text = data.get('stego_text')
        keys = data.get('keys')
        encrypted_aes_key = data.get('encrypted_aes_key')
        digital_signature = data.get('digital_signature')
        ciphertext_hash = data.get('ciphertext_hash')
        aes_iv = data.get('aes_iv')
        use_ecc = data.get('use_ecc', False)
        
        if not all([stego_text, keys, encrypted_aes_key, digital_signature, ciphertext_hash, aes_iv]):
            return jsonify({
                'success': False,
                'error': 'Missing required decryption parameters'
            }), 400
        
        result = AdvancedLayeredService.decrypt_advanced(
            stego_text=stego_text,
            keys=keys,
            encrypted_aes_key=encrypted_aes_key,
            digital_signature=digital_signature,
            ciphertext_hash=ciphertext_hash,
            aes_iv=aes_iv,
            use_ecc=use_ecc
        )
        
        if result.get('success'):
            return jsonify(result), 200
        else:
            return jsonify(result), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Decryption failed: {str(e)}'
        }), 500


@advanced_layered_bp.route('/info', methods=['GET'])
def info():
    """Get information about the advanced layered encryption system"""
    return jsonify({
        'success': True,
        'name': 'Advanced Layered Cryptographic System',
        'description': '5-layer encryption workflow for maximum security',
        'layers': [
            {
                'layer': 1,
                'name': 'AES Encryption',
                'description': 'Encrypt plaintext using AES-256-CBC',
                'algorithm': 'AES-256-CBC',
                'purpose': 'Confidentiality of message content'
            },
            {
                'layer': 2,
                'name': 'Key Encryption',
                'description': 'Encrypt AES key using RSA-2048 or ECC',
                'algorithm': 'RSA-2048 / ECC-secp256r1',
                'purpose': 'Secure key distribution'
            },
            {
                'layer': 3,
                'name': 'Digital Signature',
                'description': 'Sign hash of ciphertext using sender private key',
                'algorithm': 'RSA-SHA256 / ECDSA',
                'purpose': 'Authentication and integrity verification'
            },
            {
                'layer': 4,
                'name': 'Text Watermarking',
                'description': 'Embed sender identifier using zero-width characters',
                'algorithm': 'Zero-Width Unicode Characters',
                'purpose': 'Sender identification and ownership'
            },
            {
                'layer': 5,
                'name': 'Linguistic Steganography',
                'description': 'Hide watermarked ciphertext using synonym substitution',
                'algorithm': 'Synonym Substitution',
                'purpose': 'Covert communication and obfuscation'
            }
        ],
        'workflow': {
            'encryption': [
                'User enters plaintext message',
                'Layer 1: AES encrypts plaintext → ciphertext',
                'Layer 2: RSA/ECC encrypts AES key → encrypted key',
                'Layer 3: Hash ciphertext and sign → digital signature',
                'Layer 4: Watermark ciphertext with sender ID → watermarked text',
                'Layer 5: Hide in natural text using linguistic steganography → final stego text'
            ],
            'decryption': [
                'Receive stego text',
                'Layer 5 reverse: Extract hidden message from linguistic stego text',
                'Layer 4 reverse: Extract watermark and verify sender',
                'Layer 3 reverse: Verify digital signature and hash',
                'Layer 2 reverse: Decrypt AES key using RSA/ECC',
                'Layer 1 reverse: Decrypt ciphertext using AES → plaintext'
            ]
        },
        'security_features': [
            'Confidentiality: AES-256 encryption',
            'Key Security: RSA/ECC encrypted key distribution',
            'Integrity: SHA-256 hash with digital signature',
            'Authentication: Sender verification via signature',
            'Non-repudiation: Digital signature proves sender identity',
            'Ownership: Watermark identifies sender',
            'Stealth: Linguistic steganography hides encrypted data in natural text'
        ],
        'algorithms': {
            'aes': {
                'type': 'Symmetric Encryption',
                'key_size': '256 bits',
                'mode': 'CBC',
                'security': 'Very High'
            },
            'rsa': {
                'type': 'Asymmetric Encryption',
                'key_size': '2048 bits',
                'usage': 'Key encryption and digital signature',
                'security': 'High'
            },
            'ecc': {
                'type': 'Asymmetric Encryption',
                'curve': 'secp256r1',
                'usage': 'Key encryption and digital signature',
                'security': 'Very High (smaller keys)'
            },
            'hashing': {
                'algorithm': 'SHA-256',
                'output_size': '256 bits',
                'usage': 'Integrity verification'
            }
        },
        'endpoints': {
            '/generate-keys': 'Generate all required cryptographic keys',
            '/encrypt': 'Encrypt message using 5-layer workflow',
            '/decrypt': 'Decrypt message using reverse workflow',
            '/info': 'Get system information (this endpoint)'
        },
        'advantages': [
            'Defense in depth - multiple security layers',
            'Hybrid cryptography - combines symmetric and asymmetric',
            'Integrity verification - detects tampering',
            'Sender authentication - proves message origin',
            'Covert communication - hidden in plain text',
            'Flexible algorithms - supports both RSA and ECC'
        ]
    }), 200
