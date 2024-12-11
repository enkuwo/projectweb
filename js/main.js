
const apiKey = '1a18d33cd3cd61d16370c705b4c7df19';
const baseUrl = 'https://api.openweathermap.org/data/2.5/air_pollution';
const weatherUrl = 'https://api.openweathermap.org/data/2.5/weather';
const reverseGeocodeUrl = 'https://api.openweathermap.org/geo/1.0/reverse';
// Initialize the map (default view: Seoul)
const map = L.map('map').setView([37.5665, 126.9780], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors',
}).addTo(map);

// Add a draggable marker
let marker = L.marker([37.5665, 126.9780], { draggable: true }).addTo(map);
let selectedLat = 37.5665;
let selectedLon = 126.9780;

// Update coordinates when marker is dragged
marker.on('moveend', (e) => {
  const { lat, lng } = e.target.getLatLng();
  selectedLat = lat;
  selectedLon = lng;
  console.log(`Marker moved to: ${selectedLat}, ${selectedLon}`);
});

// Fetch city name using reverse geocoding
async function fetchCityName(lat, lon) {
  try {
    const response = await fetch(`${reverseGeocodeUrl}?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`);
    const data = await response.json();

    if (data && data[0] && data[0].name) {
      return data[0].name;
    } else {
      return 'Unknown';
    }
  } catch (error) {
    console.error('Error fetching city name:', error);
    return 'Unknown';
  }
}
document.getElementById('toggleSidebar').addEventListener('click', () => {
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.querySelector('.main-content');

  // Toggle the sidebar and content margin
  sidebar.classList.toggle('open');
  mainContent.classList.toggle('sidebar-open');
});


// Fetch air quality and weather data
async function fetchData(lat, lon) {
  try {
    const [airQualityResponse, weatherResponse] = await Promise.all([
      fetch(`${baseUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}`),
      fetch(`${weatherUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
    ]);

    const airQualityData = await airQualityResponse.json();
    const weatherData = await weatherResponse.json();

    return {
      aqi: airQualityData.list[0].main.aqi,
      temperature: weatherData.main.temp,
      humidity: weatherData.main.humidity,
      nox: airQualityData.list[0].components.no,
      nh3: airQualityData.list[0].components.nh3,
      so2: airQualityData.list[0].components.so2,
      voc: airQualityData.list[0].components.voc || 0, // VOC may not always be available
      co2: airQualityData.list[0].components.co
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    alert('Failed to fetch data. Please try again later.');
    return null;
  }
}
// Handle city selection from suggestions
document.getElementById('suggestions').addEventListener('click', async (e) => {
  if (e.target.tagName === 'LI') {
    const lat = parseFloat(e.target.dataset.lat);
    const lon = parseFloat(e.target.dataset.lon);

    selectedLat = lat;
    selectedLon = lon;
    marker.setLatLng([selectedLat, selectedLon]); // Update marker position
    map.setView([selectedLat, selectedLon], 12); // Center map on the selected city

    await updateCityName(selectedLat, selectedLon); // Update city name
    document.getElementById('suggestions').innerHTML = ''; // Clear suggestions
  }
});
// Update the UI with fetched data
function updateUI(data) {
  if (data) {
    const aqiElement = document.getElementById('aqi-status');
    aqiElement.textContent = getAQIStatus(data.aqi);
    aqiElement.className = '';
    if (data.aqi <= 2) aqiElement.classList.add('good');
    else if (data.aqi === 3) aqiElement.classList.add('moderate');
    else aqiElement.classList.add('unhealthy');

    document.getElementById('aqi-value').textContent = data.aqi;
    document.getElementById('temperature').textContent = `${data.temperature} °C`;
    document.getElementById('humidity').textContent = `${data.humidity} %`;
    document.getElementById('nox').textContent = `${data.nox || 0} ppb`;
    document.getElementById('nh3').textContent = `${data.nh3 || 0} ppb`;
    document.getElementById('so2').textContent = `${data.so2 || 0} ppb`;
    document.getElementById('voc').textContent = `${data.voc || 0} ppb`;
    document.getElementById('co2').textContent = `${data.co2 || 0} ppm`;

    updateCharts(data);
  } else {
    document.getElementById('aqi-status').textContent = 'Error fetching data';
  }
}

// Get AQI status based on value
function getAQIStatus(aqi) {
  const statuses = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
  return statuses[aqi - 1] || 'N/A';
}

// Initialize charts
const barChart = new Chart(document.getElementById('barChart').getContext('2d'), {
  type: 'bar',
  data: {
    labels: ['NOx', 'NH3', 'SO2', 'VOC', 'CO2'],
    datasets: [{
      label: 'Pollutants Level (ppb/ppm)',
      data: [0, 0, 0, 0, 0],
      backgroundColor: ['#4CAF50', '#FFEB3B', '#F44336', '#2196F3', '#9C27B0'],
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: { beginAtZero: true }
    }
  }
});

const doughnutChart = new Chart(document.getElementById('doughnutChart').getContext('2d'), {
  type: 'doughnut',
  data: {
    labels: ['NOx', 'NH3', 'SO2', 'VOC'],
    datasets: [{
      label: 'Pollutants Contribution',
      data: [0, 0, 0, 0],
      backgroundColor: ['#4CAF50', '#FFEB3B', '#F44336', '#2196F3'],
    }]
  },
  options: { responsive: true }
});

// Update charts with new data
function updateCharts(data) {
  barChart.data.datasets[0].data = [data.nox, data.nh3, data.so2, data.voc, data.co2];
  barChart.update();

  doughnutChart.data.datasets[0].data = [data.nox, data.nh3, data.so2, data.voc];
  doughnutChart.update();
}

// Handle "Choose Location" button click
document.getElementById('chooseButton').addEventListener('click', async () => {
  try {
    // Fetch air quality data for the selected location
    const data = await fetchData(selectedLat, selectedLon);
    
    // Update the UI with fetched data
    updateUI(data);
    updateTimeSeriesChart(selectedLat, selectedLon);
    // Fetch the city name using reverse geocoding
    const cityName = await fetchCityName(selectedLat, selectedLon);
    
    // Update the selected city display
    document.getElementById('selectedCity').textContent = `City: ${cityName}`;
  } catch (error) {
    console.error('Error fetching data for the selected location:', error);
    alert('Could not fetch data for the selected location. Please try again.');
  }
});

// Search for cities dynamically
const citySearch = document.getElementById('citySearch');
const suggestions = document.getElementById('suggestions');

citySearch.addEventListener('input', async (e) => {
  const query = e.target.value.trim();
  if (query.length < 3) {
    suggestions.innerHTML = '';
    return;
  }

  try {
    const response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`);
    const cities = await response.json();

    suggestions.innerHTML = cities
      .map(city => `<li data-lat="${city.lat}" data-lon="${city.lon}">${city.name}, ${city.country}</li>`)
      .join('');
  } catch (error) {
    console.error('Error fetching city suggestions:', error);
  }
});

// Handle city selection from suggestions
suggestions.addEventListener('click', (e) => {
  if (e.target.tagName === 'LI') {
    const lat = e.target.dataset.lat;
    const lon = e.target.dataset.lon;
    const cityName = e.target.textContent;

    selectedLat = parseFloat(lat);
    selectedLon = parseFloat(lon);
    marker.setLatLng([selectedLat, selectedLon]); // Update marker position
    map.setView([selectedLat, selectedLon], 12); // Center map on the selected city

    citySearch.value = cityName; // Update search box
    suggestions.innerHTML = ''; // Clear suggestions
  }
});
function generateTimeSeriesData(baseAQI) {
  const timestamps = [];
  const aqiValues = [];
  const currentHour = new Date().getHours();

  for (let i = 0; i < 24; i++) {
      timestamps.push(`${(currentHour + i) % 24}:00`);
      aqiValues.push(baseAQI + Math.floor(Math.random() * 20 - 10)); // Random fluctuations
  }

  return { timestamps, aqiValues };
}

function renderTimeSeriesChart(data) {
  Highcharts.chart('timeSeriesChart', {
      chart: { type: 'line', zoomType: 'x' },
      title: { text: 'Air Quality Trends Over 24 Hours' },
      xAxis: { categories: data.timestamps, title: { text: 'Time' } },
      yAxis: { title: { text: 'AQI' } },
      series: [{
          name: 'AQI',
          data: data.aqiValues,
          color: '#4CAF50',
      }]
  });
}

async function updateTimeSeriesChart(lat, lon) {
  try {
    const data = await fetchData(lat, lon);
    const baseAQI = data.aqi;

    // Simulating hourly AQI data for demonstration
    const timestamps = [];
    const aqiValues = [];
    for (let i = 0; i < 24; i++) {
      const hour = new Date().getHours() + i;
      timestamps.push(`${hour % 24}:00`);
      aqiValues.push(baseAQI + Math.floor(Math.random() * 10 - 5)); // Random fluctuation
    }

    renderTimeSeriesChart({ timestamps, aqiValues });
  } catch (error) {
    console.error("Error updating time-series chart:", error);
  }
}
async function fetchComparisonData(locations) {
  const promises = locations.map(async loc => {
      const data = await fetchData(loc.lat, loc.lon);
      return { name: loc.name, aqi: data.aqi };
  });

  return Promise.all(promises);
}

