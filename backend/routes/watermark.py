from flask import Blueprint, request, jsonify, send_file
from werkzeug.utils import secure_filename
import io
import base64
from services.watermarking_service import WatermarkingService
from services.utils import create_error_response, create_success_response
from config.config import allowed_file

watermark_bp = Blueprint('watermark', __name__, url_prefix='/api/watermark')

@watermark_bp.route('/text', methods=['POST'])
def add_text_watermark():
    """Add text watermark to an image"""
    try:
        # Check if the request contains files
        if 'image' not in request.files:
            return jsonify(create_error_response("Image file is required")[0]), 400
        
        image_file = request.files['image']
        
        if image_file.filename == '':
            return jsonify(create_error_response("No image file selected")[0]), 400
        
        if not allowed_file(image_file.filename):
            return jsonify(create_error_response("Invalid image file type")[0]), 400
        
        # Get parameters from form data
        watermark_text = request.form.get('text')
        if not watermark_text:
            return jsonify(create_error_response("Watermark text is required")[0]), 400
        
        opacity = float(request.form.get('opacity', 0.5))
        position = request.form.get('position', 'bottom-right')
        font_size = int(request.form.get('font_size', 36))
        color = request.form.get('color', 'white')
        
        # Process the image
        result, status_code = WatermarkingService.add_text_watermark(
            image_file, watermark_text, opacity, position, font_size, color
        )
        
        if status_code == 200:
            # Convert bytes to base64 for JSON response
            watermarked_image = base64.b64encode(result['watermarked_image']).decode('utf-8')
            result['watermarked_image'] = watermarked_image
        
        return jsonify(result), status_code
    
    except ValueError as e:
        return jsonify(create_error_response(f"Invalid parameter: {str(e)}")[0]), 400
    except Exception as e:
        return jsonify(create_error_response(f"Text watermarking failed: {str(e)}")[0]), 500

@watermark_bp.route('/text-download', methods=['POST'])
def add_text_watermark_download():
    """Add text watermark and return image file for download"""
    try:
        # Check if the request contains files
        if 'image' not in request.files:
            return jsonify(create_error_response("Image file is required")[0]), 400
        
        image_file = request.files['image']
        
        if image_file.filename == '':
            return jsonify(create_error_response("No image file selected")[0]), 400
        
        if not allowed_file(image_file.filename):
            return jsonify(create_error_response("Invalid image file type")[0]), 400
        
        # Get parameters from form data
        watermark_text = request.form.get('text')
        if not watermark_text:
            return jsonify(create_error_response("Watermark text is required")[0]), 400
        
        opacity = float(request.form.get('opacity', 0.5))
        position = request.form.get('position', 'bottom-right')
        font_size = int(request.form.get('font_size', 36))
        color = request.form.get('color', 'white')
        
        # Process the image
        result, status_code = WatermarkingService.add_text_watermark(
            image_file, watermark_text, opacity, position, font_size, color
        )
        
        if status_code != 200:
            return jsonify(result), status_code
        
        # Return the image as a file download
        img_buffer = io.BytesIO(result['watermarked_image'])
        img_buffer.seek(0)
        
        return send_file(
            img_buffer,
            mimetype='image/png',
            as_attachment=True,
            download_name='text_watermarked.png'
        )
    
    except ValueError as e:
        return jsonify(create_error_response(f"Invalid parameter: {str(e)}")[0]), 400
    except Exception as e:
        return jsonify(create_error_response(f"Text watermarking failed: {str(e)}")[0]), 500

@watermark_bp.route('/image', methods=['POST'])
def add_image_watermark():
    """Add image watermark to a base image"""
    try:
        # Check if the request contains both files
        if 'base_image' not in request.files or 'watermark_image' not in request.files:
            return jsonify(create_error_response("Both base image and watermark image files are required")[0]), 400
        
        base_image_file = request.files['base_image']
        watermark_image_file = request.files['watermark_image']
        
        if base_image_file.filename == '' or watermark_image_file.filename == '':
            return jsonify(create_error_response("Both image files must be selected")[0]), 400
        
        if not allowed_file(base_image_file.filename) or not allowed_file(watermark_image_file.filename):
            return jsonify(create_error_response("Invalid image file type")[0]), 400
        
        # Get parameters from form data
        opacity = float(request.form.get('opacity', 0.5))
        position = request.form.get('position', 'bottom-right')
        scale = float(request.form.get('scale', 0.2))
        
        # Process the images
        result, status_code = WatermarkingService.add_image_watermark(
            base_image_file, watermark_image_file, opacity, position, scale
        )
        
        if status_code == 200:
            # Convert bytes to base64 for JSON response
            watermarked_image = base64.b64encode(result['watermarked_image']).decode('utf-8')
            result['watermarked_image'] = watermarked_image
        
        return jsonify(result), status_code
    
    except ValueError as e:
        return jsonify(create_error_response(f"Invalid parameter: {str(e)}")[0]), 400
    except Exception as e:
        return jsonify(create_error_response(f"Image watermarking failed: {str(e)}")[0]), 500

@watermark_bp.route('/image-download', methods=['POST'])
def add_image_watermark_download():
    """Add image watermark and return image file for download"""
    try:
        # Check if the request contains both files
        if 'base_image' not in request.files or 'watermark_image' not in request.files:
            return jsonify(create_error_response("Both base image and watermark image files are required")[0]), 400
        
        base_image_file = request.files['base_image']
        watermark_image_file = request.files['watermark_image']
        
        if base_image_file.filename == '' or watermark_image_file.filename == '':
            return jsonify(create_error_response("Both image files must be selected")[0]), 400
        
        if not allowed_file(base_image_file.filename) or not allowed_file(watermark_image_file.filename):
            return jsonify(create_error_response("Invalid image file type")[0]), 400
        
        # Get parameters from form data
        opacity = float(request.form.get('opacity', 0.5))
        position = request.form.get('position', 'bottom-right')
        scale = float(request.form.get('scale', 0.2))
        
        # Process the images
        result, status_code = WatermarkingService.add_image_watermark(
            base_image_file, watermark_image_file, opacity, position, scale
        )
        
        if status_code != 200:
            return jsonify(result), status_code
        
        # Return the image as a file download
        img_buffer = io.BytesIO(result['watermarked_image'])
        img_buffer.seek(0)
        
        return send_file(
            img_buffer,
            mimetype='image/png',
            as_attachment=True,
            download_name='image_watermarked.png'
        )
    
    except ValueError as e:
        return jsonify(create_error_response(f"Invalid parameter: {str(e)}")[0]), 400
    except Exception as e:
        return jsonify(create_error_response(f"Image watermarking failed: {str(e)}")[0]), 500

@watermark_bp.route('/invisible', methods=['POST'])
def add_invisible_watermark():
    """Add invisible watermark using frequency domain manipulation"""
    try:
        # Check if the request contains files
        if 'image' not in request.files:
            return jsonify(create_error_response("Image file is required")[0]), 400
        
        image_file = request.files['image']
        
        if image_file.filename == '':
            return jsonify(create_error_response("No image file selected")[0]), 400
        
        if not allowed_file(image_file.filename):
            return jsonify(create_error_response("Invalid image file type")[0]), 400
        
        # Get parameters from form data
        watermark_text = request.form.get('text')
        if not watermark_text:
            return jsonify(create_error_response("Watermark text is required")[0]), 400
        
        strength = float(request.form.get('strength', 0.1))
        
        # Process the image
        result, status_code = WatermarkingService.add_invisible_watermark(
            image_file, watermark_text, strength
        )
        
        if status_code == 200:
            # Convert bytes to base64 for JSON response
            watermarked_image = base64.b64encode(result['watermarked_image']).decode('utf-8')
            result['watermarked_image'] = watermarked_image
        
        return jsonify(result), status_code
    
    except ValueError as e:
        return jsonify(create_error_response(f"Invalid parameter: {str(e)}")[0]), 400
    except Exception as e:
        return jsonify(create_error_response(f"Invisible watermarking failed: {str(e)}")[0]), 500

@watermark_bp.route('/extract-invisible', methods=['POST'])
def extract_invisible_watermark():
    """Extract invisible watermark from an image"""
    try:
        # Check if the request contains files
        if 'image' not in request.files:
            return jsonify(create_error_response("Image file is required")[0]), 400
        
        image_file = request.files['image']
        
        if image_file.filename == '':
            return jsonify(create_error_response("No image file selected")[0]), 400
        
        if not allowed_file(image_file.filename):
            return jsonify(create_error_response("Invalid image file type")[0]), 400
        
        # Get parameters from form data
        watermark_length = int(request.form.get('length', 10))
        strength = float(request.form.get('strength', 0.1))
        
        # Process the image
        result, status_code = WatermarkingService.extract_invisible_watermark(
            image_file, watermark_length, strength
        )
        
        return jsonify(result), status_code
    
    except ValueError as e:
        return jsonify(create_error_response(f"Invalid parameter: {str(e)}")[0]), 400
    except Exception as e:
        return jsonify(create_error_response(f"Invisible watermark extraction failed: {str(e)}")[0]), 500

@watermark_bp.route('/info', methods=['GET'])
def info():
    """Get watermarking module information"""
    return jsonify({
        "module": "Image Watermarking",
        "techniques": ["Visible Text Watermark", "Visible Image Watermark", "Invisible Watermark"],
        "supported_formats": ["PNG", "JPG", "JPEG", "GIF", "BMP"],
        "endpoints": {
            "/text": "Add visible text watermark (returns base64 encoded image)",
            "/text-download": "Add visible text watermark (returns downloadable file)",
            "/image": "Add visible image watermark (returns base64 encoded image)",
            "/image-download": "Add visible image watermark (returns downloadable file)",
            "/invisible": "Add invisible watermark using frequency domain",
            "/extract-invisible": "Extract invisible watermark from image",
            "/info": "Get module information"
        },
        "text_watermark_parameters": {
            "image": "Base image file (multipart/form-data, required)",
            "text": "Watermark text (form field, required)",
            "opacity": "Text opacity 0.0-1.0 (form field, optional, default: 0.5)",
            "position": "Position: top-left, top-right, bottom-left, bottom-right, center (form field, optional, default: bottom-right)",
            "font_size": "Font size in pixels (form field, optional, default: 36)",
            "color": "Text color: white, black, red, blue, etc. (form field, optional, default: white)"
        },
        "image_watermark_parameters": {
            "base_image": "Base image file (multipart/form-data, required)",
            "watermark_image": "Watermark image file (multipart/form-data, required)",
            "opacity": "Watermark opacity 0.0-1.0 (form field, optional, default: 0.5)",
            "position": "Position: top-left, top-right, bottom-left, bottom-right, center (form field, optional, default: bottom-right)",
            "scale": "Scale factor 0.0-1.0 relative to base image (form field, optional, default: 0.2)"
        },
        "invisible_watermark_parameters": {
            "image": "Base image file (multipart/form-data, required)",
            "text": "Watermark text (form field, required)",
            "strength": "Watermark strength 0.01-1.0 (form field, optional, default: 0.1)"
        },
        "extract_invisible_parameters": {
            "image": "Watermarked image file (multipart/form-data, required)",
            "length": "Expected watermark text length (form field, optional, default: 10)",
            "strength": "Watermark strength used during embedding (form field, optional, default: 0.1)"
        },
        "supported_positions": ["top-left", "top-right", "bottom-left", "bottom-right", "center"],
        "supported_colors": ["white", "black", "red", "green", "blue", "yellow", "cyan", "magenta"],
        "technical_details": {
            "visible_watermarks": "Added using PIL image compositing with alpha blending",
            "invisible_watermarks": "Embedded in frequency domain using DCT (Discrete Cosine Transform)",
            "extraction_accuracy": "Invisible watermark extraction is approximate and may not be fully accurate",
            "image_format": "Output images are saved in PNG format to preserve quality"
        }
    })
