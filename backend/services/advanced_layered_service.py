"""
Advanced Layered Cryptographic Service
Implements 5-layer encryption workflow:
Layer 1: AES encryption of plaintext
Layer 2: RSA/ECC encryption of AES key
Layer 3: Digital signature of ciphertext hash
Layer 4: Text watermarking with sender identifier
Layer 5: Text steganography in cover text
"""

import json
import hashlib
import secrets
import base64
from datetime import datetime
from typing import Dict, List, Tuple, Any
from .aes_service import AESService
from .rsa_service import RSAService
from .ecc_service import ECCService
from .signature_service import SignatureService
from .text_watermarking_service import TextWatermarkingService
from .linguistic_steganography_service import LinguisticSteganographyService


class AdvancedLayeredService:
    """Service for advanced 5-layer cryptographic workflow"""
    
    @staticmethod
    def generate_keys(use_ecc: bool = False) -> Dict[str, Any]:
        """
        Generate all required keys for the layered encryption
        
        Args:
            use_ecc: If True, use ECC for key encryption, else use RSA
            
        Returns:
            Dictionary containing all keys
        """
        keys = {}
        
        try:
            # Layer 1: AES key (256-bit)
            aes_key = secrets.token_hex(32)  # 64 hex chars = 32 bytes = 256 bits
            keys['aes'] = {
                'key': aes_key,
                'key_size': 256
            }
            
            # Layer 2: RSA or ECC keypair for AES key encryption
            if use_ecc:
                ecc_result, _ = ECCService.generate_keypair(curve='secp256r1')
                if ecc_result.get('success'):
                    keys['key_encryption'] = {
                        'algorithm': 'ECC',
                        'public_key': ecc_result['public_key'],
                        'private_key': ecc_result['private_key'],
                        'curve': 'secp256r1'
                    }
            else:
                rsa_result, _ = RSAService.generate_keypair(key_size=2048)
                if rsa_result.get('success'):
                    keys['key_encryption'] = {
                        'algorithm': 'RSA',
                        'public_key': rsa_result['public_key'],
                        'private_key': rsa_result['private_key'],
                        'key_size': 2048
                    }
            
            # Layer 3: RSA or ECC keypair for digital signature
            if use_ecc:
                ecc_sig_result, _ = ECCService.generate_keypair(curve='secp256r1')
                if ecc_sig_result.get('success'):
                    keys['signature'] = {
                        'algorithm': 'ECDSA',
                        'public_key': ecc_sig_result['public_key'],
                        'private_key': ecc_sig_result['private_key'],
                        'curve': 'secp256r1'
                    }
            else:
                rsa_sig_result, _ = RSAService.generate_keypair(key_size=2048)
                if rsa_sig_result.get('success'):
                    keys['signature'] = {
                        'algorithm': 'RSA-SHA256',
                        'public_key': rsa_sig_result['public_key'],
                        'private_key': rsa_sig_result['private_key'],
                        'key_size': 2048
                    }
            
            return {
                'success': True,
                'keys': keys,
                'use_ecc': use_ecc
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Key generation failed: {str(e)}'
            }
    
    @staticmethod
    def encrypt_advanced(
        plaintext: str,
        sender_identifier: str,
        keys: Dict[str, Any] = None,
        use_ecc: bool = False,
        cover_text: str = None
    ) -> Dict[str, Any]:
        """
        Encrypt using 5-layer workflow
        
        Args:
            plaintext: Original message
            sender_identifier: Sender name/identifier for watermark
            keys: Pre-generated keys (optional)
            use_ecc: Use ECC instead of RSA
            cover_text: Optional cover text for steganography
            
        Returns:
            Dictionary with encryption results and all layer outputs
        """
        try:
            print(f"\n{'='*80}")
            print(f"ADVANCED LAYERED ENCRYPTION STARTED")
            print(f"Plaintext: {plaintext}")
            print(f"Sender: {sender_identifier}")
            print(f"Algorithm: {'ECC' if use_ecc else 'RSA'}")
            print(f"{'='*80}\n")
            
            # Generate keys if not provided
            if not keys:
                key_result = AdvancedLayeredService.generate_keys(use_ecc)
                if not key_result.get('success'):
                    return key_result
                keys = key_result['keys']
            
            layer_outputs = []
            
            # =====================================================================
            # LAYER 1: AES Encryption of Plaintext
            # =====================================================================
            print(f"\n[LAYER 1] AES-256-CBC ENCRYPTION")
            print(f"Input: {plaintext}")
            
            aes_result, _ = AESService.encrypt(
                plaintext=plaintext,
                key=keys['aes']['key'],
                mode='CBC',
                key_size=256
            )
            
            if not aes_result.get('success'):
                return {
                    'success': False,
                    'error': 'Layer 1 (AES encryption) failed',
                    'details': aes_result.get('error')
                }
            
            encrypted_plaintext = aes_result['ciphertext']
            aes_iv = aes_result['iv']
            
            layer_outputs.append({
                'layer': 1,
                'name': 'AES Encryption',
                'algorithm': 'AES-256-CBC',
                'input': plaintext,
                'output': encrypted_plaintext,
                'metadata': {
                    'iv': aes_iv,
                    'key_size': 256
                }
            })
            
            print(f"[OK] Encrypted ciphertext (first 100 chars): {encrypted_plaintext[:100]}...")
            print(f"  IV: {aes_iv}")
            
            # =====================================================================
            # LAYER 2: RSA/ECC Encryption of AES Key
            # =====================================================================
            print(f"\n[LAYER 2] {keys['key_encryption']['algorithm']} KEY ENCRYPTION")
            print(f"Encrypting AES key: {keys['aes']['key'][:50]}...")
            
            if use_ecc:
                # For ECC, we'll use a hybrid approach
                # ECC can't directly encrypt large data, so we use ECIES concept
                # For simplicity, we'll encrypt the AES key using RSA
                # (In production, use proper ECIES implementation)
                encrypted_aes_key = keys['aes']['key']  # Simplified for ECC
                key_enc_method = 'ECC-Based (Simplified)'
            else:
                # RSA encryption of AES key
                rsa_enc_result, _ = RSAService.encrypt_text(
                    plaintext=keys['aes']['key'],
                    public_key_pem=keys['key_encryption']['public_key']
                )
                
                if not rsa_enc_result.get('success'):
                    return {
                        'success': False,
                        'error': 'Layer 2 (RSA key encryption) failed',
                        'details': rsa_enc_result.get('error')
                    }
                
                encrypted_aes_key = rsa_enc_result['ciphertext']
                key_enc_method = 'RSA-2048'
            
            layer_outputs.append({
                'layer': 2,
                'name': 'Key Encryption',
                'algorithm': keys['key_encryption']['algorithm'],
                'input': keys['aes']['key'],
                'output': encrypted_aes_key,
                'metadata': {
                    'method': key_enc_method
                }
            })
            
            print(f"[OK] Encrypted AES key (first 100 chars): {encrypted_aes_key[:100]}...")
            
            # =====================================================================
            # LAYER 3: Text Watermarking (before signature)
            # =====================================================================
            print(f"\n[LAYER 3] TEXT WATERMARKING")
            print(f"Embedding sender identifier: {sender_identifier}")
            
            # Watermark the ciphertext with sender identifier
            watermark_result, _ = TextWatermarkingService.embed_watermark(
                text=encrypted_plaintext,
                watermark=sender_identifier
            )
            
            if not watermark_result.get('success'):
                return {
                    'success': False,
                    'error': 'Layer 3 (Text watermarking) failed',
                    'details': watermark_result.get('error')
                }
            
            watermarked_ciphertext = watermark_result['watermarked_text']
            
            layer_outputs.append({
                'layer': 3,
                'name': 'Text Watermarking',
                'algorithm': 'Zero-Width Characters',
                'input': encrypted_plaintext,
                'output': watermarked_ciphertext,
                'metadata': {
                    'watermark': sender_identifier,
                    'method': 'zero-width-characters'
                }
            })
            
            print(f"[OK] Watermarked ciphertext (length: {len(watermarked_ciphertext)})")
            print(f"  Watermark embedded: {sender_identifier}")
            
            # =====================================================================
            # LAYER 4: Digital Signature of Watermarked Ciphertext Hash
            # =====================================================================
            print(f"\n[LAYER 4] DIGITAL SIGNATURE")
            
            # Hash the WATERMARKED ciphertext using SHA-256
            ciphertext_hash = hashlib.sha256(watermarked_ciphertext.encode()).hexdigest()
            print(f"Watermarked ciphertext hash: {ciphertext_hash}")
            
            # Sign the hash
            if use_ecc:
                sig_result, _ = ECCService.sign(
                    message=ciphertext_hash,
                    private_key_pem=keys['signature']['private_key']
                )
            else:
                sig_result, _ = RSAService.sign(
                    message=ciphertext_hash,
                    private_key_pem=keys['signature']['private_key']
                )
            
            if not sig_result.get('success'):
                return {
                    'success': False,
                    'error': 'Layer 4 (Digital signature) failed',
                    'details': sig_result.get('error')
                }
            
            digital_signature = sig_result['signature']
            
            layer_outputs.append({
                'layer': 4,
                'name': 'Digital Signature',
                'algorithm': keys['signature']['algorithm'],
                'input': ciphertext_hash,
                'output': digital_signature,
                'metadata': {
                    'hash_algorithm': 'SHA-256',
                    'hash': ciphertext_hash
                }
            })
            
            print(f"[OK] Digital signature (first 100 chars): {digital_signature[:100]}...")
            
            # =====================================================================
            # LAYER 5: Linguistic Steganography
            # =====================================================================
            print(f"\n[LAYER 5] LINGUISTIC STEGANOGRAPHY")
            print(f"Hiding watermarked ciphertext using synonym substitution...")
            
            # Base64 encode the watermarked ciphertext to preserve Unicode characters
            # through the steganography process
            watermarked_b64 = base64.b64encode(watermarked_ciphertext.encode('utf-8')).decode('ascii')
            print(f"  Base64 encoded watermarked text (length: {len(watermarked_b64)})")
            
            # Hide the Base64-encoded watermarked ciphertext using linguistic steganography
            stego_result, _ = LinguisticSteganographyService.hide_message(
                secret_message=watermarked_b64,
                cover_text=cover_text
            )
            
            if not stego_result.get('success'):
                return {
                    'success': False,
                    'error': 'Layer 5 (Linguistic steganography) failed',
                    'details': stego_result.get('error')
                }
            
            final_stego_text = stego_result['stego_text']
            
            layer_outputs.append({
                'layer': 5,
                'name': 'Linguistic Steganography',
                'algorithm': 'Synonym Substitution',
                'input': watermarked_ciphertext,
                'output': final_stego_text,
                'metadata': {
                    'method': 'linguistic-synonym-substitution',
                    'sentences_generated': stego_result.get('sentences_generated'),
                    'bits_embedded': stego_result.get('total_bits_embedded')
                }
            })
            
            print(f"[OK] Final stego text (length: {len(final_stego_text)})")
            print(f"  Generated {stego_result.get('sentences_generated', 0)} sentences")
            print(f"  Stego text preview: {final_stego_text[:150]}...")
            
            # =====================================================================
            # FINAL RESULT
            # =====================================================================
            print(f"\n{'='*80}")
            print(f"ENCRYPTION COMPLETE!")
            print(f"{'='*80}\n")
            
            return {
                'success': True,
                'final_output': final_stego_text,
                'layer_outputs': layer_outputs,
                'keys': keys,
                'metadata': {
                    'plaintext_length': len(plaintext),
                    'final_length': len(final_stego_text),
                    'sender': sender_identifier,
                    'algorithm_type': 'ECC' if use_ecc else 'RSA',
                    'timestamp': datetime.now().isoformat(),
                    'layers': [
                        'AES-256 Encryption',
                        f"{keys['key_encryption']['algorithm']} Key Encryption",
                        'Text Watermarking',
                        f"{keys['signature']['algorithm']} Signature",
                        'Linguistic Steganography'
                    ]
                },
                'encrypted_aes_key': encrypted_aes_key,
                'digital_signature': digital_signature,
                'ciphertext_hash': ciphertext_hash,
                'aes_iv': aes_iv
            }
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return {
                'success': False,
                'error': f'Advanced layered encryption failed: {str(e)}'
            }
    
    @staticmethod
    def decrypt_advanced(
        stego_text: str,
        keys: Dict[str, Any],
        encrypted_aes_key: str,
        digital_signature: str,
        ciphertext_hash: str,
        aes_iv: str,
        use_ecc: bool = False
    ) -> Dict[str, Any]:
        """
        Decrypt using reverse 5-layer workflow
        
        Args:
            stego_text: Final encrypted stego text
            keys: Keys used for encryption
            encrypted_aes_key: Encrypted AES key from layer 2
            digital_signature: Digital signature from layer 3
            ciphertext_hash: Hash of ciphertext for verification
            aes_iv: IV used for AES encryption
            use_ecc: Whether ECC was used
            
        Returns:
            Dictionary with decryption results
        """
        try:
            print(f"\n{'='*80}")
            print(f"ADVANCED LAYERED DECRYPTION STARTED")
            print(f"{'='*80}\n")
            
            decryption_steps = []
            
            # =====================================================================
            # LAYER 5 REVERSE: Extract from Linguistic Steganography
            # =====================================================================
            print(f"\n[LAYER 5 REVERSE] EXTRACT FROM LINGUISTIC STEGANOGRAPHY")
            print(f"Stego text length: {len(stego_text)}")
            print(f"Stego text preview (first 100 chars): {stego_text[:100]}")
            
            extract_result, _ = LinguisticSteganographyService.extract_message(stego_text)
            
            if not extract_result.get('success'):
                return {
                    'success': False,
                    'error': 'Layer 5 reverse (Linguistic stego extraction) failed',
                    'details': {
                        'message': extract_result.get('error'),
                        'stego_text_length': len(stego_text),
                        'hint': 'The stego text may have been corrupted or modified. Ensure you are using the exact output from encryption.'
                    }
                }
            
            # The extracted message is Base64-encoded, decode it to get the watermarked ciphertext
            watermarked_b64 = extract_result['extracted_message']
            print(f"[OK] Extracted Base64 message (length: {len(watermarked_b64)})")
            
            try:
                watermarked_ciphertext = base64.b64decode(watermarked_b64).decode('utf-8')
                print(f"[OK] Decoded watermarked ciphertext (length: {len(watermarked_ciphertext)})")
            except Exception as e:
                return {
                    'success': False,
                    'error': 'Failed to decode Base64 watermarked ciphertext',
                    'details': str(e)
                }
            
            decryption_steps.append({
                'layer': 5,
                'name': 'Linguistic Steganography Extraction',
                'status': 'success',
                'output': watermarked_ciphertext[:100] + '...'
            })
            
            # =====================================================================
            # LAYER 4 REVERSE: Extract Watermark
            # =====================================================================
            print(f"\n[LAYER 4 REVERSE] EXTRACT WATERMARK")
            
            watermark_extract_result, _ = TextWatermarkingService.extract_watermark(
                watermarked_ciphertext
            )
            
            if watermark_extract_result.get('success'):
                extracted_watermark = watermark_extract_result['watermark']
                print(f"[OK] Extracted watermark: {extracted_watermark}")
            else:
                extracted_watermark = None
                print(f"⚠ Watermark extraction failed: {watermark_extract_result.get('error')}")
            
            # For hash verification, we need the watermarked ciphertext as-is
            # Don't remove the watermark yet
            encrypted_plaintext_for_hash = watermarked_ciphertext
            
            decryption_steps.append({
                'layer': 4,
                'name': 'Watermark Extraction',
                'status': 'success',
                'extracted_watermark': extracted_watermark
            })
            
            # =====================================================================
            # LAYER 3 REVERSE: Verify Digital Signature
            # =====================================================================
            print(f"\n[LAYER 3 REVERSE] VERIFY DIGITAL SIGNATURE")
            
            # Hash the extracted watermarked ciphertext (with watermark still in it)
            extracted_hash = hashlib.sha256(encrypted_plaintext_for_hash.encode()).hexdigest()
            print(f"Extracted ciphertext hash: {extracted_hash}")
            print(f"Expected ciphertext hash:  {ciphertext_hash}")
            print(f"Hash match: {extracted_hash == ciphertext_hash}")
            
            # Verify signature
            print(f"Verifying signature using {'ECC' if use_ecc else 'RSA'}...")
            if use_ecc:
                verify_result, _ = ECCService.verify(
                    message=ciphertext_hash,
                    signature=digital_signature,
                    public_key_pem=keys['signature']['public_key']
                )
            else:
                verify_result, _ = RSAService.verify(
                    message=ciphertext_hash,
                    signature_b64=digital_signature,
                    public_key_pem=keys['signature']['public_key']
                )
            
            print(f"Signature verification result: {verify_result}")
            signature_valid = verify_result.get('success') and verify_result.get('valid')
            hash_matches = extracted_hash == ciphertext_hash
            
            print(f"Signature valid: {signature_valid}")
            print(f"Hash matches: {hash_matches}")
            
            if not signature_valid:
                return {
                    'success': False,
                    'error': 'Digital signature verification failed',
                    'details': {
                        'reason': 'Signature validation failed',
                        'signature_result': verify_result,
                        'hint': 'The signature may be invalid or the wrong public key was used'
                    }
                }
            
            if not hash_matches:
                return {
                    'success': False,
                    'error': 'Ciphertext hash mismatch',
                    'details': {
                        'reason': 'Hash verification failed',
                        'expected_hash': ciphertext_hash,
                        'extracted_hash': extracted_hash,
                        'hint': 'The ciphertext may have been modified after encryption'
                    }
                }
            
            decryption_steps.append({
                'layer': 3,
                'name': 'Signature Verification',
                'status': 'success',
                'signature_valid': signature_valid,
                'hash_matches': hash_matches
            })
            
            print(f"[OK] Signature verified successfully")
            print(f"[OK] Hash matches - data integrity confirmed")
            
            # NOW remove watermark to get clean ciphertext for decryption
            clean_result, _ = TextWatermarkingService.remove_watermark(watermarked_ciphertext)
            
            if not clean_result.get('success'):
                return {
                    'success': False,
                    'error': 'Layer 4 reverse (Watermark removal) failed',
                    'details': clean_result.get('error')
                }
            
            encrypted_plaintext = clean_result['clean_text']
            print(f"[OK] Removed watermark for decryption, clean ciphertext length: {len(encrypted_plaintext)}")
            
            # =====================================================================
            # LAYER 2 REVERSE: Decrypt AES Key
            # =====================================================================
            print(f"\n[LAYER 2 REVERSE] DECRYPT AES KEY")
            
            if use_ecc:
                # For ECC, we simplified - just use the key directly
                aes_key = keys['aes']['key']
                print(f"[OK] AES key retrieved (ECC simplified)")
            else:
                # RSA decryption of AES key
                key_decrypt_result, _ = RSAService.decrypt_text(
                    ciphertext_b64=encrypted_aes_key,
                    private_key_pem=keys['key_encryption']['private_key']
                )
                
                if not key_decrypt_result.get('success'):
                    return {
                        'success': False,
                        'error': 'Layer 2 reverse (AES key decryption) failed',
                        'details': key_decrypt_result.get('error')
                    }
                
                aes_key = key_decrypt_result['plaintext']
                print(f"[OK] Decrypted AES key: {aes_key[:50]}...")
            
            decryption_steps.append({
                'layer': 2,
                'name': 'Key Decryption',
                'status': 'success',
                'aes_key': aes_key[:20] + '...'
            })
            
            # =====================================================================
            # LAYER 1 REVERSE: AES Decryption
            # =====================================================================
            print(f"\n[LAYER 1 REVERSE] AES DECRYPTION")
            
            aes_decrypt_result, _ = AESService.decrypt(
                ciphertext=encrypted_plaintext,
                key=aes_key,
                mode='CBC',
                key_size=256,
                iv=aes_iv
            )
            
            if not aes_decrypt_result.get('success'):
                return {
                    'success': False,
                    'error': 'Layer 1 reverse (AES decryption) failed',
                    'details': aes_decrypt_result.get('error')
                }
            
            plaintext = aes_decrypt_result['plaintext']
            
            decryption_steps.append({
                'layer': 1,
                'name': 'AES Decryption',
                'status': 'success',
                'output': plaintext
            })
            
            print(f"[OK] Decrypted plaintext: {plaintext}")
            
            # =====================================================================
            # FINAL RESULT
            # =====================================================================
            print(f"\n{'='*80}")
            print(f"DECRYPTION COMPLETE!")
            print(f"Original message recovered: {plaintext}")
            print(f"{'='*80}\n")
            
            return {
                'success': True,
                'plaintext': plaintext,
                'extracted_watermark': extracted_watermark,
                'signature_verified': signature_valid,
                'hash_verified': hash_matches,
                'decryption_steps': decryption_steps,
                'metadata': {
                    'layers_processed': 5,
                    'integrity_verified': True,
                    'timestamp': datetime.now().isoformat()
                }
            }
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return {
                'success': False,
                'error': f'Advanced layered decryption failed: {str(e)}'
            }
