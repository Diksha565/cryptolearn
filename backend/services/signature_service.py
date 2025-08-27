from .rsa_service import RSAService
from .ecc_service import ECCService
from .utils import create_error_response, create_success_response

class SignatureService:
    """Service for digital signature operations using RSA or ECC"""
    
    @staticmethod
    def sign_message(message: str, private_key_pem: str, algorithm: str = 'RSA'):
        """
        Sign a message using specified algorithm
        
        Args:
            message: Message to sign
            private_key_pem: PEM formatted private key
            algorithm: Signing algorithm ('RSA' or 'ECC')
        
        Returns:
            Tuple of (result_dict, status_code)
        """
        try:
            if not message or not private_key_pem:
                return create_error_response("Message and private key are required")
            
            algorithm = algorithm.upper()
            
            if algorithm == 'RSA':
                result, status_code = RSAService.sign(message, private_key_pem)
                if status_code == 200:
                    result['algorithm'] = 'RSA'
                return result, status_code
            
            elif algorithm == 'ECC':
                result, status_code = ECCService.sign(message, private_key_pem)
                if status_code == 200:
                    result['algorithm'] = 'ECC'
                return result, status_code
            
            else:
                return create_error_response("Algorithm must be 'RSA' or 'ECC'")
        
        except Exception as e:
            return create_error_response(f"Signing failed: {str(e)}")
    
    @staticmethod
    def verify_signature(message: str, signature: str, public_key_pem: str, algorithm: str = 'RSA'):
        """
        Verify a signature using specified algorithm
        
        Args:
            message: Original message
            signature: Base64 encoded signature
            public_key_pem: PEM formatted public key
            algorithm: Signing algorithm ('RSA' or 'ECC')
        
        Returns:
            Tuple of (result_dict, status_code)
        """
        try:
            if not message or not signature or not public_key_pem:
                return create_error_response("Message, signature, and public key are required")
            
            algorithm = algorithm.upper()
            
            if algorithm == 'RSA':
                result, status_code = RSAService.verify(message, signature, public_key_pem)
                if status_code == 200:
                    result['algorithm'] = 'RSA'
                return result, status_code
            
            elif algorithm == 'ECC':
                result, status_code = ECCService.verify(message, signature, public_key_pem)
                if status_code == 200:
                    result['algorithm'] = 'ECC'
                return result, status_code
            
            else:
                return create_error_response("Algorithm must be 'RSA' or 'ECC'")
        
        except Exception as e:
            return create_error_response(f"Verification failed: {str(e)}")
    
    @staticmethod
    def generate_keypair(algorithm: str = 'RSA', **kwargs):
        """
        Generate key pair for specified algorithm
        
        Args:
            algorithm: Algorithm type ('RSA' or 'ECC')
            **kwargs: Additional parameters (key_size for RSA, curve for ECC)
        
        Returns:
            Tuple of (result_dict, status_code)
        """
        try:
            algorithm = algorithm.upper()
            
            if algorithm == 'RSA':
                key_size = kwargs.get('key_size', 2048)
                result, status_code = RSAService.generate_keypair(key_size)
                if status_code == 200:
                    result['algorithm'] = 'RSA'
                return result, status_code
            
            elif algorithm == 'ECC':
                curve = kwargs.get('curve', 'secp256r1')
                result, status_code = ECCService.generate_keypair(curve)
                if status_code == 200:
                    result['algorithm'] = 'ECC'
                return result, status_code
            
            else:
                return create_error_response("Algorithm must be 'RSA' or 'ECC'")
        
        except Exception as e:
            return create_error_response(f"Key generation failed: {str(e)}")
    
    @staticmethod
    def sign_and_verify(message: str, algorithm: str = 'RSA', **kwargs):
        """
        Complete workflow: generate keys, sign message, and verify signature
        
        Args:
            message: Message to sign and verify
            algorithm: Algorithm type ('RSA' or 'ECC')
            **kwargs: Additional parameters for key generation
        
        Returns:
            Tuple of (result_dict, status_code)
        """
        try:
            if not message:
                return create_error_response("Message is required")
            
            # Generate key pair
            keypair_result, status_code = SignatureService.generate_keypair(algorithm, **kwargs)
            if status_code != 200:
                return keypair_result, status_code
            
            private_key = keypair_result['private_key']
            public_key = keypair_result['public_key']
            
            # Sign message
            sign_result, status_code = SignatureService.sign_message(message, private_key, algorithm)
            if status_code != 200:
                return sign_result, status_code
            
            signature = sign_result['signature']
            
            # Verify signature
            verify_result, status_code = SignatureService.verify_signature(message, signature, public_key, algorithm)
            if status_code != 200:
                return verify_result, status_code
            
            # Combine results
            combined_result = {
                "message": message,
                "algorithm": algorithm,
                "private_key": private_key,
                "public_key": public_key,
                "signature": signature,
                "verification_result": verify_result['valid'],
                "key_info": {
                    "algorithm": algorithm
                }
            }
            
            # Add algorithm-specific info
            if algorithm == 'RSA':
                combined_result['key_info']['key_size'] = keypair_result['key_size']
            elif algorithm == 'ECC':
                combined_result['key_info']['curve'] = keypair_result['curve']
                combined_result['key_info']['key_size'] = keypair_result['key_size']
            
            return create_success_response(combined_result)
        
        except Exception as e:
            return create_error_response(f"Sign and verify workflow failed: {str(e)}")
