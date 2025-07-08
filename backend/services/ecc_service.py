from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.backends import default_backend
import hashlib
from .utils import encode_base64, decode_base64, create_error_response, create_success_response, CryptoException

class ECCService:
    """Service for ECC key generation, signing, and verification operations"""
    
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
                "key_size": private_key.curve.key_size
            })
        
        except Exception as e:
            return create_error_response(f"Key generation failed: {str(e)}")
    
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
                "key_size": private_key.curve.key_size
            })
        
        except Exception as e:
            return create_error_response(f"Signing failed: {str(e)}")
    
    @staticmethod
    def verify(message: str, signature: str, public_key_pem: str):
        """
        Verify a signature using ECC public key (ECDSA)
        
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
            
            # Verify signature
            message_bytes = message.encode('utf-8')
            signature_bytes = decode_base64(signature)
            
            try:
                public_key.verify(
                    signature_bytes,
                    message_bytes,
                    ec.ECDSA(hashes.SHA256())
                )
                
                return create_success_response({
                    "valid": True,
                    "message": message,
                    "curve": public_key.curve.name,
                    "key_size": public_key.curve.key_size
                })
            
            except Exception:
                return create_success_response({
                    "valid": False,
                    "message": message,
                    "curve": public_key.curve.name,
                    "key_size": public_key.curve.key_size
                })
        
        except Exception as e:
            return create_error_response(f"Verification failed: {str(e)}")
    
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
