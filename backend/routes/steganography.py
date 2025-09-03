from flask import Blueprint, request, jsonify, send_file
from werkzeug.utils import secure_filename
import io
import base64
from services.steganography_service import SteganographyService
from services.utils import create_error_response, create_success_response
from config.config import allowed_file

steganography_bp = Blueprint('steganography', __name__, url_prefix='/api/steganography')

@steganography_bp.route('/embed', methods=['POST'])
def embed_message():
    """Embed a secret message in an image using LSB steganography"""
    try:
        # Check if the request contains files
        if 'image' not in request.files:
            return jsonify(create_error_response("Image file is required")[0]), 400
        
        image_file = request.files['image']
        
        if image_file.filename == '':
            return jsonify(create_error_response("No image file selected")[0]), 400
        
        if not allowed_file(image_file.filename):
            return jsonify(create_error_response("Invalid image file type")[0]), 400
        
        # Get message from form data
        message = request.form.get('message')
        if not message:
            return jsonify(create_error_response("Message is required")[0]), 400
        
        # Process the image
        result, status_code = SteganographyService.embed_message(image_file, message)
        
        if status_code == 200:
            # Convert bytes to base64 for JSON response
            encoded_image = base64.b64encode(result['encoded_image']).decode('utf-8')
            result['encoded_image'] = encoded_image
        
        return jsonify(result), status_code
    
    except Exception as e:
        return jsonify(create_error_response(f"Message embedding failed: {str(e)}")[0]), 500

@steganography_bp.route('/embed-download', methods=['POST'])
def embed_message_download():
    """Embed message and return image file for download"""
    try:
        # Check if the request contains files
        if 'image' not in request.files:
            return jsonify(create_error_response("Image file is required")[0]), 400
        
        image_file = request.files['image']
        
        if image_file.filename == '':
            return jsonify(create_error_response("No image file selected")[0]), 400
        
        if not allowed_file(image_file.filename):
            return jsonify(create_error_response("Invalid image file type")[0]), 400
        
        # Get message from form data
        message = request.form.get('message')
        if not message:
            return jsonify(create_error_response("Message is required")[0]), 400
        
        # Process the image
        result, status_code = SteganographyService.embed_message(image_file, message)
        
        if status_code != 200:
            return jsonify(result), status_code
        
        # Return the image as a file download
        img_buffer = io.BytesIO(result['encoded_image'])
        img_buffer.seek(0)
        
        return send_file(
            img_buffer,
            mimetype='image/png',
            as_attachment=True,
            download_name='steganography_encoded.png'
        )
    
    except Exception as e:
        return jsonify(create_error_response(f"Message embedding failed: {str(e)}")[0]), 500

@steganography_bp.route('/extract', methods=['POST'])
def extract_message():
    """Extract a secret message from an image"""
    try:
        # Check if the request contains files
        if 'image' not in request.files:
            return jsonify(create_error_response("Image file is required")[0]), 400
        
        image_file = request.files['image']
        
        if image_file.filename == '':
            return jsonify(create_error_response("No image file selected")[0]), 400
        
        if not allowed_file(image_file.filename):
            return jsonify(create_error_response("Invalid image file type")[0]), 400
        
        # Process the image
        result, status_code = SteganographyService.extract_message(image_file)
        return jsonify(result), status_code
    
    except Exception as e:
        return jsonify(create_error_response(f"Message extraction failed: {str(e)}")[0]), 500

@steganography_bp.route('/capacity', methods=['POST'])
def get_capacity():
    """Get the maximum message capacity of an image"""
    try:
        # Check if the request contains files
        if 'image' not in request.files:
            return jsonify(create_error_response("Image file is required")[0]), 400
        
        image_file = request.files['image']
        
        if image_file.filename == '':
            return jsonify(create_error_response("No image file selected")[0]), 400
        
        if not allowed_file(image_file.filename):
            return jsonify(create_error_response("Invalid image file type")[0]), 400
        
        # Process the image
        result, status_code = SteganographyService.get_image_capacity(image_file)
        return jsonify(result), status_code
    
    except Exception as e:
        return jsonify(create_error_response(f"Capacity calculation failed: {str(e)}")[0]), 500

@steganography_bp.route('/compare', methods=['POST'])
def compare_images():
    """Compare original and encoded images"""
    try:
        # Check if the request contains both files
        if 'original' not in request.files or 'encoded' not in request.files:
            return jsonify(create_error_response("Both original and encoded image files are required")[0]), 400
        
        original_file = request.files['original']
        encoded_file = request.files['encoded']
        
        if original_file.filename == '' or encoded_file.filename == '':
            return jsonify(create_error_response("Both image files must be selected")[0]), 400
        
        if not allowed_file(original_file.filename) or not allowed_file(encoded_file.filename):
            return jsonify(create_error_response("Invalid image file type")[0]), 400
        
        # Process the images
        result, status_code = SteganographyService.compare_images(original_file, encoded_file)
        return jsonify(result), status_code
    
    except Exception as e:
        return jsonify(create_error_response(f"Image comparison failed: {str(e)}")[0]), 500

@steganography_bp.route('/info', methods=['GET'])
def info():
    """Get steganography module information"""
    return jsonify({
        "module": "LSB Steganography",
        "technique": "Least Significant Bit (LSB) modification",
        "supported_formats": ["PNG", "JPG", "JPEG", "GIF", "BMP"],
        "color_mode": "RGB",
        "endpoints": {
            "/embed": "Embed secret message in image (returns base64 encoded image)",
            "/embed-download": "Embed secret message in image (returns downloadable file)",
            "/extract": "Extract secret message from image",
            "/capacity": "Get maximum message capacity of image",
            "/compare": "Compare original and encoded images",
            "/info": "Get module information"
        },
        "embed_parameters": {
            "image": "Image file (multipart/form-data, required)",
            "message": "Secret message to embed (form field, required)"
        },
        "extract_parameters": {
            "image": "Image file containing hidden message (multipart/form-data, required)"
        },
        "capacity_parameters": {
            "image": "Image file (multipart/form-data, required)"
        },
        "compare_parameters": {
            "original": "Original image file (multipart/form-data, required)",
            "encoded": "Encoded image file (multipart/form-data, required)"
        },
        "technical_details": {
            "method": "LSB (Least Significant Bit) steganography",
            "embedding_process": "Modifies the least significant bit of each pixel channel",
            "delimiter": "Uses '###END###' as message delimiter",
            "bits_per_pixel": 3,
            "capacity_formula": "width × height × 3 - delimiter_bits",
            "imperceptible_changes": "Changes are typically invisible to human eye"
        }
    })
