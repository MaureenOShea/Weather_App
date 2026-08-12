"""OpenWeatherMap API wrapper"""

import requests
from flask import current_app
from .temp_converter import kelvin_to_celsius, kelvin_to_fahrenheit

class WeatherAPIError(Exception):
    """Custom exception for weather API errors"""
    pass

def get_weather_and_forecast(city):
    """
    Fetch current weather and 5-day forecast for a city.
    
    Args:
        city (str): City name
        
    Returns:
        dict: Weather data with current and forecast information
        
    Raises:
        WeatherAPIError: If API call fails or city not found
    """
    api_key = current_app.config['OPENWEATHER_API_KEY']
    base_url = current_app.config['OPENWEATHER_API_URL']
    
    try:
        # Fetch current weather
        weather_response = requests.get(
            f'{base_url}/weather',
            params={'q': city, 'appid': api_key},
            timeout=5
        )
        
        if weather_response.status_code == 404:
            raise WeatherAPIError(f'City "{city}" not found. Please check the spelling.')
        elif weather_response.status_code != 200:
            raise WeatherAPIError(f'Weather API error: {weather_response.status_code}')
        
        current_weather = weather_response.json()
        
        # Fetch 5-day forecast
        forecast_response = requests.get(
            f'{base_url}/forecast',
            params={'q': city, 'appid': api_key},
            timeout=5
        )
        
        if forecast_response.status_code != 200:
            raise WeatherAPIError(f'Forecast API error: {forecast_response.status_code}')
        
        forecast_data = forecast_response.json()

        # One Call data not used; skip optional One Call fetch
        
        # Process current weather
        current = current_weather['main']
        weather_info = current_weather['weather'][0]

        # process forecast to get daily entries and today's summary (prefer forecast values when available)
        forecast_list, forecast_today = process_forecast(
            forecast_data,
            current_dt=current_weather.get('dt'),
            tz_offset=current_weather.get('timezone', 0)
        )

        # Use forecast-derived today's min/max when available; otherwise fall back to current's fields
        if forecast_today and forecast_today.get('temp_min_k') is not None and forecast_today.get('temp_max_k') is not None:
            today_summary = forecast_today
        else:
            today_summary = {
                'temp_min_k': current.get('temp_min'),
                'temp_min_c': kelvin_to_celsius(current.get('temp_min')) if current.get('temp_min') else None,
                'temp_min_f': kelvin_to_fahrenheit(current.get('temp_min')) if current.get('temp_min') else None,
                'temp_max_k': current.get('temp_max'),
                'temp_max_c': kelvin_to_celsius(current.get('temp_max')) if current.get('temp_max') else None,
                'temp_max_f': kelvin_to_fahrenheit(current.get('temp_max')) if current.get('temp_max') else None,
            }

        result = {
            'city': current_weather['name'],
            'country': current_weather['sys']['country'],
            'current': {
                'temp_k': current['temp'],
                'temp_c': kelvin_to_celsius(current['temp']),
                'temp_f': kelvin_to_fahrenheit(current['temp']),
                'feels_like_k': current['feels_like'],
                'feels_like_c': kelvin_to_celsius(current['feels_like']),
                'feels_like_f': kelvin_to_fahrenheit(current['feels_like']),
                'humidity': current['humidity'],
                'pressure': current['pressure'],
                'wind_speed': current_weather['wind']['speed'],
                'wind_gust': current_weather['wind'].get('gust') if current_weather.get('wind') else None,
                'wind_deg': current_weather['wind'].get('deg') if current_weather.get('wind') else None,
                'description': weather_info['description'],
                'icon': weather_info['icon'],
                'condition': weather_info['main'],
                'dt': current_weather.get('dt'),
                'sunrise': current_weather.get('sys', {}).get('sunrise'),
                'sunset': current_weather.get('sys', {}).get('sunset'),
                'timezone': current_weather.get('timezone', 0),
            },
            'today': today_summary,
            'forecast': forecast_list
        }
        
        return result
        
    except requests.exceptions.Timeout:
        raise WeatherAPIError('Request timed out. Please try again.')
    except requests.exceptions.RequestException as e:
        raise WeatherAPIError(f'Network error: {str(e)}')
    except KeyError as e:
        raise WeatherAPIError(f'Unexpected API response format: {str(e)}')

def process_forecast(forecast_data, current_dt=None, tz_offset=0):
    """
    Process 5-day forecast data.
    
    Args:
        forecast_data (dict): Raw forecast data from API
        
    Returns:
        list: List of 5 daily forecast entries
    """
    # Group items by date and compute min/max for each day
    from collections import defaultdict
    day_items = defaultdict(list)
    for item in forecast_data.get('list', []):
        date = item['dt_txt'].split(' ')[0]
        day_items[date].append(item)

    forecast_list = []
    # compute per-day summary
    for i, (date, items) in enumerate(day_items.items()):
        if i >= 5:
            break
        temps = [it['main']['temp'] for it in items]
        temp_mins = [it['main'].get('temp_min', it['main']['temp']) for it in items]
        temp_maxs = [it['main'].get('temp_max', it['main']['temp']) for it in items]
        # pick representative weather from midday item if possible
        rep = items[len(items)//2]
        weather = rep['weather'][0]

        day_summary = {
            'date': date,
            'temp_k': sum(temps)/len(temps) if temps else None,
            'temp_c': kelvin_to_celsius(sum(temps)/len(temps)) if temps else None,
            'temp_f': kelvin_to_fahrenheit(sum(temps)/len(temps)) if temps else None,
            'temp_min_k': min(temp_mins) if temp_mins else None,
            'temp_min_c': kelvin_to_celsius(min(temp_mins)) if temp_mins else None,
            'temp_min_f': kelvin_to_fahrenheit(min(temp_mins)) if temp_mins else None,
            'temp_max_k': max(temp_maxs) if temp_maxs else None,
            'temp_max_c': kelvin_to_celsius(max(temp_maxs)) if temp_maxs else None,
            'temp_max_f': kelvin_to_fahrenheit(max(temp_maxs)) if temp_maxs else None,
            'humidity': rep['main'].get('humidity'),
            'description': weather['description'],
            'icon': weather['icon'],
            'condition': weather['main'],
        }
        forecast_list.append(day_summary)

    # compute today's summary if current_dt provided
    today_summary = {}
    if current_dt:
        import datetime
        # convert current_dt to date string in UTC, then adjust by tz_offset
        local_ts = current_dt + tz_offset
        today_date = datetime.datetime.utcfromtimestamp(local_ts).strftime('%Y-%m-%d')
        if today_date in day_items:
            items = day_items[today_date]
            temp_mins = [it['main'].get('temp_min', it['main']['temp']) for it in items]
            temp_maxs = [it['main'].get('temp_max', it['main']['temp']) for it in items]
            today_summary = {
                'temp_min_k': min(temp_mins) if temp_mins else None,
                'temp_min_c': kelvin_to_celsius(min(temp_mins)) if temp_mins else None,
                'temp_min_f': kelvin_to_fahrenheit(min(temp_mins)) if temp_mins else None,
                'temp_max_k': max(temp_maxs) if temp_maxs else None,
                'temp_max_c': kelvin_to_celsius(max(temp_maxs)) if temp_maxs else None,
                'temp_max_f': kelvin_to_fahrenheit(max(temp_maxs)) if temp_maxs else None,
            }
    # return forecast list and today's summary
    return forecast_list, today_summary
