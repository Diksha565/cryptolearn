from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
from Crypto.Util.Padding import pad, unpad
import hashlib
from .utils import encode_base64, decode_base64, create_error_response, create_success_response, CryptoException

class AESService:
    """Service for AES encryption and decryption operations"""
    
    @staticmethod
    def _prepare_key(key: str, key_size: int) -> bytes:
        """Prepare key by hashing and truncating to required size"""
        key_bytes = key.encode('utf-8')
        hash_key = hashlib.sha256(key_bytes).digest()
        return hash_key[:key_size // 8]
    
    @staticmethod
    def _prepare_iv() -> bytes:
        """Generate random IV for CBC mode"""
        return get_random_bytes(16)  # AES block size is 16 bytes
    
    @staticmethod
    def encrypt(plaintext: str, key: str, mode: str = 'CBC', key_size: int = 256, iv: str = None):
        """
        Encrypt plaintext using AES
        
        Args:
            plaintext: Text to encrypt
            key: Encryption key
            mode: AES mode (ECB or CBC)
            key_size: Key size in bits (128, 192, 256)
            iv: IV for CBC mode (optional, will generate if not provided)
        
        Returns:
            Tuple of (result_dict, status_code)
        """
        try:
            # Validate inputs
            if not plaintext or not key:
                return create_error_response("Plaintext and key are required")
            
            if key_size not in [128, 192, 256]:
                return create_error_response("Key size must be 128, 192, or 256 bits")
            
            if mode.upper() not in ['ECB', 'CBC']:
                return create_error_response("Mode must be ECB or CBC")
            
            # Prepare key
            prepared_key = AESService._prepare_key(key, key_size)
            
            # Prepare plaintext
            plaintext_bytes = plaintext.encode('utf-8')
            
            # Create cipher based on mode
            if mode.upper() == 'ECB':
                cipher = AES.new(prepared_key, AES.MODE_ECB)
                padded_data = pad(plaintext_bytes, AES.block_size)
                ciphertext = cipher.encrypt(padded_data)
                
                return create_success_response({
                    "ciphertext": encode_base64(ciphertext),
                    "mode": mode.upper(),
                    "key_size": key_size,
                    "iv": None
                })
            
            else:  # CBC mode
                if iv:
                    # First check if it's exactly 16 characters - treat as plain text
                    if len(iv) == 16:
                        iv_bytes = iv.encode('utf-8')
                    else:
                        # Try to decode as base64
                        try:
                            iv_bytes = decode_base64(iv)
                            if len(iv_bytes) != 16:
                                return create_error_response("Incorrect IV length (it must be 16 bytes long)")
                        except:
                            # If base64 decode fails, treat as plain text and pad/truncate to 16 bytes
                            iv_text = iv.encode('utf-8')
                            if len(iv_text) < 16:
                                iv_bytes = iv_text + b'\x00' * (16 - len(iv_text))  # Pad with zeros
                            else:
                                iv_bytes = iv_text[:16]  # Truncate to 16 bytes
                else:
                    iv_bytes = AESService._prepare_iv()
                
                cipher = AES.new(prepared_key, AES.MODE_CBC, iv_bytes)
                padded_data = pad(plaintext_bytes, AES.block_size)
                ciphertext = cipher.encrypt(padded_data)
                
                return create_success_response({
                    "ciphertext": encode_base64(ciphertext),
                    "mode": mode.upper(),
                    "key_size": key_size,
                    "iv": encode_base64(iv_bytes)
                })
        
        except Exception as e:
            return create_error_response(f"Encryption failed: {str(e)}")
    
    @staticmethod
    def decrypt(ciphertext: str, key: str, mode: str = 'CBC', key_size: int = 256, iv: str = None):
        """
        Decrypt ciphertext using AES
        
        Args:
            ciphertext: Base64 encoded ciphertext
            key: Decryption key
            mode: AES mode (ECB or CBC)
            key_size: Key size in bits (128, 192, 256)
            iv: Base64 encoded IV (required for CBC mode)
        
        Returns:
            Tuple of (result_dict, status_code)
        """
        try:
            # Validate inputs
            if not ciphertext or not key:
                return create_error_response("Ciphertext and key are required")
            
            if key_size not in [128, 192, 256]:
                return create_error_response("Key size must be 128, 192, or 256 bits")
            
            if mode.upper() not in ['ECB', 'CBC']:
                return create_error_response("Mode must be ECB or CBC")
            
            if mode.upper() == 'CBC' and (not iv or not iv.strip()):
                return create_error_response("IV is required for CBC mode")
            
            # Prepare key and ciphertext
            prepared_key = AESService._prepare_key(key, key_size)
            ciphertext_bytes = decode_base64(ciphertext)
            
            # Create cipher based on mode
            if mode.upper() == 'ECB':
                cipher = AES.new(prepared_key, AES.MODE_ECB)
                decrypted_padded = cipher.decrypt(ciphertext_bytes)
                decrypted_data = unpad(decrypted_padded, AES.block_size)
                
            else:  # CBC mode
                # First check if it's exactly 16 characters - treat as plain text
                if len(iv) == 16:
                    iv_bytes = iv.encode('utf-8')
                else:
                    # Try to decode as base64
                    try:
                        iv_bytes = decode_base64(iv)
                        if len(iv_bytes) != 16:
                            return create_error_response("Incorrect IV length (it must be 16 bytes long)")
                    except:
                        # If base64 decode fails, treat as plain text and pad/truncate to 16 bytes
                        iv_text = iv.encode('utf-8')
                        if len(iv_text) < 16:
                            iv_bytes = iv_text + b'\x00' * (16 - len(iv_text))  # Pad with zeros
                        else:
                            iv_bytes = iv_text[:16]  # Truncate to 16 bytes
                
                cipher = AES.new(prepared_key, AES.MODE_CBC, iv_bytes)
                decrypted_padded = cipher.decrypt(ciphertext_bytes)
                decrypted_data = unpad(decrypted_padded, AES.block_size)
            
            plaintext = decrypted_data.decode('utf-8')
            
            return create_success_response({
                "plaintext": plaintext,
                "mode": mode.upper(),
                "key_size": key_size
            })
        
        except Exception as e:
            return create_error_response(f"Decryption failed: {str(e)}")
