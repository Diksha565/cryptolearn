"""
Text Watermarking Service
Embeds hidden identifiers into text using linguistic steganography
Methods: Zero-width characters, whitespace manipulation, punctuation patterns
"""

import re
from typing import Dict, Any, Tuple


class TextWatermarkingService:
    """Service for embedding and extracting watermarks from text"""
    
    # Zero-width characters for embedding watermark
    ZERO_WIDTH_CHARS = {
        '0': '\u200B',  # Zero-width space
        '1': '\u200C',  # Zero-width non-joiner
    }
    
    REVERSE_ZERO_WIDTH = {v: k for k, v in ZERO_WIDTH_CHARS.items()}
    
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
    def embed_watermark(text: str, watermark: str) -> Tuple[Dict[str, Any], int]:
        """
        Embed watermark into text using zero-width characters
        
        Args:
            text: Cover text to embed watermark into
            watermark: Watermark text to embed (e.g., sender name)
            
        Returns:
            Tuple of (result_dict, status_code)
        """
        try:
            if not text or not watermark:
                return {"success": False, "error": "Text and watermark are required"}, 400
            
            # Add delimiter to mark watermark boundaries
            watermark_with_delimiter = f"WM:{watermark}:WM"
            
            # Convert watermark to binary
            binary_watermark = TextWatermarkingService.text_to_binary(watermark_with_delimiter)
            
            # Convert binary to zero-width characters
            zero_width_watermark = ''.join(
                TextWatermarkingService.ZERO_WIDTH_CHARS[bit] 
                for bit in binary_watermark
            )
            
            # Split text into sentences
            sentences = re.split(r'([.!?]\s+)', text)
            
            if len(sentences) == 0:
                # If no sentences, embed at the beginning
                watermarked_text = zero_width_watermark + text
            else:
                # Embed watermark after first sentence
                if len(sentences) >= 2:
                    watermarked_text = sentences[0] + sentences[1] + zero_width_watermark + ''.join(sentences[2:])
                else:
                    watermarked_text = sentences[0] + zero_width_watermark
            
            return {
                "success": True,
                "watermarked_text": watermarked_text,
                "watermark": watermark,
                "method": "zero-width-characters",
                "original_length": len(text),
                "watermarked_length": len(watermarked_text),
                "watermark_size": len(zero_width_watermark),
                "info": "Watermark embedded using zero-width Unicode characters"
            }, 200
            
        except Exception as e:
            return {"success": False, "error": f"Watermark embedding failed: {str(e)}"}, 500
    
    @staticmethod
    def extract_watermark(watermarked_text: str) -> Tuple[Dict[str, Any], int]:
        """
        Extract watermark from watermarked text
        
        Args:
            watermarked_text: Text containing embedded watermark
            
        Returns:
            Tuple of (result_dict, status_code)
        """
        try:
            if not watermarked_text:
                return {"success": False, "error": "Watermarked text is required"}, 400
            
            # Extract zero-width characters
            zero_width_chars = [
                char for char in watermarked_text 
                if char in TextWatermarkingService.REVERSE_ZERO_WIDTH
            ]
            
            if not zero_width_chars:
                return {
                    "success": False,
                    "error": "No watermark found in text",
                    "watermark": None
                }, 404
            
            # Convert zero-width characters to binary
            binary_watermark = ''.join(
                TextWatermarkingService.REVERSE_ZERO_WIDTH[char] 
                for char in zero_width_chars
            )
            
            # Convert binary to text
            watermark_with_delimiter = TextWatermarkingService.binary_to_text(binary_watermark)
            
            # Extract watermark between delimiters
            match = re.search(r'WM:(.*?):WM', watermark_with_delimiter)
            
            if match:
                watermark = match.group(1)
                return {
                    "success": True,
                    "watermark": watermark,
                    "method": "zero-width-characters",
                    "watermark_length": len(watermark),
                    "info": "Watermark extracted successfully"
                }, 200
            else:
                return {
                    "success": False,
                    "error": "Watermark format invalid or corrupted",
                    "watermark": None,
                    "raw_extracted": watermark_with_delimiter
                }, 400
                
        except Exception as e:
            return {"success": False, "error": f"Watermark extraction failed: {str(e)}"}, 500
    
    @staticmethod
    def remove_watermark(watermarked_text: str) -> Tuple[Dict[str, Any], int]:
        """
        Remove watermark from text
        
        Args:
            watermarked_text: Text containing embedded watermark
            
        Returns:
            Tuple of (result_dict, status_code)
        """
        try:
            if not watermarked_text:
                return {"success": False, "error": "Text is required"}, 400
            
            # Remove all zero-width characters
            clean_text = ''.join(
                char for char in watermarked_text 
                if char not in TextWatermarkingService.REVERSE_ZERO_WIDTH
            )
            
            return {
                "success": True,
                "clean_text": clean_text,
                "original_length": len(watermarked_text),
                "clean_length": len(clean_text),
                "removed_chars": len(watermarked_text) - len(clean_text),
                "info": "Watermark removed successfully"
            }, 200
            
        except Exception as e:
            return {"success": False, "error": f"Watermark removal failed: {str(e)}"}, 500
    
    @staticmethod
    def verify_watermark(watermarked_text: str, expected_watermark: str) -> Tuple[Dict[str, Any], int]:
        """
        Verify if text contains expected watermark
        
        Args:
            watermarked_text: Text to verify
            expected_watermark: Expected watermark value
            
        Returns:
            Tuple of (result_dict, status_code)
        """
        try:
            result, status = TextWatermarkingService.extract_watermark(watermarked_text)
            
            if result.get("success") and result.get("watermark"):
                extracted = result["watermark"]
                is_valid = extracted == expected_watermark
                
                return {
                    "success": True,
                    "valid": is_valid,
                    "extracted_watermark": extracted,
                    "expected_watermark": expected_watermark,
                    "match": is_valid,
                    "info": "Watermark matches" if is_valid else "Watermark does not match"
                }, 200
            else:
                return {
                    "success": False,
                    "valid": False,
                    "error": result.get("error", "Watermark extraction failed")
                }, status
                
        except Exception as e:
            return {"success": False, "error": f"Watermark verification failed: {str(e)}"}, 500
