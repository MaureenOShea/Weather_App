import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration"""
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    OPENWEATHER_API_KEY = os.getenv('OPENWEATHER_API_KEY')
    OPENWEATHER_API_URL = 'https://api.openweathermap.org/data/2.5'
    
    if not OPENWEATHER_API_KEY:
        raise ValueError("OPENWEATHER_API_KEY environment variable not set. Please add it to .env file")

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False

class TestingConfig(Config):
    """Testing configuration"""
    DEBUG = True
    TESTING = True
