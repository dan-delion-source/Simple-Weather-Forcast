const API_BASE_URL = 'https://api.open-meteo.com/v1/forecast';
const GEO_BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';

const WeatherAPI = {
    async getCoordinates(city) {
        try {
            const response = await fetch(`${GEO_BASE_URL}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
            const data = await response.json();
            if (!data.results || data.results.length === 0) {
                throw new Error('City not found');
            }
            return data.results[0];
        } catch (error) {
            console.error('Geocoding error:', error);
            throw error;
        }
    },

    async searchCities(query) {
        if (!query || query.length < 2) return [];
        try {
            const response = await fetch(`${GEO_BASE_URL}?name=${encodeURIComponent(query)}&count=5&language=en&format=json`);
            const data = await response.json();
            return data.results || [];
        } catch (error) {
            console.error('Search error:', error);
            return [];
        }
    },

    async getWeatherData(lat, lon) {
        try {
            const params = new URLSearchParams({
                latitude: lat,
                longitude: lon,
                current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m',
                daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max',
                hourly: 'pm2_5,pm10',
                timezone: 'auto',
                forecast_days: 7
            });

            // Note: Air Quality is a separate endpoint in Open-Meteo
            const weatherPromise = fetch(`${API_BASE_URL}?${params.toString()}`);
            const aqiPromise = fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm2_5,pm10,us_aqi&timezone=auto`);

            const [weatherRes, aqiRes] = await Promise.all([weatherPromise, aqiPromise]);
            const weatherData = await weatherRes.json();
            const aqiData = await aqiRes.json();

            return {
                ...weatherData,
                aqi: aqiData.current
            };
        } catch (error) {
            console.error('Weather data fetch error:', error);
            throw error;
        }
    },

    getWeatherDescription(code) {
        const codes = {
            0: 'Clear sky',
            1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
            45: 'Fog', 48: 'Depositing rime fog',
            51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
            61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
            71: 'Slight snow fall', 73: 'Moderate snow fall', 75: 'Heavy snow fall',
            77: 'Snow grains',
            80: 'Slight rain showers', 81: 'Moderate rain showers', 82: 'Violent rain showers',
            85: 'Slight snow showers', 86: 'Heavy snow showers',
            95: 'Thunderstorm', 96: 'Thunderstorm with slight hail', 99: 'Thunderstorm with heavy hail'
        };
        return codes[code] || 'Unknown';
    }
};

window.WeatherAPI = WeatherAPI;
