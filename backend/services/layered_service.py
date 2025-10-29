"""
Layered Encryption Service
Provides multi-layer encryption using AES, RSA, Digital Signature, and ECC
Sequential layering: Plaintext → AES → RSA → ECC → Digital Signature
"""

import json
import base64
import time
import secrets
from datetime import datetime
from typing import Dict, List, Tuple, Any
from .aes_service import AESService
from .rsa_service import RSAService
from .ecc_service import ECCService
from .signature_service import SignatureService
from .utils import create_success_response, create_error_response


class LayeredEncryptionService:
    """Service for multi-layer encryption operations"""
    
    @staticmethod
    def generate_all_keys(layers: List[str]) -> Dict[str, Any]:
        """Generate keys for all required algorithms"""
        keys = {}
        
        if 'aes' in layers:
            # AES just needs a random key (32 bytes = 256 bits for AES-256)
            aes_key = secrets.token_hex(32)  # 64 hex chars = 32 bytes
            keys['aes'] = {
                'key': aes_key,
                'key_size': 256
            }
        
        if 'rsa' in layers:
            rsa_result, _ = RSAService.generate_keypair(key_size=2048)
            if rsa_result.get('success'):
                keys['rsa'] = {
                    'public_key': rsa_result['public_key'],
                    'private_key': rsa_result['private_key'],
                    'key_size': 2048
                }
        
        if 'ecc' in layers:
            ecc_result, _ = ECCService.generate_keypair()
            if ecc_result.get('success'):
                keys['ecc'] = {
                    'public_key': ecc_result['public_key'],
                    'private_key': ecc_result['private_key'],
                    'curve': ecc_result.get('curve', 'secp256r1')
                }
        
        if 'signature' in layers:
            sig_result, _ = RSAService.generate_keypair(key_size=2048)
            if sig_result.get('success'):
                keys['signature'] = {
                    'public_key': sig_result['public_key'],
                    'private_key': sig_result['private_key'],
                    'key_size': 2048
                }
        
        return keys
    
    @staticmethod
    def encrypt_layer_aes(data: str, key: str) -> Tuple[Dict[str, Any], bool]:
        """Encrypt data using AES"""
        try:
            time.sleep(0.05 + (hash(data) % 150) / 1000)
            result, status = AESService.encrypt(data, key, mode='CBC', key_size=256)
            if result.get('success'):
                return result, True
            return {}, False
        except Exception as e:
            print(f"AES error: {str(e)}")
            import traceback
            traceback.print_exc()
            return {}, False
    
    @staticmethod
    def decrypt_layer_aes(ciphertext: str, key: str, iv: str) -> Tuple[str, bool]:
        """Decrypt AES encrypted data"""
        try:
            time.sleep(0.05 + (hash(ciphertext) % 150) / 1000)
            result, status = AESService.decrypt(ciphertext, key, mode='CBC', key_size=256, iv=iv)
            if result.get('success'):
                return result['plaintext'], True
            return "", False
        except Exception as e:
            print(f"AES decryption error: {str(e)}")
            import traceback
            traceback.print_exc()
            return "", False
    
    @staticmethod
    def encrypt_layer_rsa(data: str, public_key: str) -> Tuple[str, bool]:
        """Encrypt data using RSA with chunking for large data"""
        try:
            time.sleep(0.1 + (hash(data) % 200) / 1000)
            
            # RSA can only encrypt limited data (key_size/8 - padding)
            # For 2048-bit key: max ~214 bytes
            # We'll chunk the data and encrypt each chunk
            
            from cryptography.hazmat.primitives import serialization
            from cryptography.hazmat.primitives.asymmetric import padding as asym_padding
            from cryptography.hazmat.primitives import hashes
            import base64
            
            # Load public key to get key size
            public_key_obj = serialization.load_pem_public_key(public_key.encode('utf-8'))
            key_size = public_key_obj.key_size
            max_chunk_size = (key_size // 8) - 2 * (256 // 8) - 2  # OAEP padding overhead (~214 bytes for 2048-bit)
            
            # Convert data to bytes
            data_bytes = data.encode('utf-8')
            
            # Split into chunks
            chunks = []
            for i in range(0, len(data_bytes), max_chunk_size):
                chunk = data_bytes[i:i + max_chunk_size]
                
                # Encrypt chunk
                encrypted_chunk = public_key_obj.encrypt(
                    chunk,
                    asym_padding.OAEP(
                        mgf=asym_padding.MGF1(algorithm=hashes.SHA256()),
                        algorithm=hashes.SHA256(),
                        label=None
                    )
                )
                
                # Encode to base64
                chunks.append(base64.b64encode(encrypted_chunk).decode('utf-8'))
            
            # Join chunks with separator
            encrypted_text = '|||'.join(chunks)
            
            return encrypted_text, True
        except Exception as e:
            print(f"RSA error: {str(e)}")
            import traceback
            traceback.print_exc()
            return "", False
    
    @staticmethod
    def decrypt_layer_rsa(ciphertext: str, private_key: str) -> Tuple[str, bool]:
        """Decrypt RSA encrypted data (with chunking support)"""
        try:
            time.sleep(0.1 + (hash(ciphertext) % 200) / 1000)
            
            from cryptography.hazmat.primitives import serialization
            from cryptography.hazmat.primitives.asymmetric import padding as asym_padding
            from cryptography.hazmat.primitives import hashes
            import base64
            
            # Load private key
            private_key_obj = serialization.load_pem_private_key(
                private_key.encode('utf-8'),
                password=None
            )
            
            # Split chunks
            chunks = ciphertext.split('|||')
            decrypted_chunks = []
            
            for chunk in chunks:
                # Decode from base64
                encrypted_bytes = base64.b64decode(chunk)
                
                # Decrypt chunk
                decrypted_chunk = private_key_obj.decrypt(
                    encrypted_bytes,
                    asym_padding.OAEP(
                        mgf=asym_padding.MGF1(algorithm=hashes.SHA256()),
                        algorithm=hashes.SHA256(),
                        label=None
                    )
                )
                
                decrypted_chunks.append(decrypted_chunk)
            
            # Join all decrypted chunks
            plaintext = b''.join(decrypted_chunks).decode('utf-8')
            
            return plaintext, True
        except Exception as e:
            print(f"RSA decryption error: {str(e)}")
            import traceback
            traceback.print_exc()
            return "", False
    
    @staticmethod
    def encrypt_layer_signature(data: str, private_key: str) -> Tuple[Dict[str, Any], bool]:
        """Sign data using RSA digital signature"""
        try:
            time.sleep(0.08 + (hash(data) % 120) / 1000)
            result, status = RSAService.sign(data, private_key)
            if result.get('success'):
                signed_data = {
                    'data': data,
                    'signature': result['signature'],
                    'algorithm': 'RSA-SHA256'
                }
                return signed_data, True
            return {}, False
        except Exception as e:
            print(f"Signature error: {str(e)}")
            import traceback
            traceback.print_exc()
            return {}, False
    
    @staticmethod
    def decrypt_layer_signature(signed_data: Dict[str, Any], public_key: str) -> Tuple[str, bool]:
        """Verify signature and extract data"""
        try:
            time.sleep(0.08 + (hash(signed_data['signature']) % 120) / 1000)
            
            print(f"DEBUG decrypt_layer_signature:")
            print(f"  - Data to verify (first 100): {signed_data['data'][:100]}")
            print(f"  - Signature (first 100): {signed_data['signature'][:100]}")
            print(f"  - Public key (first 100): {public_key[:100]}")
            
            result, status = RSAService.verify(
                signed_data['data'],
                signed_data['signature'],
                public_key
            )
            
            print(f"  - Verification result: {result}")
            
            if result.get('success') and result.get('valid'):
                return signed_data['data'], True
            
            print(f"  - Verification FAILED: success={result.get('success')}, valid={result.get('valid')}")
            return "", False
        except Exception as e:
            print(f"Signature verification error: {str(e)}")
            import traceback
            traceback.print_exc()
            return "", False
    
    @staticmethod
    def encrypt_layer_ecc(data: str, private_key: str) -> Tuple[Dict[str, Any], bool]:
        """Sign data using ECC (ECDSA)"""
        try:
            time.sleep(0.06 + (hash(data) % 90) / 1000)
            result, status = ECCService.sign(data, private_key)
            if result.get('success'):
                signed_data = {
                    'data': data,
                    'signature': result['signature'],
                    'curve': result.get('curve', 'secp256r1'),
                    'algorithm': 'ECDSA'
                }
                return signed_data, True
            return {}, False
        except Exception as e:
            print(f"ECC signing error: {str(e)}")
            import traceback
            traceback.print_exc()
            return {}, False
    
    @staticmethod
    def decrypt_layer_ecc(signed_data: Dict[str, Any], public_key: str) -> Tuple[str, bool]:
        """Verify ECC signature (ECDSA) and extract data"""
        try:
            time.sleep(0.06 + (hash(signed_data['signature']) % 90) / 1000)
            result, status = ECCService.verify(
                signed_data['data'],
                signed_data['signature'],
                public_key
            )
            if result.get('success') and result.get('valid'):
                return signed_data['data'], True
            return "", False
        except Exception as e:
            print(f"ECC signature verification error: {str(e)}")
            import traceback
            traceback.print_exc()
            return "", False
    
    @staticmethod
    def encrypt_layered(plaintext: str, layers: List[str], keys: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Encrypt text through multiple layers SEQUENTIALLY
        Simplified Order: RSA → Digital Signature → AES
        
        Args:
            plaintext: Original text to encrypt
            layers: List of algorithm names (will be applied in fixed order)
            keys: Pre-generated keys (optional)
            
        Returns:
            Dictionary with encrypted data showing output after EACH layer
        """
        try:
            # Generate keys if not provided
            if not keys:
                keys = LayeredEncryptionService.generate_all_keys(layers)
            
            # Define the SIMPLIFIED order for layered encryption: RSA → Signature → AES
            LAYER_ORDER = ['rsa', 'signature', 'aes']
            
            # Sort the layers according to the defined order
            ordered_layers = [layer for layer in LAYER_ORDER if layer in layers]
            
            current_data = plaintext
            encryption_steps = []
            layer_outputs = []  # Store actual output after each layer
            layer_metadata = []
            
            print(f"\n{'='*70}")
            print(f"STARTING LAYERED ENCRYPTION")
            print(f"Original Plaintext: {plaintext}")
            print(f"Layers to apply (in order): {' → '.join([l.upper() for l in ordered_layers])}")
            print(f"{'='*70}\n")
            
            for i, algorithm in enumerate(ordered_layers):
                step_num = i + 1
                input_data = current_data
                
                print(f"\n{'='*70}")
                print(f"LAYER {step_num}/{len(ordered_layers)}: {algorithm.upper()} ENCRYPTION")
                print(f"Input length: {len(input_data)} chars")
                print(f"Input preview: {input_data[:80]}..." if len(input_data) > 80 else f"Input: {input_data}")
                
                if algorithm == 'rsa':
                    encrypted_text, success = LayeredEncryptionService.encrypt_layer_rsa(
                        current_data,
                        keys['rsa']['public_key']
                    )
                    if not success:
                        return {
                            'success': False,
                            'error': f'RSA encryption failed at layer {step_num}'
                        }
                    
                    # RSA output is the encrypted text
                    current_data = encrypted_text
                    
                    layer_outputs.append({
                        'layer': step_num,
                        'algorithm': 'RSA-2048',
                        'input': input_data,
                        'output': current_data,
                        'key_size': '2048 bits'
                    })
                    
                    layer_metadata.append({
                        'layer': step_num,
                        'algorithm': 'RSA-2048',
                        'input_size': len(input_data),
                        'output_size': len(current_data),
                        'key_size': '2048 bits'
                    })
                    
                    print(f"✓ RSA encryption complete")
                    print(f"Output length: {len(current_data)} chars")
                    print(f"Output preview: {current_data[:80]}..." if len(current_data) > 80 else f"Output: {current_data}")
                    
                elif algorithm == 'signature':
                    signed_result, success = LayeredEncryptionService.encrypt_layer_signature(
                        current_data,
                        keys['signature']['private_key']
                    )
                    if not success:
                        return {
                            'success': False,
                            'error': f'Digital signature failed at layer {step_num}'
                        }
                    
                    # Store ONLY the signature in metadata, keep data clean
                    # The signature will be verified during decryption but not embedded in the data
                    signature_value = signed_result['signature']
                    
                    # Store signature separately in keys for later verification
                    keys['signature']['stored_signature'] = signature_value
                    
                    # DON'T modify current_data - just pass it through
                    # current_data stays as the RSA encrypted text
                    
                    layer_outputs.append({
                        'layer': step_num,
                        'algorithm': 'RSA-SHA256 Signature',
                        'input': input_data,
                        'output': current_data,  # Output is same as input (signature is stored separately)
                        'signature': signature_value[:50] + '...',
                        'key_size': '2048 bits',
                        'note': 'Signature stored separately - data unchanged'
                    })
                    
                    layer_metadata.append({
                        'layer': step_num,
                        'algorithm': 'RSA-SHA256 Signature',
                        'input_size': len(input_data),
                        'output_size': len(current_data),
                        'key_size': '2048 bits'
                    })
                    
                    print(f"✓ Digital signature complete")
                    print(f"Signature generated and stored separately")
                    print(f"Output length: {len(current_data)} chars (unchanged - signature not embedded)")
                    print(f"Output preview: {current_data[:80]}..." if len(current_data) > 80 else f"Output: {current_data}")
                    
                elif algorithm == 'aes':
                    encrypted_result, success = LayeredEncryptionService.encrypt_layer_aes(
                        current_data,
                        keys['aes']['key']
                    )
                    if not success:
                        return {
                            'success': False,
                            'error': f'AES encryption failed at layer {step_num}'
                        }
                    
                    # Store the IV in keys for decryption
                    keys['aes']['iv'] = encrypted_result['iv']
                    
                    # AES output is the ciphertext
                    current_data = encrypted_result['ciphertext']
                    
                    layer_outputs.append({
                        'layer': step_num,
                        'algorithm': 'AES-256-CBC',
                        'input': input_data,
                        'output': current_data,
                        'iv': encrypted_result['iv'][:32] + '...',
                        'key_size': '256 bits'
                    })
                    
                    layer_metadata.append({
                        'layer': step_num,
                        'algorithm': 'AES-256-CBC',
                        'input_size': len(input_data),
                        'output_size': len(current_data),
                        'key_size': '256 bits'
                    })
                    
                    print(f"✓ AES encryption complete")
                    print(f"Output length: {len(current_data)} chars")
                    print(f"Output preview: {current_data[:80]}..." if len(current_data) > 80 else f"Output: {current_data}")
                
                encryption_steps.append({
                    'step': step_num,
                    'algorithm': algorithm,
                    'completed': True
                })
                print(f"{'='*70}\n")
            
            # Add timestamp and nonce for uniqueness
            timestamp = datetime.now().isoformat(timespec='microseconds')
            nonce = secrets.token_hex(16)
            
            # Final encrypted data
            final_encrypted_data = current_data
            
            print(f"\n{'='*70}")
            print(f"ENCRYPTION COMPLETE!")
            print(f"Total layers applied: {len(ordered_layers)}")
            print(f"Final output length: {len(final_encrypted_data)} chars")
            print(f"Unique ID (nonce): {nonce[:16]}...")
            print(f"{'='*70}\n")
            
            return {
                'success': True,
                'encrypted_data': final_encrypted_data,
                'layers': ordered_layers,
                'layer_outputs': layer_outputs,
                'encryption_steps': encryption_steps,
                'layer_metadata': layer_metadata,
                'keys': keys,
                'total_layers': len(ordered_layers),
                'final_size': len(final_encrypted_data),
                'timestamp': timestamp,
                'nonce': nonce,
                'layer_order': 'RSA → Digital Signature → AES'
            }
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return {
                'success': False,
                'error': f'Layered encryption failed: {str(e)}'
            }
    
    @staticmethod
    def decrypt_layered(encrypted_data: str, layers: List[str], keys: Dict[str, Any]) -> Dict[str, Any]:
        """
        Decrypt layered encrypted text in REVERSE order
        Decryption Order: AES → Digital Signature → RSA
        
        Args:
            encrypted_data: Final encrypted output
            layers: List of algorithms in original order
            keys: Keys used for encryption
            
        Returns:
            Dictionary with decrypted data and metadata
        """
        try:
            # Define the SIMPLIFIED order: RSA → Signature → AES
            # Decryption is in REVERSE: AES → Signature → RSA
            LAYER_ORDER = ['rsa', 'signature', 'aes']
            
            # Sort the layers according to the defined order, then reverse for decryption
            ordered_layers = [layer for layer in LAYER_ORDER if layer in layers]
            reversed_layers = list(reversed(ordered_layers))
            
            current_data = encrypted_data
            decryption_steps = []
            
            print(f"\n{'='*70}")
            print(f"STARTING LAYERED DECRYPTION")
            print(f"Layers to decrypt (in reverse): {' → '.join([l.upper() for l in reversed_layers])}")
            print(f"{'='*70}\n")
            
            for i, algorithm in enumerate(reversed_layers):
                step_num = i + 1
                
                print(f"\n{'='*70}")
                print(f"DECRYPT LAYER {step_num}/{len(reversed_layers)}: {algorithm.upper()}")
                print(f"Input length: {len(current_data)} chars")
                print(f"Input preview: {current_data[:80]}..." if len(current_data) > 80 else f"Input: {current_data}")
                
                if algorithm == 'aes':
                    # AES decryption
                    if 'aes' in keys and 'iv' in keys['aes']:
                        decrypted, success = LayeredEncryptionService.decrypt_layer_aes(
                            current_data,
                            keys['aes']['key'],
                            keys['aes']['iv']
                        )
                        if not success:
                            return {
                                'success': False,
                                'error': f'AES decryption failed at layer {step_num}'
                            }
                        current_data = decrypted
                    else:
                        return {
                            'success': False,
                            'error': 'AES IV not found in keys'
                        }
                    
                    print(f"✓ AES decryption successful")
                    print(f"Output length: {len(current_data)} chars")
                    print(f"Output preview: {current_data[:80]}..." if len(current_data) > 80 else f"Output: {current_data}")
                
                elif algorithm == 'signature':
                    # Verify the signature that was stored separately during encryption
                    if 'signature' in keys and 'stored_signature' in keys['signature']:
                        signed_obj = {
                            'data': current_data,
                            'signature': keys['signature']['stored_signature']
                        }
                        
                        verified, success = LayeredEncryptionService.decrypt_layer_signature(
                            signed_obj,
                            keys['signature']['public_key']
                        )
                        if not success:
                            return {
                                'success': False,
                                'error': f'Signature verification failed at layer {step_num}'
                            }
                        # Data remains unchanged (signature was only for verification)
                        current_data = verified
                    else:
                        return {
                            'success': False,
                            'error': 'Signature not found in keys'
                        }
                    
                    print(f"✓ Signature verified successfully")
                    print(f"Output length: {len(current_data)} chars")
                    print(f"Output preview: {current_data[:80]}..." if len(current_data) > 80 else f"Output: {current_data}")
                    
                elif algorithm == 'rsa':
                    # RSA decryption
                    decrypted, success = LayeredEncryptionService.decrypt_layer_rsa(
                        current_data,
                        keys['rsa']['private_key']
                    )
                    if not success:
                        return {
                            'success': False,
                            'error': f'RSA decryption failed at layer {step_num}'
                        }
                    current_data = decrypted
                    
                    print(f"✓ RSA decryption successful")
                    print(f"Output length: {len(current_data)} chars")
                    print(f"Output: {current_data}")
                
                decryption_steps.append({
                    'step': step_num,
                    'algorithm': algorithm,
                    'completed': True
                })
                print(f"{'='*70}\n")
            
            print(f"\n{'='*70}")
            print(f"DECRYPTION COMPLETE!")
            print(f"Original plaintext recovered: {current_data}")
            print(f"{'='*70}\n")
            
            return {
                'success': True,
                'plaintext': current_data,
                'decryption_steps': decryption_steps,
                'total_layers': len(reversed_layers)
            }
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return {
                'success': False,
                'error': f'Layered decryption failed: {str(e)}'
            }
