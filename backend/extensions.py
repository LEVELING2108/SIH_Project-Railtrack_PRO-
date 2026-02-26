"""
Flask extensions initialization
"""
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow

# Database instance
db = SQLAlchemy()

# Marshmallow for serialization
ma = Marshmallow()
