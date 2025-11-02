"""
Linguistic Steganography Service
Uses synonym substitution in cover text to hide messages efficiently
"""

import base64
import random
import re
from typing import Dict, Tuple, List


class LinguisticSteganographyService:
    """Service for hiding messages using linguistic steganography with cover text"""
    
    # Synonym groups for 2-bit encoding (4 synonyms per group)
    # Each group encodes 2 bits: 00, 01, 10, 11
    SYNONYM_GROUPS = {
        'good': ['good', 'great', 'excellent', 'fine'],
        'bad': ['bad', 'poor', 'terrible', 'awful'],
        'big': ['big', 'large', 'huge', 'giant'],
        'small': ['small', 'tiny', 'little', 'mini'],
        'fast': ['fast', 'quick', 'rapid', 'swift'],
        'easy': ['easy', 'simple', 'basic', 'plain'],
        'hard': ['hard', 'difficult', 'tough', 'complex'],
        'new': ['new', 'recent', 'fresh', 'modern'],
        'old': ['old', 'ancient', 'aged', 'dated'],
        'start': ['start', 'begin', 'launch', 'initiate'],
        'end': ['end', 'finish', 'complete', 'conclude'],
        'make': ['make', 'create', 'build', 'produce'],
        'find': ['find', 'discover', 'locate', 'detect'],
        'think': ['think', 'ponder', 'consider', 'reflect'],
        'know': ['know', 'understand', 'grasp', 'comprehend'],
        'want': ['want', 'desire', 'wish', 'need'],
        'help': ['help', 'assist', 'aid', 'support'],
        'work': ['work', 'function', 'operate', 'perform'],
        'use': ['use', 'employ', 'utilize', 'apply'],
        'give': ['give', 'provide', 'offer', 'supply'],
    }
    
    # Default cover text - optimized for 2-bit encoding
    # Uses words from SYNONYM_GROUPS for maximum efficiency
    DEFAULT_COVER_TEXT = """
    Good new methods make work easy and fast for all people to use every day.
    Big ideas help us find better ways to think about hard problems we face.
    Small teams can start to build great tools that give users what they want.
    It is important to know the old rules before you begin any difficult task.
    We should help each other and make things simple when work becomes complex.
    Modern systems need to function well and operate without any major issues.
    When you discover new concepts you must understand them before moving ahead.
    Smart developers create software to provide solutions and offer real value.
    The end goal is to produce results that users desire and truly appreciate.
    """
    
    @staticmethod
    def _message_to_binary(message: str) -> str:
        """Convert message to binary string with compression"""
        # Encode as base64 for ASCII-safe encoding
        b64_message = base64.b64encode(message.encode('utf-8')).decode('ascii')
        
        # Convert to binary
        binary = ''.join(format(ord(char), '08b') for char in b64_message)
        return binary
    
    @staticmethod
    def _binary_to_message(binary: str) -> str:
        """Convert binary string back to message"""
        # Split binary into 8-bit chunks
        chars = []
        for i in range(0, len(binary), 8):
            byte = binary[i:i+8]
            if len(byte) == 8:
                chars.append(chr(int(byte, 2)))
        
        b64_message = ''.join(chars)
        
        # Decode from base64
        try:
            message = base64.b64decode(b64_message).decode('utf-8')
            return message
        except Exception as e:
            raise ValueError(f"Failed to decode message: {str(e)}")
    
    @staticmethod
    def _find_substitutable_words(text: str) -> List[Tuple[int, str, str]]:
        """
        Find all words in text that can be substituted with synonyms
        Returns list of (position, word, base_word) tuples
        """
        words = text.split()
        substitutable = []
        
        for i, word in enumerate(words):
            # Clean word (remove punctuation)
            clean_word = re.sub(r'[^\w]', '', word).lower()
            
            # Check if word matches any synonym group
            for base_word, synonyms in LinguisticSteganographyService.SYNONYM_GROUPS.items():
                if clean_word in [s.lower() for s in synonyms]:
                    substitutable.append((i, word, base_word))
                    break
        
        return substitutable
    
    @staticmethod
    def _prepare_cover_text(text: str, required_capacity: int) -> str:
        """
        Prepare cover text with enough substitutable words
        Repeats text if necessary, falls back to default if insufficient
        """
        # Find base capacity
        substitutable = LinguisticSteganographyService._find_substitutable_words(text)
        base_capacity = len(substitutable)
        
        if base_capacity == 0:
            # Fallback to default cover text if provided text has no substitutable words
            print(f"⚠ Warning: Provided cover text has no substitutable words, using default")
            text = LinguisticSteganographyService.DEFAULT_COVER_TEXT
            substitutable = LinguisticSteganographyService._find_substitutable_words(text)
            base_capacity = len(substitutable)
            
            if base_capacity == 0:
                raise ValueError("Even default cover text has no substitutable words - check SYNONYM_GROUPS configuration")
        
        # Calculate how many repetitions we need
        repetitions = max(1, (required_capacity + base_capacity - 1) // base_capacity)
        
        # Create repeated text
        if repetitions > 1:
            final_text = (text + " ") * repetitions
        else:
            final_text = text
        
        return final_text.strip()
    
    @staticmethod
    def hide_message(secret_message: str, cover_text: str = None) -> Tuple[Dict, int]:
        """
        Hide a secret message in cover text using synonym substitution
        Each word encodes 2 bits using 4-synonym groups
        
        Args:
            secret_message: The message to hide
            cover_text: Optional cover text (uses default if not provided or insufficient)
            
        Returns:
            Tuple of (result dict, status code)
        """
        try:
            print(f"\n[LINGUISTIC STEGO] Hiding message...")
            print(f"Secret message length: {len(secret_message)} chars")
            
            # Use default cover text if none provided
            if not cover_text or not cover_text.strip():
                print(f"Using default cover text")
                cover_text = LinguisticSteganographyService.DEFAULT_COVER_TEXT
            else:
                print(f"Using custom cover text (length: {len(cover_text)} chars)")
            
            # Convert message to binary
            binary_message = LinguisticSteganographyService._message_to_binary(secret_message)
            print(f"Binary message length: {len(binary_message)} bits")
            
            # Add length header (32 bits)
            message_length = len(binary_message)
            length_binary = format(message_length, '032b')
            full_binary = length_binary + binary_message
            
            # Pad to multiple of 2 bits (for 2-bit encoding)
            if len(full_binary) % 2 != 0:
                full_binary += '0'
            
            print(f"Total bits to embed (with header): {len(full_binary)}")
            
            # Calculate required words (2 bits per word)
            required_words = (len(full_binary) + 1) // 2
            
            # Prepare cover text with enough capacity
            prepared_cover = LinguisticSteganographyService._prepare_cover_text(
                cover_text, required_words
            )
            
            # Find all substitutable words
            substitutable_words = LinguisticSteganographyService._find_substitutable_words(prepared_cover)
            
            if len(substitutable_words) < required_words:
                return {
                    'success': False,
                    'error': f'Cover text has insufficient capacity: need {required_words} words, found {len(substitutable_words)}'
                }, 400
            
            print(f"Found {len(substitutable_words)} substitutable words in cover text")
            print(f"Encoding 2 bits per word - need {required_words} words")
            
            # Create stego text by substituting synonyms
            words = prepared_cover.split()
            bit_index = 0
            words_used = 0
            
            for position, original_word, base_word in substitutable_words:
                if bit_index >= len(full_binary):
                    break
                
                # Get 2 bits to encode
                two_bits = full_binary[bit_index:bit_index+2]
                if len(two_bits) < 2:
                    two_bits += '0'  # Pad if needed
                
                # Convert 2 bits to index (00=0, 01=1, 10=2, 11=3)
                synonym_index = int(two_bits, 2)
                
                # Get synonym group
                synonym_group = LinguisticSteganographyService.SYNONYM_GROUPS[base_word]
                selected_synonym = synonym_group[synonym_index]
                
                # Preserve original capitalization and punctuation
                original_clean = re.sub(r'[^\w]', '', original_word)
                punctuation = original_word[len(original_clean):] if len(original_word) > len(original_clean) else ''
                
                # Apply capitalization
                if original_clean and original_clean[0].isupper():
                    selected_synonym = selected_synonym.capitalize()
                
                # Replace word
                words[position] = selected_synonym + punctuation
                
                bit_index += 2
                words_used += 1
            
            # Join words back
            stego_text = ' '.join(words)
            
            print(f"[LINGUISTIC STEGO] Generated stego text")
            print(f"Stego text length: {len(stego_text)} chars")
            print(f"Embedded {bit_index} bits in {words_used} words")
            print(f"Compression ratio: {len(stego_text) / len(secret_message):.2f}x")
            
            return {
                'success': True,
                'stego_text': stego_text,
                'message_length': len(secret_message),
                'binary_length': len(binary_message),
                'total_bits_embedded': bit_index,
                'cover_text_length': len(prepared_cover),
                'stego_text_length': len(stego_text),
                'words_used': words_used,
                'method': 'linguistic-2bit-encoding',
                'compression_ratio': round(len(stego_text) / len(secret_message), 2) if len(secret_message) > 0 else 0
            }, 200
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return {
                'success': False,
                'error': f'Linguistic steganography encoding failed: {str(e)}'
            }, 500
    
    @staticmethod
    def extract_message(stego_text: str) -> Tuple[Dict, int]:
        """
        Extract hidden message from linguistically steganographic text
        Each word decodes 2 bits using 4-synonym groups
        
        Args:
            stego_text: The text containing hidden message
            
        Returns:
            Tuple of (result dict, status code)
        """
        try:
            print(f"\n[LINGUISTIC STEGO] Extracting message...")
            print(f"Stego text length: {len(stego_text)} chars")
            
            # Find all words that match our synonym groups
            words = stego_text.split()
            binary_bits = []
            
            for word in words:
                # Clean word (remove punctuation)
                clean_word = re.sub(r'[^\w]', '', word).lower()
                
                # Check if word is in any synonym group
                for base_word, synonym_group in LinguisticSteganographyService.SYNONYM_GROUPS.items():
                    if clean_word in [s.lower() for s in synonym_group]:
                        # Find index of synonym (0-3)
                        synonym_index = next((i for i, s in enumerate(synonym_group) if s.lower() == clean_word), 0)
                        
                        # Convert index to 2 bits (0=00, 1=01, 2=10, 3=11)
                        two_bits = format(synonym_index, '02b')
                        binary_bits.append(two_bits)
                        break
            
            binary_string = ''.join(binary_bits)
            print(f"Extracted {len(binary_string)} bits from {len(binary_bits)} words")
            
            if len(binary_string) < 32:
                return {
                    'success': False,
                    'error': f'Insufficient data extracted: only {len(binary_string)} bits (need at least 32 for header)'
                }, 400
            
            # Extract length header (first 32 bits)
            length_binary = binary_string[:32]
            message_length = int(length_binary, 2)
            
            print(f"Message length from header: {message_length} bits")
            
            # Validate message length
            if message_length <= 0 or message_length > len(binary_string) - 32:
                return {
                    'success': False,
                    'error': f'Invalid message length in header: {message_length} bits (have {len(binary_string) - 32} bits available)'
                }, 400
            
            # Extract actual message bits
            message_binary = binary_string[32:32 + message_length]
            
            print(f"Extracting {message_length} bits for message")
            
            # Decode binary to message
            try:
                extracted_message = LinguisticSteganographyService._binary_to_message(message_binary)
                print(f"[LINGUISTIC STEGO] Successfully extracted message: {len(extracted_message)} chars")
                
                return {
                    'success': True,
                    'extracted_message': extracted_message,
                    'message_length': len(extracted_message),
                    'bits_extracted': len(message_binary),
                    'total_bits_found': len(binary_string),
                    'words_decoded': len(binary_bits),
                    'method': 'linguistic-2bit-encoding'
                }, 200
                
            except Exception as decode_error:
                return {
                    'success': False,
                    'error': f'Failed to decode extracted bits: {str(decode_error)}'
                }, 400
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return {
                'success': False,
                'error': f'Linguistic steganography extraction failed: {str(e)}'
            }, 500
