from flask import Flask, jsonify
from flask_cors import CORS
from config.config import Config
import os
import sys

# Add the project root to the Python path
# sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Import all blueprints
from routes.aes import aes_bp
from routes.rsa import rsa_bp
from routes.ecc import ecc_bp
from routes.signature import signature_bp
from routes.steganography import steganography_bp
from routes.watermark import watermark_bp
from routes.layered import layered_bp
from routes.layered_image import layered_image_bp
from routes.auth import auth_bp
from routes.advanced_layered import advanced_layered_bp

def create_app():
    """Create and configure the Flask application"""
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(Config)
    
    # Initialize app with configuration
    Config.init_app(app)
    
    # Enable CORS for all domains on all routes
    CORS(app, origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001"
    ], 
         methods=["GET", "POST", "OPTIONS"],
         allow_headers=["Content-Type", "Authorization"],
         supports_credentials=True)
    
    # Register blueprints
    app.register_blueprint(aes_bp)
    app.register_blueprint(rsa_bp)
    app.register_blueprint(ecc_bp)
    app.register_blueprint(signature_bp)
    app.register_blueprint(steganography_bp)
    app.register_blueprint(watermark_bp)
    app.register_blueprint(layered_bp)
    app.register_blueprint(layered_image_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(advanced_layered_bp)
    
    # Root endpoint
    @app.route('/')
    def home():
        """Root endpoint with API information"""
        return jsonify({
            "message": "Welcome to CryptoLearn API!",
            "version": "1.0.0",
            "description": "A comprehensive cryptography learning platform API",
            "modules": {
                "AES": "/api/aes",
                "RSA": "/api/rsa", 
                "ECC": "/api/ecc",
                "Digital Signatures": "/api/signature",
                "Steganography": "/api/steganography",
                "Watermarking": "/api/watermark",
                "Layered Encryption": "/api/layered",
                "Layered Image": "/api/layered-image",
                "Advanced Layered (5-Layer)": "/api/advanced-layered",
                "Authentication": "/api/auth"
            },
            "endpoints": {
                "/": "API information (this endpoint)",
                "/test": "Test endpoint",
                "/health": "Health check endpoint",
                "/api/*/info": "Get information about specific modules"
            },
            "documentation": {
                "base_url": "http://localhost:5000",
                "content_types": {
                    "cryptography": "application/json",
                    "file_uploads": "multipart/form-data"
                },
                "response_format": {
                    "success": "HTTP 200 with JSON response containing 'success': true",
                    "error": "HTTP 400/500 with JSON response containing 'success': false and 'error' message"
                }
            }
        })
    
    # Test endpoint
    @app.route('/test')
    def test():
        """Test endpoint to verify API is working"""
        return jsonify({
            "message": "Hello from CryptoLearn API!",
            "status": "OK",
            "timestamp": "2025-07-05"
        })
    
    # Health check endpoint
    @app.route('/health')
    def health():
        """Health check endpoint"""
        return jsonify({
            "status": "healthy",
            "message": "CryptoLearn API is running",
            "modules": {
                "AES": "available",
                "RSA": "available",
                "ECC": "available",
                "Digital Signatures": "available",
                "Steganography": "available",
                "Watermarking": "available"
            }
        })
    
    # Global error handlers
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({
            "error": "Bad Request",
            "message": "Invalid request format or missing required parameters",
            "success": False
        }), 400
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            "error": "Not Found",
            "message": "The requested endpoint does not exist",
            "success": False,
            "available_endpoints": {
                "AES": "/api/aes",
                "RSA": "/api/rsa",
                "ECC": "/api/ecc",
                "Digital Signatures": "/api/signature",
                "Steganography": "/api/steganography",
                "Watermarking": "/api/watermark"
            }
        }), 404
    
    @app.errorhandler(413)
    def payload_too_large(error):
        return jsonify({
            "error": "Payload Too Large",
            "message": f"File size exceeds maximum allowed size of {Config.MAX_CONTENT_LENGTH // (1024*1024)}MB",
            "success": False
        }), 413
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            "error": "Internal Server Error",
            "message": "An unexpected error occurred",
            "success": False
        }), 500
    
    return app

if __name__ == '__main__':
    app = create_app()
    
    # Get port from environment variable or default to 5000
    port = int(os.environ.get('PORT', 5000))
    
    # Run the application
    app.run(
        host='127.0.0.1',
        port=port,
        debug=app.config['DEBUG']
    )
