# 🌤️ AdiWeather
A modern weather forecasting app with real-time updates and location-based data.

---

## Features

- 📍 Location-based weather detection
- 🔄 Real-time weather updates
- 🌡️ Current temperature, humidity, wind speed, and more
- 📅 Multi-day forecast view
- 🌙 Responsive design for all screen sizes

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/adits7/addyweather.git
   cd myweather
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

> **No API key required!** AddyWeather uses [Open-Meteo](https://open-meteo.com/) and [GeoJS](https://get.geojs.io/) — both are free and open APIs that require no authentication.

---

## Tech Stack

- **Frontend:** React
- **Weather Data:** [Open-Meteo API](https://open-meteo.com/) — free, open-source weather API with no key required
- **Geolocation:** [GeoJS API](https://get.geojs.io/) — IP-based location detection, no key required
- **Styling:** CSS / Tailwind

---

## APIs Used

### 🌦️ Open-Meteo
Provides current weather conditions and multi-day forecasts based on latitude and longitude.

- Docs: [https://open-meteo.com/en/docs](https://open-meteo.com/en/docs)

### 📍 GeoJS
Used to detect the user's approximate location (city, country, coordinates) based on their IP address.

- Docs: [https://get.geojs.io/](https://get.geojs.io/)

---

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

---

## License

[MIT](LICENSE)
