"""
Database Service for User Authentication
Uses SQLite for storing user data with hashed passwords
"""

import sqlite3
import hashlib
import secrets
import os
from datetime import datetime
from typing import Optional, Tuple, Dict, Any


class DatabaseService:
    """Service for managing user database and authentication"""
    
    DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'cryptolearn.db')
    
    @staticmethod
    def init_database():
        """Initialize the database and create users table if it doesn't exist"""
        try:
            db_path_abs = os.path.abspath(DatabaseService.DB_PATH)
            print(f"[DATABASE] Initializing database at: {db_path_abs}")
            
            conn = sqlite3.connect(DatabaseService.DB_PATH)
            cursor = conn.cursor()
            
            # Create users table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    salt TEXT NOT NULL,
                    full_name TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_login TIMESTAMP
                )
            ''')
            
            # Create index on username and email for faster lookups
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_username ON users(username)
            ''')
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_email ON users(email)
            ''')
            
            conn.commit()
            conn.close()
            
            print(f"✓ Database initialized successfully at: {db_path_abs}")
            return True
            
        except Exception as e:
            print(f"✗ Database initialization failed: {str(e)}")
            return False
    
    @staticmethod
    def hash_password(password: str, salt: str = None) -> Tuple[str, str]:
        """
        Hash password using SHA-256 with salt
        
        Args:
            password: Plain text password
            salt: Optional salt (generates new if not provided)
            
        Returns:
            Tuple of (password_hash, salt)
        """
        if salt is None:
            # Generate random 32-byte salt
            salt = secrets.token_hex(32)
        
        # Combine password and salt, then hash with SHA-256
        password_with_salt = (password + salt).encode('utf-8')
        password_hash = hashlib.sha256(password_with_salt).hexdigest()
        
        return password_hash, salt
    
    @staticmethod
    def create_user(username: str, email: str, password: str, full_name: str = None) -> Tuple[Dict[str, Any], int]:
        """
        Create a new user account
        
        Args:
            username: Unique username
            email: Unique email address
            password: Plain text password (will be hashed)
            full_name: Optional full name
            
        Returns:
            Tuple of (result_dict, status_code)
        """
        try:
            print(f"[DATABASE] Creating user: username={username}, email={email}")
            
            # Validate inputs
            if not username or len(username) < 3:
                return {"success": False, "error": "Username must be at least 3 characters"}, 400
            
            if not email or '@' not in email:
                return {"success": False, "error": "Invalid email address"}, 400
            
            if not password or len(password) < 6:
                return {"success": False, "error": "Password must be at least 6 characters"}, 400
            
            # Hash password
            password_hash, salt = DatabaseService.hash_password(password)
            print(f"[DATABASE] Password hashed successfully")
            
            # Insert user into database
            conn = sqlite3.connect(DatabaseService.DB_PATH)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO users (username, email, password_hash, salt, full_name)
                VALUES (?, ?, ?, ?, ?)
            ''', (username.lower(), email.lower(), password_hash, salt, full_name))
            
            user_id = cursor.lastrowid
            conn.commit()
            conn.close()
            
            print(f"[DATABASE] User created successfully with ID: {user_id}")
            
            return {
                "success": True,
                "message": "User created successfully",
                "user": {
                    "id": user_id,
                    "username": username.lower(),
                    "email": email.lower(),
                    "full_name": full_name
                }
            }, 201
            
        except sqlite3.IntegrityError as e:
            print(f"[DATABASE] Integrity error: {str(e)}")
            error_msg = str(e).lower()
            if 'username' in error_msg:
                return {"success": False, "error": "Username already exists"}, 409
            elif 'email' in error_msg:
                return {"success": False, "error": "Email already registered"}, 409
            else:
                return {"success": False, "error": "User already exists"}, 409
                
        except Exception as e:
            print(f"[DATABASE] Error creating user: {str(e)}")
            return {"success": False, "error": f"Registration failed: {str(e)}"}, 500
    
    @staticmethod
    def authenticate_user(username: str, password: str) -> Tuple[Dict[str, Any], int]:
        """
        Authenticate user with username/email and password
        
        Args:
            username: Username or email
            password: Plain text password
            
        Returns:
            Tuple of (result_dict, status_code)
        """
        try:
            print(f"[DATABASE] Authenticating user: {username}")
            
            conn = sqlite3.connect(DatabaseService.DB_PATH)
            cursor = conn.cursor()
            
            # Check if input is email or username
            if '@' in username:
                print(f"[DATABASE] Logging in with email")
                cursor.execute('''
                    SELECT id, username, email, password_hash, salt, full_name
                    FROM users WHERE email = ?
                ''', (username.lower(),))
            else:
                print(f"[DATABASE] Logging in with username")
                cursor.execute('''
                    SELECT id, username, email, password_hash, salt, full_name
                    FROM users WHERE username = ?
                ''', (username.lower(),))
            
            user = cursor.fetchone()
            
            if not user:
                conn.close()
                print(f"[DATABASE] User not found")
                return {"success": False, "error": "Invalid username or password"}, 401
            
            user_id, db_username, email, stored_hash, salt, full_name = user
            print(f"[DATABASE] User found: {db_username}")
            
            # Hash provided password with stored salt
            password_hash, _ = DatabaseService.hash_password(password, salt)
            
            # Compare hashes
            if password_hash != stored_hash:
                conn.close()
                print(f"[DATABASE] Password mismatch")
                return {"success": False, "error": "Invalid username or password"}, 401
            
            print(f"[DATABASE] Password verified successfully")
            
            # Update last login time
            cursor.execute('''
                UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?
            ''', (user_id,))
            conn.commit()
            conn.close()
            
            print(f"[DATABASE] Login successful for user: {db_username}")
            
            return {
                "success": True,
                "message": "Login successful",
                "user": {
                    "id": user_id,
                    "username": db_username,
                    "email": email,
                    "full_name": full_name
                }
            }, 200
            
        except Exception as e:
            print(f"[DATABASE] Authentication error: {str(e)}")
            return {"success": False, "error": f"Authentication failed: {str(e)}"}, 500
    
    @staticmethod
    def get_user_by_id(user_id: int) -> Optional[Dict[str, Any]]:
        """Get user details by ID"""
        try:
            conn = sqlite3.connect(DatabaseService.DB_PATH)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT id, username, email, full_name, created_at, last_login
                FROM users WHERE id = ?
            ''', (user_id,))
            
            user = cursor.fetchone()
            conn.close()
            
            if user:
                return {
                    "id": user[0],
                    "username": user[1],
                    "email": user[2],
                    "full_name": user[3],
                    "created_at": user[4],
                    "last_login": user[5]
                }
            
            return None
            
        except Exception as e:
            print(f"Error getting user: {str(e)}")
            return None
    
    @staticmethod
    def get_all_users() -> list:
        """Get all users (for admin purposes) - excludes password data"""
        try:
            conn = sqlite3.connect(DatabaseService.DB_PATH)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT id, username, email, full_name, created_at, last_login
                FROM users
                ORDER BY created_at DESC
            ''')
            
            users = cursor.fetchall()
            conn.close()
            
            return [
                {
                    "id": user[0],
                    "username": user[1],
                    "email": user[2],
                    "full_name": user[3],
                    "created_at": user[4],
                    "last_login": user[5]
                }
                for user in users
            ]
            
        except Exception as e:
            print(f"Error getting users: {str(e)}")
            return []


# Initialize database when module is imported
DatabaseService.init_database()
