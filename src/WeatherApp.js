import React, { useState, useEffect } from "react";
import "./App.css";

const WeatherApp = () => {
  const [city, setCity] = useState("London");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const weatherCodes = {
    0: { description: "Clear sky", emoji: "☀️" },
    1: { description: "Mainly clear", emoji: "🌤️" },
    2: { description: "Partly cloudy", emoji: "⛅" },
    3: { description: "Overcast", emoji: "☁️" },
    45: { description: "Foggy", emoji: "🌫️" },
    51: { description: "Light drizzle", emoji: "🌧️" },
    53: { description: "Moderate drizzle", emoji: "🌧️" },
    55: { description: "Dense drizzle", emoji: "🌧️" },
    61: { description: "Slight rain", emoji: "🌧️" },
    63: { description: "Moderate rain", emoji: "🌧️" },
    65: { description: "Heavy rain", emoji: "🌧️" },
    71: { description: "Slight snow", emoji: "❄️" },
    73: { description: "Moderate snow", emoji: "❄️" },
    75: { description: "Heavy snow", emoji: "❄️" },
    80: { description: "Rain showers", emoji: "🌧️" },
    82: { description: "Heavy rain showers", emoji: "🌧️" },
    85: { description: "Snow showers", emoji: "🌨️" },
    86: { description: "Heavy snow showers", emoji: "🌨️" },
    95: { description: "Thunderstorm", emoji: "⛈️" },
    96: { description: "Thunderstorm with hail", emoji: "⛈️" },
  };

  const GEOCODING_API = "https://geocoding-api.open-meteo.com/v1/search";
  const WEATHER_API = "https://api.open-meteo.com/v1/forecast";

  const fetchWeather = async (cityName) => {
    if (!cityName.trim()) {
      setError("Please enter a city name.");
      return;
    }

    setLoading(true);
    setError("");
    setWeather(null);

    try {
      const geoRes = await fetch(
        `${GEOCODING_API}?name=${encodeURIComponent(
          cityName
        )}&count=1&language=en&format=json`
      );
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        throw new Error("City not found. Please try another city.");
      }

      const { latitude, longitude, name, country_code } = geoData.results[0];

      const params = new URLSearchParams({
        latitude,
        longitude,
        current:
          "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,cloud_cover,wind_speed_10m",
        timezone: "auto",
      });

      const weatherRes = await fetch(`${WEATHER_API}?${params}`);
      const weatherData = await weatherRes.json();

      const current = weatherData.current;
      const info = weatherCodes[current.weather_code] || {
        description: "Unknown",
        emoji: "❓",
      };

      setWeather({
        city: `${name}${country_code ? ", " + country_code : ""}`,
        temperature: Math.round(current.temperature_2m),
        feelsLike: Math.round(current.apparent_temperature),
        humidity: current.relative_humidity_2m,
        windSpeed: Math.round(current.wind_speed_10m),
        cloudCover: current.cloud_cover,
        description: info.description,
        emoji: info.emoji,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather("London");
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchWeather(city);
  };

  return (
    <div className="weather-app">
      <header>
        <h1>Weather Now</h1>
        <form onSubmit={handleSubmit} className="search-bar">
          <input
            type="text"
            placeholder="Enter city name..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
      </header>

      {loading && (
        <div className="loader">
          <div className="spinner"></div>
          <p>Loading weather data</p>
        </div>
      )}

      {error && <p className="error">{error}</p>}

      {weather && !loading && !error && (
        <main className="weather-card">
          <div className="weather-header">
            <span className="weather-emoji">{weather.emoji}</span>
            <h2>{weather.city}</h2>
          </div>
          <p className="temperature">{weather.temperature}°C</p>
          <p className="description">{weather.description}</p>
          <div className="details">
            <div>
              <strong>Feels like:</strong> {weather.feelsLike}°C
            </div>
            <div>
              <strong>Humidity:</strong> {weather.humidity}%
            </div>
            <div>
              <strong>Wind:</strong> {weather.windSpeed} km/h
            </div>
            <div>
              <strong>Cloud Cover:</strong> {weather.cloudCover}%
            </div>
          </div>
        </main>
      )}
    </div>
  );
};

export default WeatherApp;
