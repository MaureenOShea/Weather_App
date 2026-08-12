# Quick Start Guide

## Step 1: Get an OpenWeatherMap API Key

1. Go to https://openweathermap.org/api
2. Click "Sign Up" and create a free account
3. Go to your account dashboard: https://openweathermap.org/api
4. Copy your API key (it may take a few minutes to activate)
5. Open `.env` in your project and replace `your_api_key_here` with your actual key:
   ```
   OPENWEATHER_API_KEY=your_actual_api_key_12345
   FLASK_ENV=development
   ```

## Step 2: Run the Application

From the `weather-app` directory with the virtual environment activated:

```bash
source venv/bin/activate  # macOS/Linux (already done if still in terminal)
python3 app.py
```

You should see:
```
 * Serving Flask app 'app'
 * Debug mode: on
 * Running on http://127.0.0.1:5000
```

## Step 3: Test in Browser

Open http://127.0.0.1:5000 and:
- ✅ Try searching for a city (e.g., "London", "New York", "Tokyo")
- ✅ Click the °C/°F button to toggle temperature units
- ✅ Check that 5-day forecast displays below current weather
- ✅ Try an invalid city name to verify error handling

## Project Structure

```
weather-app/
├── venv/                    # Virtual environment (do not commit)
├── app.py                   # Main Flask app
├── config.py               # Configuration
├── requirements.txt        # Dependencies
├── .env                    # API key (do not commit)
├── .gitignore             # Git ignore rules
├── README.md              # Full documentation
├── templates/
│   ├── base.html          # Base layout
│   ├── index.html         # Search & results
│   └── error.html         # Error page
├── static/
│   ├── style.css          # Styling
│   └── script.js          # Client-side logic
└── utils/
    ├── weather_api.py     # API wrapper
    └── temp_converter.py  # Temperature conversions
```

## Features Implemented

✅ Search weather by city name  
✅ Display current weather (temp, humidity, wind, pressure)  
✅ Show 5-day forecast with icons  
✅ Toggle Celsius/Fahrenheit with localStorage persistence  
✅ Responsive Bootstrap 5 design  
✅ Error handling for invalid cities  
✅ Weather emoji icons for conditions  
✅ Professional gradient styling  

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "OPENWEATHER_API_KEY not set" | Ensure `.env` file has your API key |
| Port 5000 in use | Change `port=5000` to `port=5001` in `app.py` |
| Module not found errors | Ensure virtual environment is activated and dependencies installed |
| Weather not loading | Check API key is valid and rate limit not exceeded |

## Next Steps (Optional Enhancements)

- Add geolocation-based weather detection
- Cache results to reduce API calls
- Add sunrise/sunset times
- Add historical search dropdown
- Dark mode toggle
- Weather alerts/warnings
- Multiple city search
