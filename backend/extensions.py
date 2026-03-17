"""
Flask extensions initialization
"""
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# Database instance
db = SQLAlchemy()

# Marshmallow for serialization
ma = Marshmallow()

# JWT Manager
jwt = JWTManager()

# Rate Limiter
limiter = Limiter(key_func=get_remote_address)
