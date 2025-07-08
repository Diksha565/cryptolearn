from PIL import Image
import numpy as np
import io
from .utils import (
    create_error_response, create_success_response, 
    text_to_binary, binary_to_text, 
    image_to_bytes, file_to_image, save_temp_image
)

class SteganographyService:
    """Service for LSB steganography operations"""
    
    @staticmethod
    def _modify_lsb(pixel_value: int, bit: str) -> int:
        """Modify the least significant bit of a pixel value"""
        return (pixel_value & 0xFE) | int(bit)
    
    @staticmethod
    def _extract_lsb(pixel_value: int) -> str:
        """Extract the least significant bit of a pixel value"""
        return str(pixel_value & 1)
    
    @staticmethod
    def embed_message(image_file, message: str):
        """
        Embed a secret message in an image using LSB steganography
        
        Args:
            image_file: Image file (FileStorage or PIL Image)
            message: Secret message to embed
        
        Returns:
            Tuple of (result_dict, status_code)
        """
        try:
            if not message:
                return create_error_response("Message is required")
            
            # Load image
            if hasattr(image_file, 'stream'):
                image = file_to_image(image_file)
            else:
                image = image_file
            
            # Convert to RGB if not already
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Convert message to binary with delimiter
            message_binary = text_to_binary(message)
            delimiter = text_to_binary("###END###")  # Delimiter to mark end of message
            data_to_embed = message_binary + delimiter
            
            # Check if image can hold the message
            pixels = np.array(image)
            total_pixels = pixels.size
            
            if len(data_to_embed) > total_pixels:
                return create_error_response(
                    f"Message too long. Image can hold max {total_pixels} bits, "
                    f"but message requires {len(data_to_embed)} bits"
                )
            
            # Flatten the image array for easier processing
            flat_pixels = pixels.flatten()
            
            # Embed data
            for i, bit in enumerate(data_to_embed):
                flat_pixels[i] = SteganographyService._modify_lsb(flat_pixels[i], bit)
            
            # Reshape back to original image dimensions
            encoded_pixels = flat_pixels.reshape(pixels.shape)
            encoded_image = Image.fromarray(encoded_pixels.astype('uint8'), 'RGB')
            
            # Convert to bytes
            encoded_bytes = image_to_bytes(encoded_image, 'PNG')
            
            return create_success_response({
                "encoded_image": encoded_bytes,
                "message_length": len(message),
                "bits_used": len(data_to_embed),
                "image_capacity": total_pixels,
                "format": "PNG"
            })
        
        except Exception as e:
            return create_error_response(f"Message embedding failed: {str(e)}")
    
    @staticmethod
    def extract_message(image_file):
        """
        Extract a secret message from an image using LSB steganography
        
        Args:
            image_file: Image file containing hidden message (FileStorage or PIL Image)
        
        Returns:
            Tuple of (result_dict, status_code)
        """
        try:
            # Load image
            if hasattr(image_file, 'stream'):
                image = file_to_image(image_file)
            else:
                image = image_file
            
            # Convert to RGB if not already
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Get pixel data
            pixels = np.array(image)
            flat_pixels = pixels.flatten()
            
            # Extract LSBs
            binary_data = ''
            delimiter_binary = text_to_binary("###END###")
            
            for pixel_value in flat_pixels:
                binary_data += SteganographyService._extract_lsb(pixel_value)
                
                # Check if we've found the delimiter
                if binary_data.endswith(delimiter_binary):
                    # Remove delimiter from the extracted data
                    message_binary = binary_data[:-len(delimiter_binary)]
                    break
            else:
                return create_error_response("No hidden message found or message incomplete")
            
            # Convert binary to text
            try:
                message = binary_to_text(message_binary)
                
                return create_success_response({
                    "message": message,
                    "message_length": len(message),
                    "bits_extracted": len(message_binary)
                })
            
            except Exception:
                return create_error_response("Failed to decode message. Image may not contain valid hidden text")
        
        except Exception as e:
            return create_error_response(f"Message extraction failed: {str(e)}")
    
    @staticmethod
    def get_image_capacity(image_file):
        """
        Get the maximum message capacity of an image
        
        Args:
            image_file: Image file (FileStorage or PIL Image)
        
        Returns:
            Tuple of (result_dict, status_code)
        """
        try:
            # Load image
            if hasattr(image_file, 'stream'):
                image = file_to_image(image_file)
            else:
                image = image_file
            
            # Convert to RGB if not already
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Calculate capacity
            pixels = np.array(image)
            total_pixels = pixels.size
            delimiter_bits = len(text_to_binary("###END###"))
            max_message_bits = total_pixels - delimiter_bits
            max_message_chars = max_message_bits // 8  # 8 bits per character
            
            return create_success_response({
                "image_dimensions": f"{image.width}x{image.height}",
                "total_pixels": total_pixels,
                "max_message_bits": max_message_bits,
                "max_message_characters": max_message_chars,
                "delimiter_overhead": delimiter_bits
            })
        
        except Exception as e:
            return create_error_response(f"Capacity calculation failed: {str(e)}")
    
    @staticmethod
    def compare_images(original_file, encoded_file):
        """
        Compare original and encoded images to show steganography effect
        
        Args:
            original_file: Original image file
            encoded_file: Encoded image file
        
        Returns:
            Tuple of (result_dict, status_code)
        """
        try:
            # Load images
            if hasattr(original_file, 'stream'):
                original = file_to_image(original_file)
            else:
                original = original_file
            
            if hasattr(encoded_file, 'stream'):
                encoded = file_to_image(encoded_file)
            else:
                encoded = encoded_file
            
            # Convert to RGB if not already
            if original.mode != 'RGB':
                original = original.convert('RGB')
            if encoded.mode != 'RGB':
                encoded = encoded.convert('RGB')
            
            # Convert to numpy arrays
            orig_pixels = np.array(original)
            enc_pixels = np.array(encoded)
            
            # Calculate differences
            if orig_pixels.shape != enc_pixels.shape:
                return create_error_response("Images must have the same dimensions")
            
            # Calculate pixel differences
            diff_pixels = np.abs(orig_pixels.astype(int) - enc_pixels.astype(int))
            
            # Statistics
            total_pixels = orig_pixels.size
            changed_pixels = np.count_nonzero(diff_pixels)
            max_difference = np.max(diff_pixels)
            avg_difference = np.mean(diff_pixels)
            
            return create_success_response({
                "total_pixels": int(total_pixels),
                "changed_pixels": int(changed_pixels),
                "unchanged_pixels": int(total_pixels - changed_pixels),
                "change_percentage": float(changed_pixels / total_pixels * 100),
                "max_pixel_difference": int(max_difference),
                "average_pixel_difference": float(avg_difference),
                "practically_identical": max_difference <= 1
            })
        
        except Exception as e:
            return create_error_response(f"Image comparison failed: {str(e)}")
