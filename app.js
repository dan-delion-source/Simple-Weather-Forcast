document.addEventListener('DOMContentLoaded', () => {
    const bg = new WeatherBackground('weather-bg');
    const input = document.getElementById('location-input');
    const searchBtn = document.getElementById('search-btn');
    const cityName = document.getElementById('city-name');
    const currentTemp = document.getElementById('current-temp');
    const description = document.getElementById('weather-description');
    const humidity = document.getElementById('humidity');
    const windSpeed = document.getElementById('wind-speed');
    const uvIndex = document.getElementById('uv-index');
    const aqiValue = document.getElementById('aqi-value');
    const sunriseTime = document.getElementById('sunrise-time');
    const sunsetTime = document.getElementById('sunset-time');
    const forecastList = document.getElementById('forecast-list');
    const suggestionsBox = document.getElementById('search-suggestions');

    let searchTimeout;

    input.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();

        if (query.length < 2) {
            suggestionsBox.classList.remove('active');
            return;
        }

        searchTimeout = setTimeout(async () => {
            const suggestions = await WeatherAPI.searchCities(query);
            if (suggestions.length > 0) {
                suggestionsBox.innerHTML = '';
                suggestions.forEach(city => {
                    const item = document.createElement('div');
                    item.className = 'suggestion-item';
                    item.innerHTML = `
                        <span class="city-name">${city.name}</span>
                        <span class="country-name">${city.admin1 ? city.admin1 + ', ' : ''}${city.country}</span>
                    `;
                    item.addEventListener('click', () => {
                        input.value = city.name;
                        suggestionsBox.classList.remove('active');
                        updateWeather(city.name);
                    });
                    suggestionsBox.appendChild(item);
                });
                suggestionsBox.classList.add('active');
            } else {
                suggestionsBox.classList.remove('active');
            }
        }, 300);
    });

    // Close suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            suggestionsBox.classList.remove('active');
        }
    });

    async function updateWeather(city) {
        try {
            cityName.textContent = 'Loading...';
            const location = await WeatherAPI.getCoordinates(city);
            const data = await WeatherAPI.getWeatherData(location.latitude, location.longitude);

            // Update Hero
            cityName.textContent = `${location.name}, ${location.country_code.toUpperCase()}`;
            currentTemp.textContent = Math.round(data.current.temperature_2m);
            description.textContent = WeatherAPI.getWeatherDescription(data.current.weather_code);

            // Update Highlights
            humidity.textContent = data.current.relative_humidity_2m;
            windSpeed.textContent = data.current.wind_speed_10m;
            uvIndex.textContent = data.daily.uv_index_max[0];
            aqiValue.textContent = data.aqi.us_aqi;

            const sunrise = new Date(data.daily.sunrise[0]);
            const sunset = new Date(data.daily.sunset[0]);
            sunriseTime.textContent = sunrise.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            sunsetTime.textContent = sunset.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            // Update Background
            const code = data.current.weather_code;
            if (code === 0 || code === 1) bg.setWeather('clear');
            else if (code >= 2 && code <= 3) bg.setWeather('cloudy');
            else if (code >= 51 && code <= 65) bg.setWeather('rain');
            else if (code >= 71 && code <= 86) bg.setWeather('snow');
            else bg.setWeather('cloudy');

            // Update Forecast
            forecastList.innerHTML = '';
            for (let i = 1; i < 6; i++) {
                const date = new Date(data.daily.time[i]);
                const dayName = date.toLocaleDateString([], { weekday: 'short' });
                const tempMax = Math.round(data.daily.temperature_2m_max[i]);
                const tempMin = Math.round(data.daily.temperature_2m_min[i]);
                const desc = WeatherAPI.getWeatherDescription(data.daily.weather_code[i]);

                const card = document.createElement('div');
                card.className = 'forecast-card glass';
                card.innerHTML = `
                    <div class="forecast-day">${dayName}</div>
                    <div class="forecast-temp">${tempMax}° / ${tempMin}°</div>
                    <div class="forecast-desc">${desc}</div>
                `;
                forecastList.appendChild(card);
            }

            lucide.createIcons();
        } catch (error) {
            cityName.textContent = 'City not found';
            console.error(error);
        }
    }

    searchBtn.addEventListener('click', () => {
        if (input.value.trim()) updateWeather(input.value.trim());
    });

    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && input.value.trim()) updateWeather(input.value.trim());
    });

    // Initial weather for a default city or user location
    updateWeather('London');

    // Set current date
    document.getElementById('current-date').textContent = new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
});
