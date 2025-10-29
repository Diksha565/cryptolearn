"""
Routes for layered image processing operations
"""

from flask import Blueprint, request, jsonify
from services.layered_image_service import LayeredImageService
from services.utils import file_to_image
import base64
import io

layered_image_bp = Blueprint('layered_image', __name__, url_prefix='/api/layered-image')


@layered_image_bp.route('/process', methods=['POST'])
def process_image():
    """
    Process image with multiple layers (steganography + watermarking)
    
    Expected JSON:
    {
        "image": "base64_encoded_image",
        "secret_message": "text to hide",  // optional
        "watermark_text": "watermark",  // optional
        "watermark_type": "text" or "invisible",  // optional, default: "invisible"
        "watermark_opacity": 0.5,  // optional, for visible watermark
        "watermark_position": "bottom-right"  // optional
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'error': 'No JSON data provided'}), 400
        
        # Get image data
        image_data = data.get('image')
        if not image_data:
            return jsonify({'success': False, 'error': 'Image data is required'}), 400
        
        secret_message = data.get('secret_message')
        watermark_text = data.get('watermark_text')
        watermark_type = data.get('watermark_type', 'invisible')
        watermark_opacity = float(data.get('watermark_opacity', 0.5))
        watermark_position = data.get('watermark_position', 'bottom-right')
        
        # At least one operation must be specified
        if not secret_message and not watermark_text:
            return jsonify({
                'success': False,
                'error': 'At least one of secret_message or watermark_text must be provided'
            }), 400
        
        # Convert base64 to PIL Image
        try:
            image_bytes = base64.b64decode(image_data)
            from PIL import Image
            image = Image.open(io.BytesIO(image_bytes))
        except Exception as e:
            return jsonify({'success': False, 'error': f'Invalid image data: {str(e)}'}), 400
        
        # Process the image
        result, status_code = LayeredImageService.process_layered_image(
            image,
            secret_message,
            watermark_text,
            watermark_type,
            watermark_opacity,
            watermark_position
        )
        
        return jsonify(result), status_code
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': f'Image processing failed: {str(e)}'}), 500


@layered_image_bp.route('/extract', methods=['POST'])
def extract_data():
    """
    Extract hidden data from layered image
    
    Expected JSON:
    {
        "image": "base64_encoded_image",
        "extract_stego": true,  // optional, default true
        "extract_watermark": true,  // optional, default true
        "watermark_length": 10  // optional, expected watermark length
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'error': 'No JSON data provided'}), 400
        
        # Get image data
        image_data = data.get('image')
        if not image_data:
            return jsonify({'success': False, 'error': 'Image data is required'}), 400
        
        extract_stego = data.get('extract_stego', True)
        extract_watermark = data.get('extract_watermark', True)
        watermark_length = int(data.get('watermark_length', 10))
        
        # Convert base64 to PIL Image
        try:
            image_bytes = base64.b64decode(image_data)
            from PIL import Image
            image = Image.open(io.BytesIO(image_bytes))
        except Exception as e:
            return jsonify({'success': False, 'error': f'Invalid image data: {str(e)}'}), 400
        
        # Extract data
        result, status_code = LayeredImageService.extract_layered_data(
            image,
            extract_stego,
            extract_watermark,
            watermark_length
        )
        
        return jsonify(result), status_code
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': f'Extraction failed: {str(e)}'}), 500


@layered_image_bp.route('/info', methods=['GET'])
def get_info():
    """Get information about layered image processing"""
    return jsonify({
        'success': True,
        'module': 'Layered Image Processing',
        'flow': 'Original Image → Watermarking → Steganography (LSB) → Final Image',
        'extraction_flow': 'Final Image → Extract Steganography → Extract Watermark',
        'layers': [
            {
                'layer': 1,
                'name': 'Watermarking',
                'methods': ['Visible Text Watermark', 'Invisible DCT Watermark'],
                'purpose': 'Add copyright/ownership protection (bottom layer)'
            },
            {
                'layer': 2,
                'name': 'Steganography',
                'method': 'LSB (Least Significant Bit)',
                'purpose': 'Hide secret message in image pixels (top layer)'
            }
        ],
        'why_this_order': 'Watermark is applied first, then steganography on top. This ensures the LSB steganography can be extracted cleanly without interference.',
        'watermark_types': {
            'text': 'Visible text overlay with opacity control',
            'invisible': 'Frequency domain watermark (DCT-based)'
        },
        'features': [
            'LSB steganography for message hiding (top layer)',
            'Visible and invisible watermarking (bottom layer)',
            'Data extraction and watermark detection',
            'Layer-by-layer processing',
            'Correct extraction order'
        ],
        'endpoints': {
            '/process': 'Apply watermarking and steganography layers',
            '/extract': 'Extract hidden message and watermark',
            '/info': 'Get module information'
        }
    }), 200
