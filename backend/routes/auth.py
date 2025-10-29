"""
Authentication Routes
Handles user registration, login, and profile management
"""

from flask import Blueprint, request, jsonify, session
from services.database_service import DatabaseService
from functools import wraps

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


def login_required(f):
    """Decorator to require login for routes"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'success': False, 'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    return decorated_function


@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Register a new user
    
    Expected JSON:
    {
        "username": "john_doe",
        "email": "john@example.com",
        "password": "secure_password",
        "full_name": "John Doe"  // optional
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
        
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        full_name = data.get('full_name')
        
        # Create user
        result, status_code = DatabaseService.create_user(
            username=username,
            email=email,
            password=password,
            full_name=full_name
        )
        
        # If successful, log the user in
        if result.get('success') and 'user' in result:
            session['user_id'] = result['user']['id']
            session['username'] = result['user']['username']
        
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({'success': False, 'error': f'Registration failed: {str(e)}'}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Login user
    
    Expected JSON:
    {
        "username": "john_doe",  // or email
        "password": "secure_password"
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
        
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'success': False, 'error': 'Username and password required'}), 400
        
        # Authenticate user
        result, status_code = DatabaseService.authenticate_user(username, password)
        
        # If successful, create session
        if result.get('success') and 'user' in result:
            session['user_id'] = result['user']['id']
            session['username'] = result['user']['username']
            session.permanent = True  # Session persists after browser close
        
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({'success': False, 'error': f'Login failed: {str(e)}'}), 500


@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    """Logout current user"""
    try:
        session.clear()
        return jsonify({'success': True, 'message': 'Logged out successfully'}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': f'Logout failed: {str(e)}'}), 500


@auth_bp.route('/me', methods=['GET'])
@login_required
def get_current_user():
    """Get current logged-in user details"""
    try:
        user_id = session.get('user_id')
        user = DatabaseService.get_user_by_id(user_id)
        
        if user:
            return jsonify({'success': True, 'user': user}), 200
        else:
            return jsonify({'success': False, 'error': 'User not found'}), 404
            
    except Exception as e:
        return jsonify({'success': False, 'error': f'Failed to get user: {str(e)}'}), 500


@auth_bp.route('/check', methods=['GET'])
def check_auth():
    """Check if user is authenticated"""
    if 'user_id' in session:
        user = DatabaseService.get_user_by_id(session.get('user_id'))
        if user:
            return jsonify({
                'success': True,
                'authenticated': True,
                'user': {
                    'id': user['id'],
                    'username': user['username'],
                    'email': user['email'],
                    'full_name': user['full_name']
                }
            }), 200
    
    return jsonify({'success': True, 'authenticated': False}), 200


@auth_bp.route('/users', methods=['GET'])
@login_required
def get_all_users():
    """Get all users (admin endpoint)"""
    try:
        users = DatabaseService.get_all_users()
        return jsonify({'success': True, 'users': users, 'count': len(users)}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': f'Failed to get users: {str(e)}'}), 500


@auth_bp.route('/info', methods=['GET'])
def info():
    """Get authentication module information"""
    return jsonify({
        'success': True,
        'module': 'Authentication System',
        'features': [
            'User registration with validation',
            'Secure login with SHA-256 password hashing',
            'Session-based authentication',
            'Password salt for enhanced security',
            'SQLite database storage'
        ],
        'endpoints': {
            '/register': 'Register new user account',
            '/login': 'Login with username/email and password',
            '/logout': 'Logout current user',
            '/me': 'Get current user details',
            '/check': 'Check authentication status',
            '/users': 'Get all users (requires auth)',
            '/info': 'Get module information'
        },
        'security': {
            'password_hashing': 'SHA-256 with random salt',
            'salt_length': '32 bytes (64 hex characters)',
            'min_password_length': 6,
            'min_username_length': 3
        }
    }), 200
