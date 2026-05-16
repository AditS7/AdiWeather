export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation: number;
  feature_code: string;
  country_code: string;
  admin1_id?: number;
  admin2_id?: number;
  admin3_id?: number;
  timezone: string;
  population: number;
  country: string;
  admin1?: string;
  admin2?: string;
}

export interface WeatherData {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    is_day: number;
    precipitation: number;
    weather_code: number;
    wind_speed_10m: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    sunrise: string[];
    sunset: string[];
    precipitation_probability_max: number[];
  };
}

export const searchCities = async (query: string): Promise<GeocodingResult[]> => {
  if (!query || query.length < 2) return [];
  
  try {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`);
    if (!res.ok) throw new Error('Failed to fetch cities');
    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error('Error searching cities:', error);
    return [];
  }
};

export const fetchWeather = async (lat: number, lon: number): Promise<WeatherData | null> => {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max&timezone=auto`
    );
    if (!res.ok) throw new Error('Failed to fetch weather');
    return await res.json();
  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
};
