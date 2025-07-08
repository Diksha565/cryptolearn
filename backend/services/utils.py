import base64
import io
import os
from PIL import Image
import numpy as np
from typing import Union, Tuple
from werkzeug.datastructures import FileStorage

def encode_base64(data: bytes) -> str:
    """Encode bytes to base64 string"""
    try:
        return base64.b64encode(data).decode('utf-8')
    except Exception as e:
        raise ValueError(f"Failed to encode data to base64: {str(e)}")

def decode_base64(data: str) -> bytes:
    """Decode base64 string to bytes"""
    try:
        return base64.b64decode(data)
    except Exception as e:
        raise ValueError(f"Failed to decode base64 data: {str(e)}")

def image_to_bytes(image: Image.Image, format: str = 'PNG') -> bytes:
    """Convert PIL Image to bytes"""
    try:
        img_buffer = io.BytesIO()
        image.save(img_buffer, format=format)
        return img_buffer.getvalue()
    except Exception as e:
        raise ValueError(f"Failed to convert image to bytes: {str(e)}")

def bytes_to_image(data: bytes) -> Image.Image:
    """Convert bytes to PIL Image"""
    try:
        return Image.open(io.BytesIO(data))
    except Exception as e:
        raise ValueError(f"Failed to convert bytes to image: {str(e)}")

def file_to_image(file: FileStorage) -> Image.Image:
    """Convert FileStorage to PIL Image"""
    try:
        return Image.open(file.stream)
    except Exception as e:
        raise ValueError(f"Failed to load image from file: {str(e)}")

def validate_key_length(key: str, expected_lengths: list) -> bool:
    """Validate if key length is in expected lengths (in bits)"""
    key_bits = len(key) * 8
    return key_bits in expected_lengths

def validate_hex_key(key: str) -> bool:
    """Validate if key is a valid hexadecimal string"""
    try:
        int(key, 16)
        return True
    except ValueError:
        return False

def pad_key(key: str, target_length: int) -> str:
    """Pad or truncate key to target length"""
    if len(key) > target_length:
        return key[:target_length]
    return key.ljust(target_length, '0')

def save_temp_image(image: Image.Image, filename: str, upload_folder: str = 'static') -> str:
    """Save image to temporary location and return path"""
    try:
        filepath = os.path.join(upload_folder, filename)
        image.save(filepath)
        return filepath
    except Exception as e:
        raise ValueError(f"Failed to save temporary image: {str(e)}")

def validate_required_fields(data: dict, required_fields: list) -> Tuple[bool, str]:
    """Validate that all required fields are present in data"""
    missing_fields = [field for field in required_fields if field not in data or not data[field]]
    if missing_fields:
        return False, f"Missing required fields: {', '.join(missing_fields)}"
    return True, ""

def create_error_response(message: str, status_code: int = 400) -> Tuple[dict, int]:
    """Create standardized error response"""
    return {"error": message, "success": False}, status_code

def create_success_response(data: dict) -> Tuple[dict, int]:
    """Create standardized success response"""
    response = {"success": True}
    response.update(data)
    return response, 200

def text_to_binary(text: str) -> str:
    """Convert text to binary representation"""
    return ''.join(format(ord(char), '08b') for char in text)

def binary_to_text(binary: str) -> str:
    """Convert binary representation to text"""
    text = ''
    for i in range(0, len(binary), 8):
        byte = binary[i:i+8]
        if len(byte) == 8:
            text += chr(int(byte, 2))
    return text

class CryptoException(Exception):
    """Custom exception for cryptography operations"""
    pass
