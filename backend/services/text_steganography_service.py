"""
Text Steganography Service
Hides secret messages within cover text using linguistic steganography
Methods: Word spacing, synonym substitution, sentence generation
"""

import random
import re
from typing import Dict, Any, Tuple, List


class TextSteganographyService:
    """Service for hiding and extracting messages in text"""
    
    # Cover text templates for different message lengths
    COVER_TEMPLATES = {
        'short': [
            "The quick brown fox jumps over the lazy dog near the peaceful river.",
            "In a world of constant change, adaptability becomes our greatest strength.",
            "Technology continues to reshape how we communicate and share information.",
            "Every journey begins with a single step towards your destination.",
            "Nature provides endless inspiration for creativity and innovation daily."
        ],
        'medium': [
            "The advancement of modern technology has revolutionized the way we communicate and interact with each other. "
            "Through the internet and mobile devices, people can now connect instantly across vast distances. "
            "This digital transformation has opened up new opportunities for collaboration and innovation. "
            "However, it also brings challenges that we must carefully address.",
            
            "In today's fast-paced world, effective communication plays a crucial role in success. "
            "Whether in business or personal relationships, the ability to convey ideas clearly matters greatly. "
            "Digital platforms have made it easier to share information and stay connected. "
            "Understanding these tools helps us navigate the modern landscape more effectively.",
            
            "The natural world offers countless examples of remarkable adaptation and resilience. "
            "From the smallest microorganisms to the largest ecosystems, life finds a way to thrive. "
            "Scientists continue to study these patterns to better understand our planet. "
            "This knowledge helps us make more informed decisions about our environment."
        ],
        'long': [
            "Cryptography has been an essential tool for secure communication throughout human history. "
            "Ancient civilizations used simple substitution ciphers to protect sensitive information from adversaries. "
            "The Caesar cipher, developed by Julius Caesar himself, shifted letters by a fixed number of positions. "
            "During World War II, the Enigma machine represented a major advancement in encryption technology. "
            "Alan Turing's work in breaking the Enigma code significantly contributed to the Allied victory. "
            "Modern cryptography employs sophisticated mathematical algorithms to ensure data security. "
            "Public key cryptography revolutionized secure communication in the digital age. "
            "Today, encryption protects everything from online banking to private messages.",
            
            "The evolution of computer science has transformed nearly every aspect of modern society. "
            "Early computers were massive machines that filled entire rooms and had limited capabilities. "
            "The invention of the transistor marked a turning point in computing technology. "
            "As processors became more powerful and compact, personal computers emerged in the 1970s. "
            "The internet revolutionized how people access information and communicate globally. "
            "Mobile computing brought unprecedented connectivity and convenience to billions of users. "
            "Artificial intelligence and machine learning are now reshaping industries worldwide. "
            "The future promises even more remarkable innovations and technological breakthroughs.",
            
            "Education plays a fundamental role in personal development and societal progress. "
            "Traditional classroom settings have served as the primary method of instruction for centuries. "
            "The printing press made books and educational materials more widely accessible. "
            "In recent decades, technology has dramatically changed how students learn and teachers instruct. "
            "Online learning platforms provide flexibility and access to educational resources globally. "
            "Interactive multimedia content enhances engagement and understanding of complex subjects. "
            "However, the human element remains crucial for effective education and mentorship. "
            "Balancing technology with traditional methods creates the most effective learning environments."
        ]
    }
    
    @staticmethod
    def text_to_binary(text: str) -> str:
        """Convert text to binary string"""
        return ''.join(format(ord(char), '08b') for char in text)
    
    @staticmethod
    def binary_to_text(binary: str) -> str:
        """Convert binary string to text"""
        try:
            chars = []
            for i in range(0, len(binary), 8):
                byte = binary[i:i+8]
                if len(byte) == 8:
                    chars.append(chr(int(byte, 2)))
            return ''.join(chars)
        except:
            return ""
    
    @staticmethod
    def select_cover_text(message_length: int) -> str:
        """Select appropriate cover text based on message length"""
        if message_length < 50:
            category = 'short'
        elif message_length < 200:
            category = 'medium'
        else:
            category = 'long'
        
        return random.choice(TextSteganographyService.COVER_TEMPLATES[category])
    
    @staticmethod
    def embed_in_whitespace(cover_text: str, secret_message: str) -> str:
        """
        Embed binary message using whitespace steganography
        Uses single space (0) and double space (1) between words
        """
        # Convert message to binary
        binary_message = TextSteganographyService.text_to_binary(secret_message)
        
        # Add delimiter and length prefix
        message_length = len(secret_message)
        header = format(message_length, '016b')  # 16-bit length
        full_binary = header + binary_message
        
        # Split cover text into words
        words = cover_text.split()
        
        # Check if we have enough words
        if len(words) - 1 < len(full_binary):
            # Need more cover text, duplicate or extend
            multiplier = (len(full_binary) // (len(words) - 1)) + 1
            cover_text = ' '.join(words * multiplier)
            words = cover_text.split()
        
        # Embed binary in spaces between words
        stego_text_parts = []
        bit_index = 0
        
        for i, word in enumerate(words):
            stego_text_parts.append(word)
            
            if i < len(words) - 1 and bit_index < len(full_binary):
                # Add space based on bit value
                if full_binary[bit_index] == '0':
                    stego_text_parts.append(' ')  # Single space
                else:
                    stego_text_parts.append('  ')  # Double space
                bit_index += 1
            elif i < len(words) - 1:
                stego_text_parts.append(' ')  # Normal space
        
        return ''.join(stego_text_parts)
    
    @staticmethod
    def encode_to_lsb_text(secret_message: str, cover_text: str = None) -> str:
        """
        Encode message using LSB text steganography
        Hides data in the least significant bits of Unicode character codes
        Creates normal-looking text with hidden data
        """
        import base64
        
        # Base64 encode the secret message first
        message_bytes = secret_message.encode('utf-8')
        b64_encoded = base64.b64encode(message_bytes).decode('ascii')
        
        # Add length header
        message_length = len(b64_encoded)
        header = format(message_length, '016b')  # 16-bit length
        
        # Convert message to binary
        binary_message = header + ''.join(format(ord(c), '08b') for c in b64_encoded)
        
        # Select or use provided cover text
        if not cover_text:
            cover_text = TextSteganographyService.select_cover_text(len(secret_message))
        
        # Extend cover text if needed by repeating
        chars_needed = len(binary_message)
        while len(cover_text) < chars_needed:
            cover_text += " " + cover_text
        
        # Embed binary data in LSB of character codes
        stego_chars = []
        for i, bit in enumerate(binary_message):
            if i < len(cover_text):
                char_code = ord(cover_text[i])
                # Modify LSB
                if bit == '1':
                    new_code = char_code | 1  # Set LSB to 1
                else:
                    new_code = char_code & ~1  # Set LSB to 0
                
                # Make sure it's a valid printable character
                if 32 <= new_code <= 126:
                    stego_chars.append(chr(new_code))
                else:
                    # If modification makes it non-printable, use original + zero-width char
                    stego_chars.append(cover_text[i])
                    if bit == '1':
                        stego_chars.append('\u200B')  # Zero-width space for 1
            else:
                break
        
        # Add remaining cover text
        if len(binary_message) < len(cover_text):
            stego_chars.append(cover_text[len(binary_message):])
        
        return ''.join(stego_chars)
    
    @staticmethod
    def decode_from_lsb_text(stego_text: str) -> str:
        """Decode message from LSB text steganography"""
        import base64
        
        try:
            print(f"[DEBUG] Decoding LSB text, input length: {len(stego_text)}")
            
            # Extract LSB from each character to rebuild binary message
            binary_bits = []
            zero_width_count = 0
            
            for char in stego_text:
                if char == '\u200B':  # Zero-width space means 1
                    zero_width_count += 1
                    if binary_bits:  # Skip if at start
                        binary_bits.append('1')
                    continue
                
                char_code = ord(char)
                # Extract LSB
                lsb = char_code & 1
                binary_bits.append(str(lsb))
            
            print(f"[DEBUG] Extracted {len(binary_bits)} bits, {zero_width_count} zero-width chars")
            
            if len(binary_bits) < 16:
                print(f"[DEBUG] Not enough bits for header (need 16, got {len(binary_bits)})")
                return ""
            
            # Extract length from first 16 bits
            length_binary = ''.join(binary_bits[:16])
            message_length = int(length_binary, 2)
            
            print(f"[DEBUG] Decoded message length: {message_length}")
            
            if message_length <= 0 or message_length > 10000:
                print(f"[DEBUG] Invalid message length: {message_length}")
                return ""
            
            # Extract message bits (need 8 bits per character)
            total_bits_needed = 16 + (message_length * 8)
            if len(binary_bits) < total_bits_needed:
                print(f"[DEBUG] Not enough bits: have {len(binary_bits)}, need {total_bits_needed}")
                return ""
            
            # Extract message bits
            message_bits = binary_bits[16:16 + message_length * 8]
            
            # Convert bits to characters
            b64_chars = []
            for i in range(0, len(message_bits), 8):
                byte = ''.join(message_bits[i:i+8])
                if len(byte) == 8:
                    b64_chars.append(chr(int(byte, 2)))
            
            b64_string = ''.join(b64_chars)
            print(f"[DEBUG] Base64 string length: {len(b64_string)}")
            
            # Decode from base64
            decoded_bytes = base64.b64decode(b64_string)
            secret_message = decoded_bytes.decode('utf-8')
            
            print(f"[DEBUG] Successfully decoded message length: {len(secret_message)}")
            return secret_message
        except Exception as e:
            print(f"[DEBUG] LSB decode error: {str(e)}")
            import traceback
            traceback.print_exc()
            return ""
    
    @staticmethod
    def hide_message(secret_message: str, cover_text: str = None) -> Tuple[Dict[str, Any], int]:
        """
        Hide secret message using LSB text steganography
        
        Args:
            secret_message: Secret message to hide
            cover_text: Optional cover text (will be auto-generated if not provided)
            
        Returns:
            Tuple of (result_dict, status_code)
        """
        try:
            if not secret_message:
                return {"success": False, "error": "Secret message is required"}, 400
            
            # Use LSB text steganography
            stego_text = TextSteganographyService.encode_to_lsb_text(secret_message, cover_text)
            
            return {
                "success": True,
                "stego_text": stego_text,
                "cover_text_length": len(cover_text) if cover_text else 0,
                "stego_text_length": len(stego_text),
                "hidden_message_length": len(secret_message),
                "method": "lsb-text-steganography",
                "capacity_used": f"{len(secret_message)} characters hidden",
                "info": "Message hidden using LSB modification of character codes"
            }, 200
            
        except Exception as e:
            return {"success": False, "error": f"Message hiding failed: {str(e)}"}, 500
    
    @staticmethod
    def extract_from_whitespace(stego_text: str) -> str:
        """Extract hidden message from whitespace patterns"""
        try:
            # Extract spacing patterns between words
            binary_bits = []
            i = 0
            while i < len(stego_text):
                if stego_text[i] == ' ':
                    # Count consecutive spaces
                    space_count = 0
                    while i < len(stego_text) and stego_text[i] == ' ':
                        space_count += 1
                        i += 1
                    
                    # Single space = 0, double space = 1
                    if space_count == 1:
                        binary_bits.append('0')
                    elif space_count >= 2:
                        binary_bits.append('1')
                else:
                    i += 1
            
            if len(binary_bits) < 16:
                return ""
            
            # Extract length from first 16 bits
            length_binary = ''.join(binary_bits[:16])
            message_length = int(length_binary, 2)
            
            # Extract message bits
            message_binary = ''.join(binary_bits[16:16 + message_length * 8])
            
            # Convert to text
            secret_message = TextSteganographyService.binary_to_text(message_binary)
            
            return secret_message
            
        except Exception as e:
            print(f"Extraction error: {str(e)}")
            return ""
    
    @staticmethod
    def extract_message(stego_text: str) -> Tuple[Dict[str, Any], int]:
        """
        Extract hidden message from stego text
        
        Args:
            stego_text: Text containing hidden message
            
        Returns:
            Tuple of (result_dict, status_code)
        """
        try:
            if not stego_text:
                return {"success": False, "error": "Stego text is required"}, 400
            
            # Try LSB text decoding
            secret_message = TextSteganographyService.decode_from_lsb_text(stego_text)
            
            # If that fails, try old whitespace method for backwards compatibility
            if not secret_message:
                secret_message = TextSteganographyService.extract_from_whitespace(stego_text)
            
            if not secret_message:
                return {
                    "success": False,
                    "error": "No hidden message found or message corrupted",
                    "extracted_message": None
                }, 404
            
            return {
                "success": True,
                "extracted_message": secret_message,
                "message_length": len(secret_message),
                "method": "lsb-text-steganography",
                "info": "Message extracted successfully"
            }, 200
            
        except Exception as e:
            return {"success": False, "error": f"Message extraction failed: {str(e)}"}, 500
    
    @staticmethod
    def get_capacity(cover_text: str) -> Tuple[Dict[str, Any], int]:
        """
        Calculate capacity of cover text for hiding messages
        
        Args:
            cover_text: Cover text to analyze
            
        Returns:
            Tuple of (result_dict, status_code)
        """
        try:
            if not cover_text:
                return {"success": False, "error": "Cover text is required"}, 400
            
            # Count spaces (each space can encode 1 bit)
            words = cover_text.split()
            num_spaces = len(words) - 1
            
            # Subtract 16 bits for length header
            available_bits = max(0, num_spaces - 16)
            max_chars = available_bits // 8
            
            return {
                "success": True,
                "max_message_length": max_chars,
                "cover_text_length": len(cover_text),
                "word_count": len(words),
                "available_spaces": num_spaces,
                "capacity_bits": available_bits,
                "method": "whitespace-steganography",
                "info": f"Can hide up to {max_chars} characters"
            }, 200
            
        except Exception as e:
            return {"success": False, "error": f"Capacity calculation failed: {str(e)}"}, 500
