import os
import logging
from flask_cors import CORS

class Config:
    """Configuration class for CryptoLearn Flask application"""
    
    # Flask configuration
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'cryptolearn-secret-key-change-in-production'
    DEBUG = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
    
    # File upload configuration
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    UPLOAD_FOLDER = 'static'
    ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp'}
    
    # Cryptography constants
    AES_KEY_SIZES = [128, 192, 256]  # bits
    AES_MODES = ['ECB', 'CBC']
    RSA_KEY_SIZES = [1024, 2048, 3072, 4096]  # bits
    ECC_CURVES = ['secp256r1', 'secp384r1', 'secp521r1']
    
    @staticmethod
    def init_app(app):
        """Initialize Flask app with configuration"""
        # Setup CORS
        CORS(app, origins=['http://localhost:3000', 'http://127.0.0.1:3000'])
        
        # Setup logging
        if not app.debug:
            logging.basicConfig(
                level=logging.INFO,
                format='%(asctime)s %(levelname)s: %(message)s',
                handlers=[
                    logging.FileHandler('cryptolearn.log'),
                    logging.StreamHandler()
                ]
            )
        
        # Create upload directory if it doesn't exist
        upload_path = os.path.join(app.root_path, Config.UPLOAD_FOLDER)
        os.makedirs(upload_path, exist_ok=True)

def allowed_file(filename, allowed_extensions=None):
    """Check if file has allowed extension"""
    if allowed_extensions is None:
        allowed_extensions = Config.ALLOWED_IMAGE_EXTENSIONS
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in allowed_extensions
