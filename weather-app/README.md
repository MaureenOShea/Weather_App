# Flask Weather App

A simple Flask web application that displays current weather for any city. Features include temperature unit toggling (Celsius/Fahrenheit) and weather condition icons.

## Features

- Search weather by city name
- Display current weather conditions (temperature, humidity, wind speed, sunrise, sunset, time of day, conditions)
- Toggle between Celsius and Fahrenheit
- Responsive Bootstrap design
- Error handling for invalid cities
- Weather icons for visual representation

## Prerequisites

- Python 3.8+
- pip or conda

## Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd weather-app
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment:**
   - macOS/Linux:
     ```bash
     source venv/bin/activate
     ```
   - Windows:
     ```bash
     venv\Scripts\activate
     ```

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Get an OpenWeatherMap API key:**
   - Go to [https://openweathermap.org/api](https://openweathermap.org/api)
   - Sign up for a free account
   - Generate an API key from your account dashboard

6. **Set up environment variables:**
   - Edit the `.env` file in the project root
   - Replace `your_api_key_here` with your actual API key:
     ```
     OPENWEATHER_API_KEY=your_actual_api_key_here
     FLASK_ENV=development
     ```

## Running the Application

1. Make sure your virtual environment is activated
2. Run the Flask development server:
   ```bash
   python app.py
   ```
3. Open your browser and navigate to `http://127.0.0.1:5000`

## Project Structure

```
weather-app/
├── app.py                 # Main Flask application and routes
├── config.py             # Configuration settings
├── requirements.txt      # Python dependencies
├── .env                  # Environment variables (API key)
├── .gitignore           # Git ignore file
├── README.md            # This file
├── templates/           # HTML templates
│   ├── base.html       # Base template with navbar
│   ├── index.html      # Home page with search form
│   ├── weather.html    # Weather results page
│   └── error.html      # Error page
├── static/             # Static files
│   ├── style.css       # Custom CSS styling
│   └── script.js       # Client-side JavaScript
└── utils/              # Utility modules
    ├── weather_api.py  # OpenWeatherMap API wrapper
    └── temp_converter.py  # Temperature conversion functions
```

## Usage

1. Enter a city name in the search form
2. Click "Search" to fetch the weather data
3. View current weather 
4. Toggle between Celsius (°C) and Fahrenheit (°F) using the button in the navbar
5. Your temperature preference is saved in your browser

## API Information

This app uses the **OpenWeatherMap API** (free tier):
- Endpoint: `https://api.openweathermap.org/data/2.5`
- Rate limit: 60 calls/minute
- Data refreshed: Every 10 minutes

## Deployment

To deploy to production:

1. Update `config.py` to use `ProductionConfig`
2. Set environment variables on your hosting platform:
   - `OPENWEATHER_API_KEY`
   - `SECRET_KEY` (strong random string)
   - `FLASK_ENV=production`
3. Use a production WSGI server like Gunicorn:
   ```bash
   gunicorn app:app
   ```

## Troubleshooting

**"OPENWEATHER_API_KEY environment variable not set"**
- Ensure your `.env` file exists and has the correct API key

**"City not found" error**
- Check city spelling
- Try using the full city name with country code (e.g., "London, GB")

**Port 5000 already in use**
- Change the port in `app.py`: `app.run(port=5001)`

## License

MIT License

## Contributing

Contributions welcome! Please feel free to submit pull requests.
