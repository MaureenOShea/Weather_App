import os
import logging
from flask import Flask, render_template, request, jsonify
from config import DevelopmentConfig
from utils.weather_api import get_weather_and_forecast, WeatherAPIError

logging.basicConfig(level=logging.INFO)

app = Flask(__name__)
app.config.from_object(DevelopmentConfig)

@app.route('/')
def index():
    """Render home page with search form"""
    return render_template('index.html')

@app.route('/weather', methods=['POST'])
def weather():
    """Fetch weather data for a city and return results"""
    # Accept JSON, form-encoded, or query param input
    data = request.get_json(silent=True)
    city = None
    if data and isinstance(data, dict):
        city = data.get('city')
    if not city:
        # Fallback to form data or query string
        city = request.form.get('city') or request.values.get('city')

    if city:
        city = city.strip()

    if not city:
        app.logger.info('Weather request missing city parameter')
        return jsonify({'error': 'Please enter a city name'}), 400

    try:
        weather_data = get_weather_and_forecast(city)
        return jsonify(weather_data)
    except WeatherAPIError as e:
        app.logger.warning('Weather API error for city %s: %s', city, e)
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        app.logger.exception('Unexpected error while fetching weather for %s', city)
        return jsonify({'error': f'An unexpected error occurred: {str(e)}'}), 500

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return render_template('error.html', message='Page not found'), 404

@app.errorhandler(500)
def server_error(error):
    """Handle 500 errors"""
    return render_template('error.html', message='Server error occurred'), 500

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)
