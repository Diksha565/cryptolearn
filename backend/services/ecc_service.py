from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.backends import default_backend
from tinyec import registry
import secrets
import hashlib
import base64
from .utils import encode_base64, decode_base64, create_error_response, create_success_response, CryptoException

class ECCService:
    """Service for ECC key generation, signing, verification, and ECDH operations"""
    
    # Available curves for tinyec ECDH operations
    TINYEC_CURVES = [
        'brainpoolP256r1', 'brainpoolP384r1', 'brainpoolP512r1',
        'secp192r1', 'secp224r1', 'secp256r1', 'secp384r1', 'secp521r1'
    ]
    
    @staticmethod
    def _get_curve(curve_name: str):
        """Get curve object from curve name"""
        curve_map = {
            'secp256r1': ec.SECP256R1(),
            'secp384r1': ec.SECP384R1(),
            'secp521r1': ec.SECP521R1()
        }
        return curve_map.get(curve_name.lower())
    
    @staticmethod
    def _compress_point(public_key):
        """Compress elliptic curve point for ECDH"""
        return hex(public_key.x) + hex(public_key.y % 2)[2:]
    
    @staticmethod
    def generate_keypair(curve: str = 'secp256r1'):
        """
        Generate ECC public/private key pair
        
        Args:
            curve: Elliptic curve name (secp256r1, secp384r1, secp521r1)
        
        Returns:
            Tuple of (result_dict, status_code)
        """
        try:
            curve_obj = ECCService._get_curve(curve)
            if not curve_obj:
                return create_error_response("Invalid curve. Supported curves: secp256r1, secp384r1, secp521r1")
            
            # Generate private key
            private_key = ec.generate_private_key(curve_obj, default_backend())
            
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
            
            return create_success_response({
                "private_key": private_pem,
                "public_key": public_pem,
                "curve": curve,
                "key_size": private_key.curve.key_size,
                "algorithm": "ECDSA"
            })
        
        except Exception as e:
            return create_error_response(f"Key generation failed: {str(e)}")
    
    @staticmethod
    def generate_ecdh_keypair(curve_name: str = 'brainpoolP256r1'):
        """
        Generate ECDH key pair using tinyec
        
        Args:
            curve_name: Name of the elliptic curve
        
        Returns:
            Tuple of (result_dict, status_code)
        """
        try:
            if curve_name not in ECCService.TINYEC_CURVES:
                return create_error_response(f"Invalid curve. Supported curves: {', '.join(ECCService.TINYEC_CURVES)}")
            
            # Get the curve
            curve = registry.get_curve(curve_name)
            
            # Generate private key (random integer)
            private_key = secrets.randbelow(curve.field.n)
            
            # Generate public key (point on curve)
            public_key = private_key * curve.g
            
            # Compress public key
            compressed_public = ECCService._compress_point(public_key)
            
            return create_success_response({
                "private_key": hex(private_key),
                "public_key_x": hex(public_key.x),
                "public_key_y": hex(public_key.y),
                "compressed_public_key": compressed_public,
                "curve": curve_name,
                "field_size": curve.field.n.bit_length(),
                "generator_x": hex(curve.g.x),
                "generator_y": hex(curve.g.y),
                "algorithm": "ECDH"
            })
        
        except Exception as e:
            return create_error_response(f"ECDH key generation failed: {str(e)}")
    
    @staticmethod
    def ecdh_shared_secret(private_key_a: str, public_key_b_x: str, public_key_b_y: str, curve_name: str = 'brainpoolP256r1'):
        """
        Calculate ECDH shared secret
        
        Args:
            private_key_a: Private key of party A (hex string)
            public_key_b_x: X coordinate of party B's public key (hex string)
            public_key_b_y: Y coordinate of party B's public key (hex string)
            curve_name: Name of the elliptic curve
        
        Returns:
            Tuple of (result_dict, status_code)
        """
        try:
            if curve_name not in ECCService.TINYEC_CURVES:
                return create_error_response(f"Invalid curve. Supported curves: {', '.join(ECCService.TINYEC_CURVES)}")
            
            # Get the curve
            curve = registry.get_curve(curve_name)
            
            # Convert hex strings to integers
            private_a = int(private_key_a, 16)
            pub_b_x = int(public_key_b_x, 16)
            pub_b_y = int(public_key_b_y, 16)
            
            # Create public key point for party B
            from tinyec.ec import Point
            public_key_b = Point(curve, pub_b_x, pub_b_y)
            
            # Calculate shared secret
            shared_secret_point = private_a * public_key_b
            
            # Compress the shared secret
            shared_secret_compressed = ECCService._compress_point(shared_secret_point)
            
            # Generate a hash of the shared secret for practical use
            shared_secret_hash = hashlib.sha256(
                (str(shared_secret_point.x) + str(shared_secret_point.y)).encode()
            ).hexdigest()
            
            return create_success_response({
                "shared_secret_x": hex(shared_secret_point.x),
                "shared_secret_y": hex(shared_secret_point.y),
                "compressed_shared_secret": shared_secret_compressed,
                "shared_secret_hash": shared_secret_hash,
                "curve": curve_name,
                "algorithm": "ECDH"
            })
        
        except Exception as e:
            return create_error_response(f"ECDH shared secret calculation failed: {str(e)}")
    
    @staticmethod
    def sign(message: str, private_key_pem: str):
        """
        Sign a message using ECC private key (ECDSA)
        
        Args:
            message: Message to sign
            private_key_pem: PEM formatted private key
        
        Returns:
            Tuple of (result_dict, status_code)
        """
        try:
            if not message or not private_key_pem:
                return create_error_response("Message and private key are required")
            
            # Load private key
            private_key = serialization.load_pem_private_key(
                private_key_pem.encode('utf-8'),
                password=None,
                backend=default_backend()
            )
            
            # Sign message
            message_bytes = message.encode('utf-8')
            signature = private_key.sign(
                message_bytes,
                ec.ECDSA(hashes.SHA256())
            )
            
            return create_success_response({
                "signature": encode_base64(signature),
                "message": message,
                "curve": private_key.curve.name,
                "key_size": private_key.curve.key_size,
                "hash_algorithm": "SHA256",
                "algorithm": "ECDSA"
            })
        
        except Exception as e:
            return create_error_response(f"Signing failed: {str(e)}")
    
    @staticmethod
    def verify(message: str, signature: str, public_key_pem: str):
        """
        Verify ECC signature (ECDSA)
        
        Args:
            message: Original message
            signature: Base64 encoded signature
            public_key_pem: PEM formatted public key
        
        Returns:
            Tuple of (result_dict, status_code)
        """
        try:
            if not message or not signature or not public_key_pem:
                return create_error_response("Message, signature, and public key are required")
            
            # Load public key
            public_key = serialization.load_pem_public_key(
                public_key_pem.encode('utf-8'),
                backend=default_backend()
            )
            
            # Decode signature
            signature_bytes = decode_base64(signature)
            
            # Verify signature
            try:
                public_key.verify(
                    signature_bytes,
                    message.encode('utf-8'),
                    ec.ECDSA(hashes.SHA256())
                )
                is_valid = True
            except Exception:
                is_valid = False
            
            return create_success_response({
                "valid": is_valid,
                "message": message,
                "curve": public_key.curve.name,
                "key_size": public_key.curve.key_size,
                "hash_algorithm": "SHA256",
                "algorithm": "ECDSA"
            })
        
        except Exception as e:
            return create_error_response(f"Verification failed: {str(e)}")
    
    @staticmethod
    def get_curve_info(curve_name: str = 'brainpoolP256r1'):
        """
        Get information about an elliptic curve
        
        Args:
            curve_name: Name of the elliptic curve
        
        Returns:
            Tuple of (result_dict, status_code)
        """
        try:
            if curve_name not in ECCService.TINYEC_CURVES:
                return create_error_response(f"Invalid curve. Supported curves: {', '.join(ECCService.TINYEC_CURVES)}")
            
            # Get the curve
            curve = registry.get_curve(curve_name)
            
            return create_success_response({
                "curve_name": curve_name,
                "field_size": curve.field.n.bit_length(),
                "field_prime": hex(curve.field.n),
                "generator_x": hex(curve.g.x),
                "generator_y": hex(curve.g.y),
                "curve_equation": f"y² = x³ + {curve.a}x + {curve.b} (mod {hex(curve.field.n)})",
                "security_level": curve.field.n.bit_length() // 2,
                "description": ECCService._get_curve_description(curve_name)
            })
        
        except Exception as e:
            return create_error_response(f"Curve info retrieval failed: {str(e)}")
    
    @staticmethod
    def _get_curve_description(curve_name: str) -> str:
        """Get description for a curve"""
        descriptions = {
            'brainpoolP256r1': 'Brainpool 256-bit curve, widely used in European standards',
            'brainpoolP384r1': 'Brainpool 384-bit curve, higher security level',
            'brainpoolP512r1': 'Brainpool 512-bit curve, maximum security level',
            'secp192r1': 'NIST P-192 curve, 192-bit security',
            'secp224r1': 'NIST P-224 curve, 224-bit security',
            'secp256r1': 'NIST P-256 curve, most widely used, 256-bit security',
            'secp384r1': 'NIST P-384 curve, 384-bit security',
            'secp521r1': 'NIST P-521 curve, highest NIST security level'
        }
        return descriptions.get(curve_name, 'Custom elliptic curve')
    
    @staticmethod
    def compare_with_rsa(ecc_key_size: int):
        """
        Compare ECC key size with equivalent RSA key size
        
        Args:
            ecc_key_size: ECC key size in bits
        
        Returns:
            Tuple of (result_dict, status_code)
        """
        try:
            # ECC to RSA equivalent security mapping
            ecc_to_rsa = {
                160: 1024,
                224: 2048,
                256: 3072,
                384: 7680,
                512: 15360,
                521: 15360
            }
            
            rsa_equivalent = ecc_to_rsa.get(ecc_key_size, "Unknown")
            
            # Calculate efficiency ratio
            if rsa_equivalent != "Unknown":
                efficiency_ratio = rsa_equivalent / ecc_key_size
            else:
                efficiency_ratio = "Unknown"
            
            return create_success_response({
                "ecc_key_size": ecc_key_size,
                "rsa_equivalent": rsa_equivalent,
                "efficiency_ratio": f"{efficiency_ratio:.1f}x" if efficiency_ratio != "Unknown" else "Unknown",
                "bandwidth_savings": f"{((rsa_equivalent - ecc_key_size) / rsa_equivalent * 100):.1f}%" if rsa_equivalent != "Unknown" else "Unknown",
                "security_level": ecc_key_size // 2,
                "advantages": [
                    "Smaller key sizes",
                    "Faster operations",
                    "Lower bandwidth requirements",
                    "Better performance on mobile devices",
                    "Equivalent security with smaller keys"
                ]
            })
        
        except Exception as e:
            return create_error_response(f"Comparison failed: {str(e)}")
    
    @staticmethod
    def generate_shared_secret(private_key_pem: str, public_key_pem: str):
        """
        Generate shared secret using ECDH
        
        Args:
            private_key_pem: PEM formatted private key
            public_key_pem: PEM formatted public key
        
        Returns:
            Tuple of (result_dict, status_code)
        """
        try:
            if not private_key_pem or not public_key_pem:
                return create_error_response("Both private and public keys are required")
            
            # Load keys
            private_key = serialization.load_pem_private_key(
                private_key_pem.encode('utf-8'),
                password=None,
                backend=default_backend()
            )
            
            public_key = serialization.load_pem_public_key(
                public_key_pem.encode('utf-8'),
                backend=default_backend()
            )
            
            # Generate shared secret
            shared_key = private_key.exchange(ec.ECDH(), public_key)
            
            # Hash the shared secret for use as symmetric key
            digest = hashes.Hash(hashes.SHA256(), backend=default_backend())
            digest.update(shared_key)
            shared_secret = digest.finalize()
            
            return create_success_response({
                "shared_secret": encode_base64(shared_secret),
                "curve": private_key.curve.name,
                "key_size": private_key.curve.key_size
            })
        
        except Exception as e:
            return create_error_response(f"Shared secret generation failed: {str(e)}")
