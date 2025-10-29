"""
Layered Image Processing Service
Combines steganography and watermarking

CORRECTED FLOW (Watermark First, Then Steganography):
1. Original Image → Watermarking (add watermark) → Watermarked Image
2. Watermarked Image → Steganography (embed message) → Final Image
3. Extract: Final Image → Extract Steganography → Extract Watermark

This order ensures steganography (LSB) is on top layer and can be extracted cleanly.
"""

import base64
import io
from typing import Dict, Any, Tuple
from PIL import Image
from .steganography_service import SteganographyService
from .watermarking_service import WatermarkingService
from .utils import create_success_response, create_error_response


class LayeredImageService:
    """Service for layered image processing with steganography and watermarking"""
    
    @staticmethod
    def process_layered_image(
        image_file,
        secret_message: str = None,
        watermark_text: str = None,
        watermark_type: str = 'invisible',
        watermark_opacity: float = 0.5,
        watermark_position: str = 'bottom-right'
    ) -> Tuple[Dict[str, Any], int]:
        """
        Apply multiple layers to an image
        CORRECTED Flow: Image → Watermarking → Steganography → Final Image
        
        Args:
            image_file: PIL Image or file-like object
            secret_message: Message to hide via steganography
            watermark_text: Text to add as watermark
            watermark_type: 'text' or 'invisible'
            watermark_opacity: Opacity for visible watermark (0.0-1.0)
            watermark_position: Position for visible watermark
            
        Returns:
            Tuple of (result_dict, status_code)
        """
        try:
            layers_applied = []
            current_image = image_file
            stego_image_b64 = None
            
            # Layer 1: Watermarking FIRST (if watermark text provided)
            if watermark_text:
                print(f"[Layer 1] Applying Watermarking - Type: {watermark_type}")
                
                if watermark_type == 'text':
                    # Visible text watermark
                    watermark_result, watermark_status = WatermarkingService.add_text_watermark(
                        current_image,
                        watermark_text,
                        opacity=watermark_opacity,
                        position=watermark_position
                    )
                else:
                    # Invisible watermark
                    watermark_result, watermark_status = WatermarkingService.add_invisible_watermark(
                        current_image,
                        watermark_text,
                        strength=0.1
                    )
                
                if watermark_status == 200:
                    watermarked_image_bytes = watermark_result['watermarked_image']
                    watermarked_image_b64 = base64.b64encode(watermarked_image_bytes).decode('utf-8')
                    current_image = Image.open(io.BytesIO(watermarked_image_bytes))
                    
                    layers_applied.append({
                        'layer': 1,
                        'type': 'watermark',
                        'watermark_type': watermark_type,
                        'text': watermark_text,
                        'completed': True
                    })
                    print(f"[Layer 1] ✓ Watermarking completed - Type: {watermark_type}")
                else:
                    return create_error_response(f"Watermarking failed: {watermark_result.get('error', 'Unknown error')}")
            
            # Layer 2: Steganography SECOND on top of watermark (if secret message provided)
            if secret_message:
                print(f"[Layer 2] Applying Steganography - Message: {len(secret_message)} chars")
                
                steg_result, steg_status = SteganographyService.embed_message(
                    current_image,
                    secret_message
                )
                
                if steg_status == 200:
                    # Convert the encoded image bytes back to base64 for response
                    stego_image_bytes = steg_result['encoded_image']
                    final_image_b64 = base64.b64encode(stego_image_bytes).decode('utf-8')
                    
                    layers_applied.append({
                        'layer': 2 if watermark_text else 1,
                        'type': 'steganography',
                        'method': 'LSB',
                        'message_length': len(secret_message),
                        'bits_used': steg_result['bits_used'],
                        'completed': True
                    })
                    print(f"[Layer 2] ✓ Steganography completed - {steg_result['bits_used']} bits used")
                else:
                    return create_error_response(f"Steganography failed: {steg_result.get('error', 'Unknown error')}")
            else:
                # No steganography, use watermarked image as final
                if watermarked_image_b64:
                    final_image_b64 = watermarked_image_b64
                else:
                    return create_error_response("At least one operation must be specified")
            
            return create_success_response({
                'processed_image': final_image_b64,
                'layers_applied': layers_applied,
                'total_layers': len(layers_applied),
                'flow': 'Original → Watermarking → Steganography → Final' if len(layers_applied) == 2 else 
                       ('Original → Steganography → Final' if secret_message else 'Original → Watermarking → Final')
            })
            
        except Exception as e:
            print(f"[ERROR] Image processing failed: {str(e)}")
            import traceback
            traceback.print_exc()
            return create_error_response(f'Image processing failed: {str(e)}')
    
    @staticmethod
    def extract_layered_data(
        image_file,
        extract_stego: bool = True,
        extract_watermark: bool = True,
        watermark_length: int = 10
    ) -> Tuple[Dict[str, Any], int]:
        """
        Extract hidden data from layered image
        CORRECTED Flow: Final Image → Extract Steganography FIRST → Then Watermark
        
        Args:
            image_file: PIL Image or file-like object (the processed image)
            extract_stego: Whether to extract steganography
            extract_watermark: Whether to extract watermark
            watermark_length: Expected watermark text length
            
        Returns:
            Tuple of (result_dict, status_code)
        """
        try:
            extracted_data = {}
            layers_extracted = []
            
            print(f"\n{'='*60}")
            print(f"EXTRACTION STARTED")
            print(f"{'='*60}")
            print(f"Extract Steganography: {extract_stego}")
            print(f"Extract Watermark: {extract_watermark}")
            print(f"Expected Watermark Length: {watermark_length}")
            
            # Extract steganography FIRST (LSB method - top layer)
            if extract_stego:
                print(f"\n[1/2] Extracting steganography message (TOP LAYER)...")
                try:
                    steg_result, steg_status = SteganographyService.extract_message(image_file)
                    
                    print(f"  Status Code: {steg_status}")
                    print(f"  Result Keys: {steg_result.keys()}")
                    
                    if steg_status == 200 and steg_result.get('success'):
                        message = steg_result.get('message', '')
                        extracted_data['hidden_message'] = message
                        layers_extracted.append({
                            'layer': 'steganography',
                            'method': 'LSB',
                            'message_length': len(message),
                            'extracted': True
                        })
                        print(f"  ✓ SUCCESS - Message: '{message}' ({len(message)} chars)")
                    else:
                        error_msg = steg_result.get('error', 'Unknown error')
                        print(f"  ✗ FAILED - {error_msg}")
                        extracted_data['hidden_message'] = None
                        layers_extracted.append({
                            'layer': 'steganography',
                            'extracted': False,
                            'error': error_msg
                        })
                except Exception as e:
                    print(f"  ✗ EXCEPTION - {str(e)}")
                    import traceback
                    traceback.print_exc()
                    extracted_data['hidden_message'] = None
                    layers_extracted.append({
                        'layer': 'steganography',
                        'extracted': False,
                        'error': str(e)
                    })
            
            # Extract invisible watermark SECOND (bottom layer)
            if extract_watermark:
                print(f"\n[2/2] Extracting watermark (BOTTOM LAYER)...")
                try:
                    watermark_result, watermark_status = WatermarkingService.extract_invisible_watermark(
                        image_file,
                        watermark_length,
                        strength=0.1
                    )
                    
                    print(f"  Status Code: {watermark_status}")
                    print(f"  Result Keys: {watermark_result.keys()}")
                    
                    if watermark_status == 200 and watermark_result.get('success'):
                        watermark_text = watermark_result.get('extracted_text', '')
                        extracted_data['watermark'] = watermark_text
                        layers_extracted.append({
                            'layer': 'watermark',
                            'extracted': True,
                            'confidence': watermark_result.get('confidence', 'low')
                        })
                        print(f"  ✓ SUCCESS - Watermark: '{watermark_text}'")
                    else:
                        error_msg = watermark_result.get('error', 'Unknown error')
                        print(f"  ✗ FAILED - {error_msg}")
                        extracted_data['watermark'] = None
                        layers_extracted.append({
                            'layer': 'watermark',
                            'extracted': False,
                            'error': error_msg
                        })
                except Exception as e:
                    print(f"  ✗ EXCEPTION - {str(e)}")
                    import traceback
                    traceback.print_exc()
                    extracted_data['watermark'] = None
                    layers_extracted.append({
                        'layer': 'watermark',
                        'extracted': False,
                        'error': str(e)
                    })
            
            print(f"\n{'='*60}")
            print(f"EXTRACTION COMPLETED")
            print(f"Extracted Data: {extracted_data}")
            print(f"{'='*60}\n")
            
            return create_success_response({
                'extracted_data': extracted_data,
                'layers_extracted': layers_extracted,
                'extraction_flow': 'Final Image → Steganography (Top) → Watermark (Bottom)'
            })
            
        except Exception as e:
            print(f"\n{'='*60}")
            print(f"[ERROR] Extraction failed: {str(e)}")
            print(f"{'='*60}\n")
            import traceback
            traceback.print_exc()
            return create_error_response(f'Extraction failed: {str(e)}')
