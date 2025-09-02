import random
import math
import base64
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.asymmetric.rsa import RSAPrivateKey, RSAPublicKey
from .utils import create_error_response, create_success_response

class RSAService:
    """RSA implementation for text encryption/decryption using cryptography library"""
    
    @staticmethod
    def generate_keypair(key_size: int = 2048):
        """
        Generate RSA key pair using cryptography library
        
        Args:
            key_size: Key size in bits (1024, 2048, 3072, 4096)
        
        Returns:
            Tuple of (result_dict, status_code)
        """
        try:
            if key_size not in [1024, 2048, 3072, 4096]:
                return create_error_response("Key size must be 1024, 2048, 3072, or 4096 bits")
            
            # Generate private key
            private_key = rsa.generate_private_key(
                public_exponent=65537,
                key_size=key_size
            )
            
            # Get public key
            public_key = private_key.public_key()
            
            # Serialize keys to PEM format
            private_pem = private_key.private_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PrivateFormat.PKCS8,
                encryption_algorithm=serialization.NoEncryption()
            ).decode('utf-8')
            
            public_pem = public_key.public_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PublicFormat.SubjectPublicKeyInfo
            ).decode('utf-8')
            
            # Get key components for educational purposes
            private_numbers = private_key.private_numbers()
            public_numbers = private_numbers.public_numbers
            
            result = create_success_response({
                "message": "RSA key pair generated successfully",
                "private_key": private_pem,
                "public_key": public_pem,
                "key_size": key_size,
                "public_exponent": public_numbers.e,
                "modulus": public_numbers.n,
                "private_exponent": private_numbers.d,
                "p": private_numbers.p,
                "q": private_numbers.q
            })
            
            return result
            
        except Exception as e:
            return create_error_response(f"Key generation failed: {str(e)}")
    
    @staticmethod
    def encrypt_text(plaintext: str, public_key_pem: str):
        """
        Encrypt text using RSA public key
        
        Args:
            plaintext: Text to encrypt
            public_key_pem: PEM formatted public key
        
        Returns:
            Tuple of (result_dict, status_code)
        """
        try:
            if not plaintext:
                return create_error_response("Plaintext cannot be empty")
            
            # Load public key
            public_key = serialization.load_pem_public_key(public_key_pem.encode('utf-8'))
            
            # Check text length vs key size
            key_size = public_key.key_size
            max_length = (key_size // 8) - 2 * (256 // 8) - 2  # OAEP padding overhead
            
            if len(plaintext.encode('utf-8')) > max_length:
                return create_error_response(f"Text too long. Maximum length for {key_size}-bit key: {max_length} bytes")
            
            # Encrypt using OAEP padding
            ciphertext = public_key.encrypt(
                plaintext.encode('utf-8'),
                padding.OAEP(
                    mgf=padding.MGF1(algorithm=hashes.SHA256()),
                    algorithm=hashes.SHA256(),
                    label=None
                )
            )
            
            # Encode as base64 for safe transmission
            ciphertext_b64 = base64.b64encode(ciphertext).decode('utf-8')
            
            result = create_success_response({
                "message": "Text encrypted successfully",
                "ciphertext": ciphertext_b64,
                "original_length": len(plaintext),
                "encrypted_length": len(ciphertext),
                "key_size": key_size,
                "padding": "OAEP with SHA-256"
            })
            
            return result
            
        except Exception as e:
            return create_error_response(f"Encryption failed: {str(e)}")
    
    @staticmethod
    def decrypt_text(ciphertext_b64: str, private_key_pem: str):
        """
        Decrypt text using RSA private key
        
        Args:
            ciphertext_b64: Base64 encoded ciphertext
            private_key_pem: PEM formatted private key
        
        Returns:
            Tuple of (result_dict, status_code)
        """
        try:
            if not ciphertext_b64:
                return create_error_response("Ciphertext cannot be empty")
            
            # Load private key
            private_key = serialization.load_pem_private_key(
                private_key_pem.encode('utf-8'),
                password=None
            )
            
            # Decode base64 ciphertext
            try:
                ciphertext = base64.b64decode(ciphertext_b64)
            except Exception:
                return create_error_response("Invalid base64 ciphertext format")
            
            # Decrypt using OAEP padding
            plaintext_bytes = private_key.decrypt(
                ciphertext,
                padding.OAEP(
                    mgf=padding.MGF1(algorithm=hashes.SHA256()),
                    algorithm=hashes.SHA256(),
                    label=None
                )
            )
            
            plaintext = plaintext_bytes.decode('utf-8')
            
            result = create_success_response({
                "message": "Text decrypted successfully",
                "plaintext": plaintext,
                "decrypted_length": len(plaintext),
                "key_size": private_key.key_size
            })
            
            return result
            
        except Exception as e:
            return create_error_response(f"Decryption failed: {str(e)}")
    
    @staticmethod
    def sign(message: str, private_key_pem: str):
        """
        Sign a message using RSA private key
        
        Args:
            message: Message to sign
            private_key_pem: PEM formatted private key
        
        Returns:
            Tuple of (result_dict, status_code)
        """
        try:
            if not message:
                return create_error_response("Message cannot be empty")
            
            # Load private key
            private_key = serialization.load_pem_private_key(
                private_key_pem.encode('utf-8'),
                password=None
            )
            
            # Sign the message
            signature = private_key.sign(
                message.encode('utf-8'),
                padding.PSS(
                    mgf=padding.MGF1(hashes.SHA256()),
                    salt_length=padding.PSS.MAX_LENGTH
                ),
                hashes.SHA256()
            )
            
            # Encode signature as base64
            signature_b64 = base64.b64encode(signature).decode('utf-8')
            
            result = create_success_response({
                "message": "Message signed successfully",
                "signature": signature_b64,
                "message_length": len(message),
                "signature_algorithm": "RSA-PSS with SHA-256",
                "hash_algorithm": "SHA-256"
            })
            
            return result
            
        except Exception as e:
            return create_error_response(f"Signing failed: {str(e)}")
    
    @staticmethod
    def verify(message: str, signature_b64: str, public_key_pem: str):
        """
        Verify a signature using RSA public key
        
        Args:
            message: Original message
            signature_b64: Base64 encoded signature
            public_key_pem: PEM formatted public key
        
        Returns:
            Tuple of (result_dict, status_code)
        """
        try:
            if not message or not signature_b64:
                return create_error_response("Message and signature cannot be empty")
            
            # Load public key
            public_key = serialization.load_pem_public_key(public_key_pem.encode('utf-8'))
            
            # Decode signature
            try:
                signature = base64.b64decode(signature_b64)
            except Exception:
                return create_error_response("Invalid base64 signature format")
            
            # Verify signature
            try:
                public_key.verify(
                    signature,
                    message.encode('utf-8'),
                    padding.PSS(
                        mgf=padding.MGF1(hashes.SHA256()),
                        salt_length=padding.PSS.MAX_LENGTH
                    ),
                    hashes.SHA256()
                )
                is_valid = True
            except Exception:
                is_valid = False
            
            result = create_success_response({
                "message": "Signature verification completed",
                "valid": is_valid,
                "message_length": len(message),
                "signature_algorithm": "RSA-PSS with SHA-256"
            })
            
            return result
            
        except Exception as e:
            return create_error_response(f"Verification failed: {str(e)}")
    
    # Keep the old methods for backward compatibility with educational demos
    @staticmethod
    def is_prime(n, k=5):
        """Miller-Rabin primality test - much faster than trial division"""
        if n < 2:
            return False
        if n == 2 or n == 3:
            return True
        if n % 2 == 0:
            return False
        
        # Write n-1 as d * 2^r
        r = 0
        d = n - 1
        while d % 2 == 0:
            r += 1
            d //= 2
        
        # Witness loop
        for _ in range(k):
            a = random.randrange(2, n - 1)
            x = pow(a, d, n)
            
            if x == 1 or x == n - 1:
                continue
            
            for _ in range(r - 1):
                x = pow(x, 2, n)
                if x == n - 1:
                    break
            else:
                return False
        
        return True
    
    @staticmethod
    def generate_prime(bits):
        """Generate a random prime number with specified bits using Miller-Rabin test"""
        while True:
            # Generate random odd number with specified bits
            num = random.getrandbits(bits)
            # Ensure it's in the right range and odd
            num |= (1 << bits - 1) | 1
            
            # Quick check for small factors
            if num % 3 == 0 or num % 5 == 0 or num % 7 == 0 or num % 11 == 0:
                continue
                
            if RSAService.is_prime(num):
                return num
    
    @staticmethod
    def gcd(a, b):
        """Greatest Common Divisor"""
        while b:
            a, b = b, a % b
        return a
    
    @staticmethod
    def mod_inverse(e, phi):
        """Find modular multiplicative inverse using Extended Euclidean Algorithm"""
        def extended_gcd(a, b):
            if a == 0:
                return b, 0, 1
            gcd, x1, y1 = extended_gcd(b % a, a)
            x = y1 - (b // a) * x1
            y = x1
            return gcd, x, y
        
        gcd, x, _ = extended_gcd(e, phi)
        if gcd != 1:
            raise ValueError("Modular inverse does not exist")
        return (x % phi + phi) % phi
