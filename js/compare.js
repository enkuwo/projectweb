const apiKey = '1a18d33cd3cd61d16370c705b4c7df19';
async function fetchLocationData(locationName) {
    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${locationName}&limit=1&appid=${apiKey}`;
    try {
      const response = await fetch(geoUrl);
      const data = await response.json();
      if (data.length === 0) throw new Error('Location not found.');
      return { lat: data[0].lat, lon: data[0].lon };
    } catch (error) {
      console.error(`Error fetching location for ${locationName}:`, error);
      alert(`Could not fetch data for ${locationName}.`);
    }
  }
  document.getElementById('toggleSidebar').addEventListener('click', () => {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');
  
    // Toggle the sidebar and content margin
    sidebar.classList.toggle('open');
    mainContent.classList.toggle('sidebar-open');
  });
  async function fetchAQIAndWeather(lat, lon) {
    const airQualityUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  
    try {
      const [aqiResponse, weatherResponse] = await Promise.all([
        fetch(airQualityUrl),
        fetch(weatherUrl),
      ]);
  
      const aqiData = await aqiResponse.json();
      const weatherData = await weatherResponse.json();
  
      return {
        aqi: aqiData.list[0].main.aqi,
        temperature: weatherData.main.temp,
        humidity: weatherData.main.humidity,
        pollutants: aqiData.list[0].components,
      };
    } catch (error) {
      console.error(`Error fetching AQI or weather for coordinates (${lat}, ${lon}):`, error);
      alert('Failed to fetch AQI or weather data.');
    }
  }
  
  async function compareLocations() {
    const location1 = document.getElementById('location1').value;
    const location2 = document.getElementById('location2').value;
    const location3 = document.getElementById('location3').value;
  
    try {
      const loc1 = await fetchLocationData(location1);
      const loc2 = await fetchLocationData(location2);
      const loc3 = await fetchLocationData(location3);
  
      const [data1, data2, data3] = await Promise.all([
        fetchAQIAndWeather(loc1.lat, loc1.lon),
        fetchAQIAndWeather(loc2.lat, loc2.lon),
        fetchAQIAndWeather(loc3.lat, loc3.lon),
      ]);
  
      renderComparisonCharts(
        [location1, location2, location3],
        [data1, data2, data3]
      );
    } catch (error) {
      console.error('Error comparing locations:', error);
    }
  }
  
  function renderComparisonCharts(locations, data) {
    // AQI Comparison
    Highcharts.chart('aqiComparisonChart', {
      chart: { type: 'column' },
      title: { text: 'Air Quality Comparison' },
      xAxis: { categories: locations },
      yAxis: { title: { text: 'AQI' } },
      series: [{
        name: 'AQI',
        data: data.map(d => d.aqi),
        color: '#FF5722',
      }],
    });
  
    // Temperature Comparison
    Highcharts.chart('temperatureComparisonChart', {
      chart: { type: 'column' },
      title: { text: 'Temperature Comparison (°C)' },
      xAxis: { categories: locations },
      yAxis: { title: { text: 'Temperature (°C)' } },
      series: [{
        name: 'Temperature',
        data: data.map(d => d.temperature),
        color: '#4CAF50',
      }],
    });
  
    // Humidity Comparison
    Highcharts.chart('humidityComparisonChart', {
      chart: { type: 'column' },
      title: { text: 'Humidity Comparison (%)' },
      xAxis: { categories: locations },
      yAxis: { title: { text: 'Humidity (%)' } },
      series: [{
        name: 'Humidity',
        data: data.map(d => d.humidity),
        color: '#2196F3',
      }],
    });
  
    // Pollutant Comparison
    const pollutants = ['no', 'no2', 'so2', 'pm2_5', 'pm10'];
    pollutants.forEach(pollutant => {
      Highcharts.chart('pollutantComparisonChart', {
        chart: { type: 'column' },
        title: { text: 'Pollutants Comparison' },
        xAxis: { categories: locations },
        yAxis: { title: { text: `${pollutant.toUpperCase()} Level (µg/m³)` } },
        series: [{
          name: pollutant.toUpperCase(),
          data: data.map(d => d.pollutants[pollutant]),
          color: '#9C27B0',
        }],
      });
    });
  }
  
  document.getElementById('compareButton').addEventListener('click', compareLocations);