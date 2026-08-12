"""Temperature conversion utilities"""

def kelvin_to_celsius(kelvin):
    """Convert Kelvin to Celsius"""
    return round(kelvin - 273.15, 1)

def kelvin_to_fahrenheit(kelvin):
    """Convert Kelvin to Fahrenheit"""
    celsius = kelvin_to_celsius(kelvin)
    return round((celsius * 9/5) + 32, 1)

def celsius_to_fahrenheit(celsius):
    """Convert Celsius to Fahrenheit"""
    return round((celsius * 9/5) + 32, 1)

def fahrenheit_to_celsius(fahrenheit):
    """Convert Fahrenheit to Celsius"""
    return round((fahrenheit - 32) * 5/9, 1)
