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
                          position: str = 'bottom-right', font_size: int = 36, color: str = 'black'):
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
            # Attempt to load a common system font with the correct size
                font = ImageFont.truetype("arial.ttf", font_size)
            except IOError:
                # If arial.ttf is not found, fall back to the default font.
                # Pillow's default font is bitmap, so we can't resize it directly.
                # This is a limitation, but better than always being tiny.
                font = ImageFont.load_default()
    
            
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
    def add_invisible_watermark(image_file, watermark_text: str, strength: float = 1.0):
        """
        Add invisible watermark using frequency domain manipulation.
        """
        try:
            if not watermark_text:
                return create_error_response("Watermark text is required")

            # Load image
            image = file_to_image(image_file) if hasattr(image_file, 'stream') else image_file
            if image.mode != 'RGB':
                image = image.convert('RGB')

            # Convert to numpy array and YUV
            img_array = np.array(image)
            img_yuv = cv2.cvtColor(img_array, cv2.COLOR_RGB2YUV)
            y_channel = img_yuv[:, :, 0].astype(np.float32)

            # Apply DCT
            dct_coeffs = cv2.dct(y_channel)

            # Convert watermark text to binary
            watermark_binary = ''.join(format(ord(char), '08b') for char in watermark_text)
            watermark_bits = list(watermark_binary)
            total_bits = len(watermark_bits)
            total_bits_with_redundancy = total_bits * 3

            # Select mid-frequency positions for embedding
            rows, cols = dct_coeffs.shape
            positions = []
            for i in range(rows // 8, rows * 3 // 4):
                for j in range(cols // 8, cols * 3 // 4):
                    if len(positions) >= total_bits_with_redundancy:
                        break
                    positions.append((i, j))
                if len(positions) >= total_bits_with_redundancy:
                    break

            if len(positions) < total_bits_with_redundancy:
                return create_error_response("Image is too small for the watermark text")

            # Embed watermark using sign-based encoding with redundancy
            for bit_idx, bit in enumerate(watermark_bits):
                for rep in range(3):
                    pos_idx = bit_idx * 3 + rep
                    i, j = positions[pos_idx]
                    coeff = abs(dct_coeffs[i, j])
                    delta = strength * coeff
                    dct_coeffs[i, j] = coeff + delta if bit == '1' else -coeff - delta

            # Apply inverse DCT
            watermarked_y = cv2.idct(dct_coeffs)
            watermarked_y = np.clip(watermarked_y, 0, 255).astype(np.uint8)
            img_yuv[:, :, 0] = watermarked_y

            # Convert back to RGB
            watermarked_rgb = cv2.cvtColor(img_yuv, cv2.COLOR_YUV2RGB)
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
    def extract_invisible_watermark(image_file, watermark_length: int = 8, strength: float = 1.0):
        """
        Extract invisible watermark from image using majority voting.
        """
        try:
            # Load image
            image = file_to_image(image_file) if hasattr(image_file, 'stream') else image_file
            if image.mode != 'RGB':
                image = image.convert('RGB')

            img_array = np.array(image)
            img_yuv = cv2.cvtColor(img_array, cv2.COLOR_RGB2YUV)
            y_channel = img_yuv[:, :, 0].astype(np.float32)

            # DCT
            dct_coeffs = cv2.dct(y_channel)

            # Prepare position list
            watermark_bits = watermark_length * 8
            total_bits_with_redundancy = watermark_bits * 3

            rows, cols = dct_coeffs.shape
            positions = []
            for i in range(rows // 8, rows * 3 // 4):
                for j in range(cols // 8, cols * 3 // 4):
                    if len(positions) >= total_bits_with_redundancy:
                        break
                    positions.append((i, j))
                if len(positions) >= total_bits_with_redundancy:
                    break

            if len(positions) < total_bits_with_redundancy:
                return create_error_response("Cannot extract watermark: insufficient embedding positions")

            # Extract bits using majority voting
            extracted_bits = []
            for bit_idx in range(watermark_bits):
                votes = []
                for rep in range(3):
                    pos_idx = bit_idx * 3 + rep
                    i, j = positions[pos_idx]
                    coeff = dct_coeffs[i, j]
                    votes.append(1 if coeff > 0 else 0)
                extracted_bits.append('1' if sum(votes) >= 2 else '0')

            # Convert bits to text
            extracted_text = ""
            for i in range(0, len(extracted_bits), 8):
                byte = ''.join(extracted_bits[i:i+8])
                try:
                    char_code = int(byte, 2)
                    if 32 <= char_code <= 126:  # Printable ASCII
                        extracted_text += chr(char_code)
                    else:
                        extracted_text += '?'
                except:
                    extracted_text += '?'

            return create_success_response({
                "extracted_text": extracted_text,
                "confidence": "higher",  # Due to redundancy
                "extracted_bits": len(extracted_bits),
                "note": "Majority voting used for bit recovery"
            })

        except Exception as e:
            return create_error_response(f"Invisible watermark extraction failed: {str(e)}")