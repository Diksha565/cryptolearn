import random
import math
from .utils import create_error_response, create_success_response

class RSAService:
    """Simple RSA implementation based on mathematical algorithm"""
    
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
    
    @staticmethod
    def generate_keypair(key_size: int = 64):
        """
        Generate simple RSA key pair using basic algorithm
        
        Args:
            key_size: Total key size in bits (32, 64, 128 for fast generation)
        
        Returns:
            Tuple of (result_dict, status_code)
        """
        try:
            if key_size not in [32, 64, 128]:
                return create_error_response("Key size must be 32, 64, or 128 bits for fast simple RSA")
            
            # For very fast demo generation, use predefined small primes
            if key_size <= 64:
                # Use very small primes for demo
                small_primes = [61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251]
                p = random.choice(small_primes)
                q = random.choice(small_primes)
                # Make sure p and q are different
                while p == q:
                    q = random.choice(small_primes)
            else:
                # Step 1: Generate two prime numbers p and q
                # Use smaller bit sizes for faster generation
                p_bits = 6  # Much smaller primes
                q_bits = 6
                
                p = RSAService.generate_prime(p_bits)
                q = RSAService.generate_prime(q_bits)
                
                # Make sure p and q are different
                while p == q:
                    q = RSAService.generate_prime(q_bits)
            
            # Step 2: Calculate n = p * q
            n = p * q
            
            # Step 3: Calculate Euler's totient function φ(n) = (p-1)(q-1)
            phi = (p - 1) * (q - 1)
            
            # Step 4: Choose e such that 1 < e < φ(n) and gcd(e, φ(n)) = 1
            # Start with small values for faster computation
            e = 3
            while e < phi and RSAService.gcd(e, phi) != 1:
                e += 2  # Try next odd number
            
            if e >= phi:
                e = 65537
                while e < phi and RSAService.gcd(e, phi) != 1:
                    e += 2
            
            # Step 5: Calculate d such that (d * e) ≡ 1 mod φ(n)
            d = RSAService.mod_inverse(e, phi)
            
            return create_success_response({
                "public_key": {"n": n, "e": e},
                "private_key": {"n": n, "d": d},
                "p": p,  # For educational purposes
                "q": q,  # For educational purposes
                "phi": phi,  # For educational purposes
                "key_size": key_size,
                "actual_n_bits": n.bit_length()
            })
            
        except Exception as ex:
            return create_error_response(f"Key generation failed: {str(ex)}")
    
    @staticmethod
    def encrypt_with_params(plaintext: str, p: int, q: int, e: int):
        """
        Encrypt message using RSA parameters p, q, e (no validation - accepts any input)
        
        Args:
            plaintext: Message to encrypt
            p: First number
            q: Second number  
            e: Public exponent
        
        Returns:
            Tuple of (result_dict, status_code)
        """
        try:
            # Calculate n (no validation - let user experiment)
            n = p * q
            
            # Just pass to the encrypt function - let it handle any issues
            return RSAService.encrypt(plaintext, n, e)
            
        except Exception as ex:
            return create_error_response(f"Encryption with parameters failed: {str(ex)}")
    
    @staticmethod
    def decrypt_with_params(ciphertext: str, p: int, q: int, d: int):
        """
        Decrypt message using RSA parameters p, q, d (no validation - accepts any input)
        
        Args:
            ciphertext: Ciphertext as string number
            p: First number
            q: Second number
            d: Private exponent
        
        Returns:
            Tuple of (result_dict, status_code)
        """
        try:
            # Calculate n (no validation - let user experiment)
            n = p * q
            
            # Just pass to the decrypt function - let it handle any issues
            return RSAService.decrypt(ciphertext, n, d)
            
        except Exception as ex:
            return create_error_response(f"Decryption with parameters failed: {str(ex)}")

    @staticmethod
    def encrypt(plaintext: str, n: int, e: int):
        """
        Encrypt numeric message using standard RSA algorithm
        
        Args:
            plaintext: Numeric message as string
            n: Public key modulus
            e: Public key exponent
        
        Returns:
            Tuple of (result_dict, status_code)
        """
        try:
            # Convert input to integer (standard RSA works with numbers)
            message_int = int(plaintext)
            
            # Standard RSA encryption: C = M^e mod n
            ciphertext_int = pow(message_int, e, n)
            
            return create_success_response({
                "ciphertext": str(ciphertext_int),
                "message_as_int": message_int
            })
            
        except ValueError:
            return create_error_response(f"Invalid input: '{plaintext}' is not a valid number")
        except Exception as ex:
            return create_error_response(f"Encryption failed: {str(ex)}")
    
    @staticmethod
    def decrypt(ciphertext: str, n: int, d: int):
        """
        Decrypt numeric ciphertext using standard RSA algorithm
        
        Args:
            ciphertext: Ciphertext as string number
            n: Private key modulus
            d: Private key exponent
        
        Returns:
            Tuple of (result_dict, status_code)
        """
        try:
            # Convert ciphertext to integer
            ciphertext_int = int(ciphertext)
            
            # Standard RSA decryption: M = C^d mod n
            message_int = pow(ciphertext_int, d, n)
            
            return create_success_response({
                "plaintext": str(message_int),
                "decrypted_int": message_int
            })
            
        except ValueError:
            return create_error_response(f"Invalid ciphertext: '{ciphertext}' is not a valid number")
        except Exception as ex:
            return create_error_response(f"Decryption failed: {str(ex)}")
    
    @staticmethod
    def encrypt_with_public_key(plaintext: str, public_key: str):
        """Encrypt with public key in JSON string format"""
        try:
            import json
            if isinstance(public_key, str):
                public_key = json.loads(public_key)
            
            if isinstance(public_key, dict) and 'n' in public_key and 'e' in public_key:
                return RSAService.encrypt(plaintext, public_key['n'], public_key['e'])
            else:
                return create_error_response("Invalid public key format. Expected: {'n': number, 'e': number}")
        except Exception as ex:
            return create_error_response(f"Encryption failed: {str(ex)}")
    
    @staticmethod
    def decrypt_with_private_key(ciphertext: str, private_key: str):
        """Decrypt with private key in JSON string format"""
        try:
            import json
            if isinstance(private_key, str):
                private_key = json.loads(private_key)
                
            if isinstance(private_key, dict) and 'n' in private_key and 'd' in private_key:
                return RSAService.decrypt(ciphertext, private_key['n'], private_key['d'])
            else:
                return create_error_response("Invalid private key format. Expected: {'n': number, 'd': number}")
        except Exception as ex:
            return create_error_response(f"Decryption failed: {str(ex)}")
