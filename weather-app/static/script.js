/**
 * Weather Condition to Icon Mapping
 * Maps OpenWeatherMap condition codes to emoji icons
 */
const weatherIcons = {
    // Clear sky
    '01d': '☀️',  // clear sky day
    '01n': '🌙',  // clear sky night
    
    // Clouds
    '02d': '⛅',  // few clouds day
    '02n': '☁️',  // few clouds night
    '03d': '☁️',  // scattered clouds day
    '03n': '☁️',  // scattered clouds night
    '04d': '☁️',  // broken clouds day
    '04n': '☁️',  // broken clouds night
    
    // Drizzle
    '09d': '🌧️',  // shower rain day
    '09n': '🌧️',  // shower rain night
    '10d': '🌦️',  // rain day
    '10n': '🌧️',  // rain night
    
    // Thunderstorm
    '11d': '⛈️',  // thunderstorm day
    '11n': '⛈️',  // thunderstorm night
    
    // Snow
    '13d': '❄️',  // snow day
    '13n': '❄️',  // snow night
    
    // Mist/Fog
    '50d': '🌫️',  // mist day
    '50n': '🌫️',  // mist night
};

/**
 * Get weather icon based on condition code
 */
function getWeatherIcon(iconCode) {
    return weatherIcons[iconCode] || '🌤️';
}

/**
 * Format an epoch (seconds) into local time for the city using tzOffset (seconds)
 * Returns a 12-hour formatted string like '6:23 AM'
 */
function formatLocalTimeFromEpoch(epochSeconds, tzOffset) {
    if (!epochSeconds) return '—';
    const utcDate = new Date(epochSeconds * 1000);
    const offsetSeconds = tzOffset || 0;
    const offsetHours = Math.floor(offsetSeconds / 3600);
    const offsetMinutes = Math.floor((offsetSeconds % 3600) / 60);

    let localHours = utcDate.getUTCHours() + offsetHours;
    let localMinutes = utcDate.getUTCMinutes() + offsetMinutes;

    if (localMinutes >= 60) {
        localHours += Math.floor(localMinutes / 60);
        localMinutes = localMinutes % 60;
    } else if (localMinutes < 0) {
        localHours -= Math.ceil(Math.abs(localMinutes) / 60);
        localMinutes = (localMinutes % 60 + 60) % 60;
    }

    if (localHours >= 24) {
        localHours = localHours % 24;
    } else if (localHours < 0) {
        localHours = (localHours % 24 + 24) % 24;
    }

    const period = localHours >= 12 ? 'PM' : 'AM';
    let displayHour = localHours % 12;
    if (displayHour === 0) displayHour = 12;
    const minuteStr = String(localMinutes).padStart(2, '0');
    return `${displayHour}:${minuteStr} ${period}`;
}

/**
 * Convert wind degrees to a cardinal direction string (16-point compass)
 */
function degreesToCardinal(deg) {
    if (deg === null || deg === undefined) return '—';
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.floor(((deg + 11.25) % 360) / 22.5);
    return directions[index];
}

/**
 * Convert meters/sec to miles/hour, rounded to 1 decimal place
 */
function mpsToMph(mps) {
    if (mps === null || mps === undefined) return null;
    const mph = mps * 2.2369362920544;
    return Math.round(mph * 10) / 10;
}

/**
 * Toggle temperature unit between Celsius and Fahrenheit
 */
function toggleTemperatureUnit() {
    let currentUnit = localStorage.getItem('tempUnit') || 'F';
    let newUnit = currentUnit === 'C' ? 'F' : 'C';
    localStorage.setItem('tempUnit', newUnit);
    updateTempToggleButton(newUnit);
    
    // Refresh weather display if available
    const weatherResults = document.getElementById('weatherResults');
    if (weatherResults.innerHTML.trim() !== '') {
        // Re-display current weather with new unit
        displayWeatherResults(window.lastWeatherData, newUnit);
    }
}

/**
 * Update temperature toggle button text
 */
function updateTempToggleButton(unit) {
    const btn = document.getElementById('tempToggle');
    if (btn) {
        btn.textContent = unit === 'C' ? '°F' : '°C';
        btn.title = `Switch to ${unit === 'C' ? 'Fahrenheit' : 'Celsius'}`;
    }
}

/**
 * Get temperature value based on user preference
 */
function getTemperature(data, unit) {
    unit = unit || localStorage.getItem('tempUnit') || 'F';
    return unit === 'C' ? data.temp_c : data.temp_f;
}

/**
 * Get temperature symbol
 */
function getTempSymbol() {
    const unit = localStorage.getItem('tempUnit') || 'F';
    return unit === 'C' ? '°C' : '°F';
}

/**
 * Search for weather by city name
 */
function searchWeather(event) {
    event.preventDefault();
    
    const city = document.getElementById('cityInput').value.trim();
    const errorAlert = document.getElementById('errorAlert');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const weatherResults = document.getElementById('weatherResults');
    
    // Reset UI
    errorAlert.classList.add('hide');
    loadingSpinner.classList.remove('hide');
    weatherResults.innerHTML = '';
    
    if (!city) {
        showError('Please enter a city name');
        loadingSpinner.classList.add('hide');
        return;
    }
    
    // Fetch weather data
    fetch('/weather', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ city: city })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.error || 'Failed to fetch weather data');
            });
        }
        return response.json();
    })
    .then(data => {
        loadingSpinner.classList.add('hide');
        // Save city to localStorage for next time
        localStorage.setItem('lastCity', city);
        window.lastWeatherData = data;
        displayWeatherResults(data);
    })
    .catch(error => {
        loadingSpinner.classList.add('hide');
        showError(error.message || 'An error occurred while fetching weather data');
    });
}

/**
 * Display weather results
 */
function displayWeatherResults(data, unit) {
    unit = unit || localStorage.getItem('tempUnit') || 'F';
    const weatherResults = document.getElementById('weatherResults');
    const tempSymbol = getTempSymbol();
    const current = data.current;

    // compute local time using dt + timezone (both seconds) and format as AM/PM
    let localTimeStr = '';
    if (current && current.dt) {
        const utcDate = new Date(current.dt * 1000);
        const offsetSeconds = current.timezone || 0;
        const offsetHours = Math.floor(offsetSeconds / 3600);
        const offsetMinutes = Math.floor((offsetSeconds % 3600) / 60);

        let localHours = utcDate.getUTCHours() + offsetHours;
        let localMinutes = utcDate.getUTCMinutes() + offsetMinutes;

        // Handle minute overflow
        if (localMinutes >= 60) {
            localHours += Math.floor(localMinutes / 60);
            localMinutes = localMinutes % 60;
        } else if (localMinutes < 0) {
            localHours -= Math.ceil(Math.abs(localMinutes) / 60);
            localMinutes = (localMinutes % 60 + 60) % 60;
        }

        // Handle hour overflow
        if (localHours >= 24) {
            localHours = localHours % 24;
        } else if (localHours < 0) {
            localHours = (localHours % 24 + 24) % 24;
        }

        // Convert to 12-hour format with AM/PM
        const period = localHours >= 12 ? 'PM' : 'AM';
        let displayHour = localHours % 12;
        if (displayHour === 0) displayHour = 12;
        const minuteStr = String(localMinutes).padStart(2, '0');
        localTimeStr = `${displayHour}:${minuteStr} ${period}`;
    }

    // Sunrise & Sunset formatting
    const sunriseStr = current && current.sunrise ? formatLocalTimeFromEpoch(current.sunrise, current.timezone) : '—';
    const sunsetStr = current && current.sunset ? formatLocalTimeFromEpoch(current.sunset, current.timezone) : '—';

    // (High/Low removed from UI)

    // Build current weather HTML with requested icons
    let html = `
        <div class="weather-card">
            <div class="weather-main">
                <div>
                    <div class="weather-item-value">${data.city}, ${data.country}</div>
                    <div class="weather-item-label">Location</div>
                    <div style="font-size: 2.5rem; margin: 15px 0;">
                        ${getTemperature(current, unit)}${tempSymbol}
                    <div class="weather-icon">${getWeatherIcon(current.icon)}</div>
                    <div class="weather-description">${current.description}</div>
                    </div>
                </div>
                <div>
                    <div class="weather-item">
                        <div>
                            <span class="weather-item-value">${localTimeStr}</span>
                            <span class="weather-item-label">Local Time</span>
                        </div>
                    </div>
                    <div class="weather-item sun-box">
                        <div style="display:flex;gap:18px;align-items:center;">
                            <div style="text-align:center;min-width:80px;">
                                <div class="weather-item-value">🌅 ${sunriseStr}</div>
                                <div class="weather-item-label">Sunrise</div>
                            </div>
                            <div style="text-align:center;min-width:80px;">
                                <div class="weather-item-value">🌇 ${sunsetStr}</div>
                                <div class="weather-item-label">Sunset</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="weather-details">
                <div class="weather-detail wind-box">
                    <div style="display:flex;align-items:center;gap:12px;">
                        <div style="display:flex;flex-direction:column;align-items:flex-start;">
                            <span class="detail-value">🌬️</span>
                            <div style="font-weight:900;">Wind</div>
                            <div style="font-size:0.95rem;margin-top:6px;">
                                Speed: ${mpsToMph(current.wind_speed) !== null ? mpsToMph(current.wind_speed) + ' mph' : '—'}
                            </div>
                            <div style="font-size:0.95rem;">
                                Gust: ${mpsToMph(current.wind_gust) !== null ? mpsToMph(current.wind_gust) + ' mph' : '—'}
                            </div>
                            <div style="font-size:0.95rem;">
                                Dir: ${current.wind_deg !== null && current.wind_deg !== undefined ? degreesToCardinal(current.wind_deg) + ' (' + current.wind_deg + "°)" : '—'}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Today's High/Low intentionally removed -->
                <div class="weather-detail">
                    <span class="detail-value">${getWeatherIcon(current.icon)}</span>
                    <span class="detail-value">${current.condition}</span>
                    <span class="detail-label">Condition</span>
                </div>
                <div class="weather-detail">
                    <span class="detail-value">💧</span>
                    <span class="detail-value">${current.humidity}%</span>
                    <span class="detail-label">Humidity</span>
                </div>
                
            </div>
    `;
    
    // Forecast intentionally omitted from UI
    
    html += `</div>`;
    weatherResults.innerHTML = html;
}

/**
 * Show error message
 */
function showError(message) {
    const errorAlert = document.getElementById('errorAlert');
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorAlert.classList.remove('hide');
}

/**
 * Initialize temperature unit and restore last city on page load
 */
document.addEventListener('DOMContentLoaded', function() {
    const tempUnit = localStorage.getItem('tempUnit') || 'F';
    updateTempToggleButton(tempUnit);
    
    // Restore last city if available
    const lastCity = localStorage.getItem('lastCity');
    if (lastCity) {
        document.getElementById('cityInput').value = lastCity;
    }
});
