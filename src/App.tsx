import React, { useState, useEffect, useRef } from 'react';
import { Search, Wind, Droplets, Thermometer, Loader2, Cloud, Sunrise, Sunset, CloudRain, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { searchCities, fetchWeather, GeocodingResult, WeatherData } from './services/weatherApi';
import { getWeatherCondition } from './utils/weatherCodes';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCity, setSelectedCity] = useState<GeocodingResult | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [appInitialized, setAppInitialized] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);

  // Default city on first load
  useEffect(() => {
    const initApp = async () => {
      // Start a minimum duration timer for the intro animation
      const minWait = new Promise(resolve => setTimeout(resolve, 2500));
      
      try {
        const response = await fetch('https://get.geojs.io/v1/ip/geo.json');
        if (!response.ok) throw new Error("IP location failed");
        const data = await response.json();
        
        await handleCitySelect({
          id: 0,
          name: data.city || "Unknown City",
          latitude: parseFloat(data.latitude),
          longitude: parseFloat(data.longitude),
          elevation: 0,
          feature_code: "PPLC",
          country_code: data.country_code || "",
          timezone: data.timezone || "",
          population: 0,
          country: data.country || "",
          admin1: data.region || ""
        });
      } catch (err) {
        console.warn("Failed to get IP location, falling back to London:", err);
        // Fallback to London
        await handleCitySelect({
          id: 2643743,
          name: "London",
          latitude: 51.5085,
          longitude: -0.12574,
          elevation: 25,
          feature_code: "PPLC",
          country_code: "GB",
          timezone: "Europe/London",
          population: 8982000,
          country: "United Kingdom",
          admin1: "England"
        });
      }
      
      // Wait for at least 2.5 seconds before hiding the splash screen
      await minWait;
      setAppInitialized(true);
    };
    initApp();
  }, []);

  // Handle clicking outside of search dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsSearching(true);
        const results = await searchCities(searchQuery);
        setSearchResults(results);
        setIsSearching(false);
        setShowDropdown(true);
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleCitySelect = async (city: GeocodingResult) => {
    setSearchQuery('');
    setShowDropdown(false);
    setSelectedCity(city);
    setIsLoadingWeather(true);
    
    const data = await fetchWeather(city.latitude, city.longitude);
    setWeatherData(data);
    setIsLoadingWeather(false);
  };

  const currentCondition = weatherData 
    ? getWeatherCondition(weatherData.current.weather_code, weatherData.current.is_day)
    : null;
    
  let CurrentIcon = currentCondition?.icon || Cloud;
  if (currentCondition?.nightIcon && weatherData?.current.is_day === 0) {
    CurrentIcon = currentCondition.nightIcon;
  }

  // Determine theme based on time of day (simplistic)
  const isNight = weatherData && weatherData.current.is_day === 0;
  const bgClass = isNight 
    ? "bg-slate-900 text-white" 
    : "bg-blue-50 text-slate-800";
    
  const cardBgClass = isNight 
    ? "bg-slate-800/80 border-slate-700 text-white" 
    : "bg-white/80 border-blue-100 text-slate-800";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col p-6 md:p-10 font-sans overflow-x-hidden">
      <AnimatePresence>
        {!appInitialized && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(10px)" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white"
          >
            <div className="relative flex items-center justify-center w-40 h-40">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
                className="absolute"
              >
                 <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
                 >
                   <Sun className="w-28 h-28 text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.6)]" fill="currentColor" />
                 </motion.div>
              </motion.div>
              
              <motion.div
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
                className="absolute z-10 mr-8 mt-8"
              >
                <motion.div
                  animate={{ y: [-5, 5, -5] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                >
                  <Cloud className="w-24 h-24 text-white drop-shadow-2xl" fill="currentColor" strokeWidth={1} />
                </motion.div>
              </motion.div>
            </div>
            
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.6, duration: 0.6 }}
               className="mt-8 text-center"
            >
              <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4">AdiWeather</h1>
              <div className="flex items-center gap-3 justify-center">
                 <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                 <span className="text-slate-400 uppercase tracking-widest text-xs font-semibold">Predicting the skies</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {appInitialized && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="w-full max-w-5xl mx-auto flex-1 flex flex-col"
        >
        
        {/* Header & Search */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6 w-full relative z-50">
          <div className="flex flex-col">
            <h1 className="text-4xl font-light tracking-tight">
              {selectedCity ? selectedCity.name : 'AdiWeather'}
            </h1>
            <span className="text-slate-400 text-sm tracking-widest uppercase mt-1">
              {selectedCity ? `${selectedCity.admin1 ? selectedCity.admin1 + ', ' : ''}${selectedCity.country}` : 'Weather Forecast'}
            </span>
          </div>
          
          <div className="relative w-full md:w-96 z-[100]" ref={searchRef}>
            <div className="flex items-center w-full px-4 py-3 rounded-full bg-white/10 border border-white/10 text-slate-100 focus-within:border-white/30 focus-within:bg-white/15 transition-all backdrop-blur-md">
              <Search className="w-5 h-5 text-slate-400 mr-2" />
              <input
                type="text"
                className="w-full bg-transparent border-none focus:outline-none placeholder:text-slate-500 text-white"
                placeholder="Search for a city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => { if (searchQuery.length >= 2) setShowDropdown(true) }}
              />
              {isSearching && <Loader2 className="w-5 h-5 animate-spin text-blue-400 ml-2" />}
            </div>
            
            {/* Search Dropdown */}
            <AnimatePresence>
              {showDropdown && searchResults.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute left-0 top-full mt-2 w-full rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] border bg-slate-950 border-slate-700 overflow-hidden z-[100]"
                >
                  <ul className="divide-y divide-slate-800/50">
                    {searchResults.map((city) => (
                      <li key={city.id}>
                        <button
                          className="w-full text-left px-4 py-4 flex items-center hover:bg-slate-800 transition-colors bg-slate-950"
                          onClick={() => handleCitySelect(city)}
                        >
                          <div className="flex flex-col min-w-0 overflow-hidden w-full">
                            <span className="font-medium text-slate-100 truncate">{city.name}</span>
                            <span className="text-sm text-slate-400 truncate">
                              {city.admin1 ? `${city.admin1}, ` : ''}{city.country}
                            </span>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Loading State */}
        {isLoadingWeather && (
          <div className="flex-1 flex justify-center items-center h-64">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          </div>
        )}

        {/* Main Weather Display */}
        <AnimatePresence mode="wait">
          {!isLoadingWeather && weatherData && selectedCity && currentCondition && (
            <motion.div 
              key={selectedCity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="flex-1 flex flex-col gap-6"
            >
              {/* Hero Section: Current Weather */}
              <section className="flex flex-col md:flex-row items-center justify-between bg-gradient-to-br from-blue-600/20 to-indigo-900/40 rounded-[2rem] p-8 md:p-10 border border-white/10 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col relative z-20 w-full md:w-auto mb-6 md:mb-0">
                  <div className="flex items-start">
                    <span className="text-[100px] md:text-[140px] leading-none font-thin -ml-2">
                      {Math.round(weatherData.current.temperature_2m)}
                    </span>
                    <span className="text-3xl md:text-5xl mt-4 md:mt-6 font-light">°C</span>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <p className="text-xl md:text-2xl text-blue-300 font-light italic">
                      {currentCondition.description}
                    </p>
                    <div className="h-1.5 w-1.5 rounded-full bg-slate-500"></div>
                    <p className="text-base md:text-lg text-slate-300">
                      H: {Math.round(weatherData.daily.temperature_2m_max[0])}° L: {Math.round(weatherData.daily.temperature_2m_min[0])}°
                    </p>
                  </div>
                </div>
                <div className="relative z-10 w-full md:w-auto flex justify-center md:block">
                  <CurrentIcon className="w-40 h-40 md:w-48 md:h-48 drop-shadow-3xl text-yellow-400" strokeWidth={1} />
                  <CurrentIcon className="absolute bottom-[-10%] -right-[-10%] w-32 h-32 md:w-40 md:h-40 text-slate-300 opacity-20 hidden md:block" />
                </div>
              </section>

              {/* Sunrise & Sunset */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-[1.5rem] p-6 border border-white/5 flex items-center gap-6">
                  <Sunrise className="w-10 h-10 text-yellow-400" />
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest block mb-1">Sunrise</span>
                    <span className="text-2xl font-light">{new Date(weatherData.daily.sunrise[0]).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                </div>
                <div className="bg-white/5 rounded-[1.5rem] p-6 border border-white/5 flex items-center gap-6">
                  <Sunset className="w-10 h-10 text-orange-400" />
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest block mb-1">Sunset</span>
                    <span className="text-2xl font-light">{new Date(weatherData.daily.sunset[0]).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                </div>
              </div>

              {/* Hourly Forecast */}
              <div className="bg-white/5 rounded-[1.5rem] p-6 border border-white/5">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-6">Next 24 Hours</h3>
                <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory custom-scrollbar">
                  {(() => {
                    if (!weatherData.hourly) return null;
                    const currentTimeMs = Date.now();
                    let closestIndex = 0;
                    let minDiff = Infinity;
                    weatherData.hourly.time.forEach((timeStr, index) => {
                      const t = new Date(timeStr).getTime();
                      const diff = Math.abs(t - currentTimeMs);
                      if (diff < minDiff) {
                        minDiff = diff;
                        closestIndex = index;
                      }
                    });
                    
                    const hourlyForecast = [];
                    for (let i = closestIndex; i <= closestIndex + 24 && i < weatherData.hourly.time.length; i++) {
                      hourlyForecast.push({
                        time: weatherData.hourly.time[i],
                        temp: weatherData.hourly.temperature_2m[i],
                        code: weatherData.hourly.weather_code[i]
                      });
                    }

                    return hourlyForecast.map((hour, index) => {
                      const date = new Date(hour.time);
                      const hourString = date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
                      const condition = getWeatherCondition(hour.code);
                      const Icon = condition.icon;
                      
                      return (
                        <div key={hour.time} className="flex flex-col items-center gap-3 min-w-[4rem] snap-start">
                          <span className="text-slate-400 text-sm whitespace-nowrap">{index === 0 ? 'Now' : hourString}</span>
                          <Icon className={`w-8 h-8 ${index === 0 ? 'text-yellow-400' : 'text-blue-300'}`} strokeWidth={1.5} />
                          <span className="font-medium text-lg">{Math.round(hour.temp)}°</span>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Bottom Grid Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
                
                {/* 7-Day Forecast */}
                <div className="lg:col-span-5 bg-white/5 rounded-[1.5rem] p-6 border border-white/5">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-6">7-Day Forecast</h3>
                  <div className="space-y-4 md:space-y-5">
                    {weatherData.daily.time.map((time, index) => {
                      const date = new Date(time);
                      const isToday = index === 0;
                      const dayName = isToday ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' });
                      const condition = getWeatherCondition(weatherData.daily.weather_code[index]);
                      const Icon = condition.icon;
                      
                      return (
                        <div key={time} className="flex items-center justify-between">
                          <span className="w-16 text-slate-300">{dayName}</span>
                          <div className="flex gap-4 items-center flex-1 justify-center">
                            <Icon className={`w-6 h-6 ${isToday ? 'text-yellow-500' : 'text-blue-400'}`} />
                            <div className="flex items-center text-blue-300 gap-1 w-12 justify-start">
                              {weatherData.daily.precipitation_probability_max?.[index] > 0 && (
                                <>
                                  <CloudRain className="w-3 h-3 text-blue-400" />
                                  <span className="text-xs font-medium">{weatherData.daily.precipitation_probability_max[index]}%</span>
                                </>
                              )}
                            </div>
                          </div>
                          <span className="w-24 text-right font-medium text-lg">
                            {Math.round(weatherData.daily.temperature_2m_max[index])}°
                            <span className="text-slate-500 ml-2">{Math.round(weatherData.daily.temperature_2m_min[index])}°</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Detailed Metrics Grid */}
                <div className="lg:col-span-7 grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-[1.5rem] p-6 border border-white/5 flex flex-col justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Feels like</span>
                    <div className="flex items-end justify-between mt-4">
                      <span className="text-3xl font-light">{Math.round(weatherData.current.apparent_temperature)}<span className="text-sm uppercase text-slate-500 ml-1">°C</span></span>
                      <Thermometer className="w-6 h-6 text-slate-400" />
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-[1.5rem] p-6 border border-white/5 flex flex-col justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Humidity</span>
                    <div className="flex items-end justify-between mt-4">
                      <span className="text-3xl font-light">{weatherData.current.relative_humidity_2m}%</span>
                      <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden mb-2">
                        <div className="h-full bg-blue-500" style={{ width: `${weatherData.current.relative_humidity_2m}%` }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-[1.5rem] p-6 border border-white/5 flex flex-col justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Wind</span>
                    <div className="flex items-end justify-between mt-4">
                      <span className="text-3xl font-light">{weatherData.current.wind_speed_10m} <span className="text-sm uppercase text-slate-500 ml-1">km/h</span></span>
                      <Wind className="w-6 h-6 text-slate-400" />
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-[1.5rem] p-6 border border-white/5 flex flex-col justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Precipitation</span>
                    <div className="flex items-end justify-between mt-4">
                      <span className="text-3xl font-light">{weatherData.current.precipitation} <span className="text-sm uppercase text-slate-500 ml-1">mm</span></span>
                      <Droplets className="w-6 h-6 text-slate-400" />
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        </motion.div>
      )}
    </div>
  );
}
