from PIL import Image, ImageDraw, ImageFont
import numpy as np
import cv2
from .utils import (
    create_error_response, create_success_response,
    image_to_bytes, file_to_image, save_temp_image
)

class WatermarkingService:
    """Service for image watermarking operations"""
    
    @staticmethod
    def add_text_watermark(image_file, watermark_text: str, opacity: float = 0.5, 
                          position: str = 'bottom-right', font_size: int = 36, color: str = 'white'):
        """
        Add text watermark to an image
        
        Args:
            image_file: Image file (FileStorage or PIL Image)
            watermark_text: Text to add as watermark
            opacity: Watermark opacity (0.0 to 1.0)
            position: Watermark position ('top-left', 'top-right', 'bottom-left', 'bottom-right', 'center')
            font_size: Font size for the watermark
            color: Text color ('white', 'black', 'red', 'blue', etc.)
        
        Returns:
            Tuple of (result_dict, status_code)
        """
        try:
            if not watermark_text:
                return create_error_response("Watermark text is required")
            
            # Load image
            if hasattr(image_file, 'stream'):
                image = file_to_image(image_file)
            else:
                image = image_file
            
            # Convert to RGBA for transparency support
            if image.mode != 'RGBA':
                image = image.convert('RGBA')
            
            # Create transparent overlay
            overlay = Image.new('RGBA', image.size, (255, 255, 255, 0))
            draw = ImageDraw.Draw(overlay)
            
            # Try to use a default font, fallback to built-in font
            try:
                font = ImageFont.truetype("arial.ttf", font_size)
            except:
                try:
                    font = ImageFont.load_default()
                except:
                    font = None
            
            # Get text dimensions
            if font:
                bbox = draw.textbbox((0, 0), watermark_text, font=font)
                text_width = bbox[2] - bbox[0]
                text_height = bbox[3] - bbox[1]
            else:
                # Estimate text size if font loading fails
                text_width = len(watermark_text) * font_size * 0.6
                text_height = font_size
            
            # Calculate position
            img_width, img_height = image.size
            
            position_map = {
                'top-left': (20, 20),
                'top-right': (img_width - text_width - 20, 20),
                'bottom-left': (20, img_height - text_height - 20),
                'bottom-right': (img_width - text_width - 20, img_height - text_height - 20),
                'center': ((img_width - text_width) // 2, (img_height - text_height) // 2)
            }
            
            if position not in position_map:
                return create_error_response("Invalid position. Use: top-left, top-right, bottom-left, bottom-right, center")
            
            x, y = position_map[position]
            
            # Color mapping
            color_map = {
                'white': (255, 255, 255),
                'black': (0, 0, 0),
                'red': (255, 0, 0),
                'green': (0, 255, 0),
                'blue': (0, 0, 255),
                'yellow': (255, 255, 0),
                'cyan': (0, 255, 255),
                'magenta': (255, 0, 255)
            }
            
            text_color = color_map.get(color.lower(), (255, 255, 255))
            alpha = int(opacity * 255)
            text_color_with_alpha = text_color + (alpha,)
            
            # Draw text
            draw.text((x, y), watermark_text, fill=text_color_with_alpha, font=font)
            
            # Composite the overlay onto the original image
            watermarked = Image.alpha_composite(image, overlay)
            
            # Convert back to RGB if needed
            if watermarked.mode == 'RGBA':
                background = Image.new('RGB', watermarked.size, (255, 255, 255))
                background.paste(watermarked, mask=watermarked.split()[-1])
                watermarked = background
            
            # Convert to bytes
            watermarked_bytes = image_to_bytes(watermarked, 'PNG')
            
            return create_success_response({
                "watermarked_image": watermarked_bytes,
                "watermark_text": watermark_text,
                "opacity": opacity,
                "position": position,
                "font_size": font_size,
                "color": color,
                "format": "PNG"
            })
        
        except Exception as e:
            return create_error_response(f"Text watermarking failed: {str(e)}")
    
    @staticmethod
    def add_image_watermark(base_image_file, watermark_image_file, opacity: float = 0.5,
                           position: str = 'bottom-right', scale: float = 0.2):
        """
        Add image watermark to a base image
        
        Args:
            base_image_file: Base image file (FileStorage or PIL Image)
            watermark_image_file: Watermark image file (FileStorage or PIL Image)
            opacity: Watermark opacity (0.0 to 1.0)
            position: Watermark position ('top-left', 'top-right', 'bottom-left', 'bottom-right', 'center')
            scale: Scale factor for watermark size relative to base image (0.0 to 1.0)
        
        Returns:
            Tuple of (result_dict, status_code)
        """
        try:
            # Load images
            if hasattr(base_image_file, 'stream'):
                base_image = file_to_image(base_image_file)
            else:
                base_image = base_image_file
            
            if hasattr(watermark_image_file, 'stream'):
                watermark_image = file_to_image(watermark_image_file)
            else:
                watermark_image = watermark_image_file
            
            # Convert to RGBA for transparency support
            if base_image.mode != 'RGBA':
                base_image = base_image.convert('RGBA')
            if watermark_image.mode != 'RGBA':
                watermark_image = watermark_image.convert('RGBA')
            
            # Scale watermark
            base_width, base_height = base_image.size
            watermark_width = int(base_width * scale)
            watermark_height = int(base_height * scale)
            
            # Maintain aspect ratio
            watermark_ratio = watermark_image.width / watermark_image.height
            if watermark_width / watermark_height > watermark_ratio:
                watermark_width = int(watermark_height * watermark_ratio)
            else:
                watermark_height = int(watermark_width / watermark_ratio)
            
            watermark_resized = watermark_image.resize((watermark_width, watermark_height), Image.Resampling.LANCZOS)
            
            # Calculate position
            position_map = {
                'top-left': (20, 20),
                'top-right': (base_width - watermark_width - 20, 20),
                'bottom-left': (20, base_height - watermark_height - 20),
                'bottom-right': (base_width - watermark_width - 20, base_height - watermark_height - 20),
                'center': ((base_width - watermark_width) // 2, (base_height - watermark_height) // 2)
            }
            
            if position not in position_map:
                return create_error_response("Invalid position. Use: top-left, top-right, bottom-left, bottom-right, center")
            
            x, y = position_map[position]
            
            # Apply opacity to watermark
            watermark_with_opacity = watermark_resized.copy()
            alpha = watermark_with_opacity.split()[-1]
            alpha = alpha.point(lambda p: int(p * opacity))
            watermark_with_opacity.putalpha(alpha)
            
            # Paste watermark onto base image
            result_image = base_image.copy()
            result_image.paste(watermark_with_opacity, (x, y), watermark_with_opacity)
            
            # Convert back to RGB if needed
            if result_image.mode == 'RGBA':
                background = Image.new('RGB', result_image.size, (255, 255, 255))
                background.paste(result_image, mask=result_image.split()[-1])
                result_image = background
            
            # Convert to bytes
            watermarked_bytes = image_to_bytes(result_image, 'PNG')
            
            return create_success_response({
                "watermarked_image": watermarked_bytes,
                "opacity": opacity,
                "position": position,
                "scale": scale,
                "watermark_size": f"{watermark_width}x{watermark_height}",
                "base_image_size": f"{base_width}x{base_height}",
                "format": "PNG"
            })
        
        except Exception as e:
            return create_error_response(f"Image watermarking failed: {str(e)}")
    
    @staticmethod
    def add_invisible_watermark(image_file, watermark_text: str, strength: float = 0.1):
        """
        Add invisible watermark using frequency domain manipulation
        
        Args:
            image_file: Image file (FileStorage or PIL Image)
            watermark_text: Text to embed as invisible watermark
            strength: Watermark strength (0.01 to 1.0)
        
        Returns:
            Tuple of (result_dict, status_code)
        """
        try:
            if not watermark_text:
                return create_error_response("Watermark text is required")
            
            # Load image
            if hasattr(image_file, 'stream'):
                image = file_to_image(image_file)
            else:
                image = image_file
            
            # Convert to RGB
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Convert to numpy array
            img_array = np.array(image)
            
            # Convert to YUV color space (watermark in luminance channel)
            img_yuv = cv2.cvtColor(img_array, cv2.COLOR_RGB2YUV)
            y_channel = img_yuv[:, :, 0].astype(np.float32)
            
            # Apply DCT (Discrete Cosine Transform)
            dct_coeffs = cv2.dct(y_channel)
            
            # Create watermark pattern from text
            watermark_binary = ''.join(format(ord(char), '08b') for char in watermark_text)
            
            # Embed watermark in mid-frequency coefficients
            rows, cols = dct_coeffs.shape
            watermark_length = len(watermark_binary)
            
            # Select positions for embedding (avoiding DC and high-frequency components)
            # Use more of the coefficient space to support longer watermarks
            positions = []
            max_range_i = min(rows//2, 100)  # Use up to 100 rows
            max_range_j = min(cols//2, 100)  # Use up to 100 cols
            
            for i in range(1, max_range_i):
                for j in range(1, max_range_j):
                    if len(positions) < watermark_length:
                        positions.append((i, j))
                    else:
                        break
                if len(positions) >= watermark_length:
                    break
            
            if len(positions) < watermark_length:
                # Truncate watermark text if image is too small
                max_chars = len(positions) // 8
                if max_chars < 3:
                    return create_error_response(f"Image too small. Minimum size: 100x100 pixels. Current: {image.width}x{image.height}")
                
                # Truncate the watermark text
                watermark_text = watermark_text[:max_chars]
                watermark_binary = ''.join(format(ord(char), '08b') for char in watermark_text)
                watermark_length = len(watermark_binary)
                print(f"[WARNING] Watermark truncated to {max_chars} characters to fit image")
            
            # Embed watermark bits
            for idx, bit in enumerate(watermark_binary):
                if idx < len(positions):
                    i, j = positions[idx]
                    if bit == '1':
                        dct_coeffs[i, j] += strength * abs(dct_coeffs[i, j])
                    else:
                        dct_coeffs[i, j] -= strength * abs(dct_coeffs[i, j])
            
            # Apply inverse DCT
            watermarked_y = cv2.idct(dct_coeffs)
            watermarked_y = np.clip(watermarked_y, 0, 255).astype(np.uint8)
            
            # Reconstruct image
            img_yuv[:, :, 0] = watermarked_y
            watermarked_rgb = cv2.cvtColor(img_yuv, cv2.COLOR_YUV2RGB)
            
            # Convert back to PIL Image
            watermarked_image = Image.fromarray(watermarked_rgb)
            
            # Convert to bytes
            watermarked_bytes = image_to_bytes(watermarked_image, 'PNG')
            
            return create_success_response({
                "watermarked_image": watermarked_bytes,
                "watermark_text": watermark_text,
                "strength": strength,
                "embedding_positions": len(positions),
                "format": "PNG",
                "type": "invisible"
            })
        
        except Exception as e:
            return create_error_response(f"Invisible watermarking failed: {str(e)}")
    
    @staticmethod
    def extract_invisible_watermark(image_file, watermark_length: int, strength: float = 0.1):
        """
        Extract invisible watermark from an image
        
        Args:
            image_file: Watermarked image file (FileStorage or PIL Image)
            watermark_length: Expected length of watermark text
            strength: Watermark strength used during embedding
        
        Returns:
            Tuple of (result_dict, status_code)
        """
        try:
            # Load image
            if hasattr(image_file, 'stream'):
                image = file_to_image(image_file)
            else:
                image = image_file
            
            # Convert to RGB
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Convert to numpy array
            img_array = np.array(image)
            
            # Convert to YUV color space
            img_yuv = cv2.cvtColor(img_array, cv2.COLOR_RGB2YUV)
            y_channel = img_yuv[:, :, 0].astype(np.float32)
            
            # Apply DCT
            dct_coeffs = cv2.dct(y_channel)
            
            # Calculate expected watermark bit length
            watermark_bits = watermark_length * 8
            
            # Get the same positions used for embedding (must match embedding algorithm)
            rows, cols = dct_coeffs.shape
            positions = []
            max_range_i = min(rows//2, 100)  # Match embedding range
            max_range_j = min(cols//2, 100)  # Match embedding range
            
            for i in range(1, max_range_i):
                for j in range(1, max_range_j):
                    if len(positions) < watermark_bits:
                        positions.append((i, j))
                    else:
                        break
                if len(positions) >= watermark_bits:
                    break
            
            if len(positions) < watermark_bits:
                # Extract what we can
                watermark_bits = len(positions)
                watermark_length = watermark_bits // 8
                print(f"[WARNING] Can only extract {watermark_length} characters from this image")
            
            # Extract watermark bits (this is a simplified extraction)
            extracted_bits = []
            for idx in range(watermark_bits):
                if idx < len(positions):
                    i, j = positions[idx]
                    # Simple threshold-based extraction
                    if dct_coeffs[i, j] > 0:
                        extracted_bits.append('1')
                    else:
                        extracted_bits.append('0')
            
            # Convert bits to text
            extracted_text = ""
            for i in range(0, len(extracted_bits), 8):
                byte_bits = ''.join(extracted_bits[i:i+8])
                if len(byte_bits) == 8:
                    try:
                        char_code = int(byte_bits, 2)
                        if 32 <= char_code <= 126:  # Printable ASCII
                            extracted_text += chr(char_code)
                    except ValueError:
                        continue
            
            return create_success_response({
                "extracted_text": extracted_text,
                "confidence": "low",  # Simple extraction has low confidence
                "extracted_bits": len(extracted_bits),
                "note": "Invisible watermark extraction is approximate and may not be fully accurate"
            })
        
        except Exception as e:
            return create_error_response(f"Invisible watermark extraction failed: {str(e)}")
