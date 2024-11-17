// City data: coordinates for cities
const cities = {
  seoul: { lat: 37.5665, lng: 126.9780 },
  busan: { lat: 35.1796, lng: 129.0756 },
  daegu: { lat: 35.8722, lng: 128.6014 },
  jeju: { lat: 33.4996, lng: 126.5312 },
  incheon: { lat: 37.4563, lng: 126.7052 },
};

// OpenWeatherMap API details for air quality and weather
const apiKey = '1a18d33cd3cd61d16370c705b4c7df19'; // Replace with your API key
const baseUrl = 'https://api.openweathermap.org/data/2.5/air_pollution';
const weatherUrl = 'https://api.openweathermap.org/data/2.5/weather';

// Function to fetch AQI and weather data for a city
async function fetchData(lat, lon) {
  try {
    const airQualityResponse = await fetch(`${baseUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}`);
    const airQualityData = await airQualityResponse.json();

    const weatherResponse = await fetch(`${weatherUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
    const weatherData = await weatherResponse.json();

    const aqi = airQualityData.list[0].main.aqi;
    const temperature = weatherData.main.temp;
    const humidity = weatherData.main.humidity;
    const nox = airQualityData.list[0].components.no;
    const nh3 = airQualityData.list[0].components.nh3;
    const so2 = airQualityData.list[0].components.so2;
    const voc = airQualityData.list[0].components.voc;
    const co2 = airQualityData.list[0].components.co;

    return {
      aqi,
      temperature,
      humidity,
      nox,
      nh3,
      so2,
      voc,
      co2,
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return null; // Return null if API call fails
  }
}

// Function to update the UI with the fetched data
function updateUI(data) {
  if (data) {
    // Update AQI card
    document.querySelector('.card-header').textContent = getAQIStatus(data.aqi);

    // Update temperature and humidity
    document.getElementById('temperature').textContent = `${data.temperature} °C`;
    document.getElementById('humidity').textContent = `${data.humidity} %`;

    // Update pollutant levels
    document.getElementById('nox').textContent = `${data.nox} ppb`;
    document.getElementById('nh3').textContent = `${data.nh3} ppb`;
    document.getElementById('so2').textContent = `${data.so2} ppb`;
    document.getElementById('voc').textContent = `${data.voc} ppb`;
    document.getElementById('co2').textContent = `${data.co2} ppm`;

    // Update charts with the new data (Bar and Doughnut charts as an example)
    updateCharts(data);
  }
}

// Function to get AQI status based on the value
function getAQIStatus(aqi) {
  if (aqi === 1) return 'Good';
  if (aqi === 2) return 'Fair';
  if (aqi === 3) return 'Moderate';
  if (aqi === 4) return 'Poor';
  if (aqi === 5) return 'Very Poor';
  return 'N/A';
}

// Function to update the charts with new data
function updateCharts(data) {
  // Update Bar Chart with current pollutant levels
  barChart.data.datasets[0].data = [data.nox, data.nh3, data.so2, data.voc, data.co2];
  barChart.update();

  // Update Doughnut Chart
  doughnutChart.data.datasets[0].data = [data.nox, data.nh3, data.so2, data.voc];
  doughnutChart.update();
}

// Function to handle city change
async function updateCityData(cityKey) {
  const city = cities[cityKey];
  const data = await fetchData(city.lat, city.lng);
  updateUI(data);
  updateMap(cityKey); // Update the map as well
}

// Initialize Map (default view: Seoul)
const map = L.map('map').setView([37.5665, 126.9780], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors',
}).addTo(map);

// Initial marker for Seoul
let marker = L.marker([37.5665, 126.9780]).addTo(map);

// Event listener for dropdown menu
document.getElementById('citySelect').addEventListener('change', (e) => {
  const selectedCity = e.target.value;
  updateCityData(selectedCity);
});

// Initialize with Seoul data
updateCityData('seoul');
// Navigation buttons
document.getElementById('homeButton').addEventListener('click', () => navigateTo('homeSection'));
document.getElementById('dataButton').addEventListener('click', () => navigateTo('dataSection'));
document.getElementById('aboutButton').addEventListener('click', () => navigateTo('aboutSection'));

function navigateTo(sectionId) {
  // Hide all sections
  document.querySelectorAll('main > section').forEach(section => {
    section.classList.remove('active-section');
  });

  // Show selected section
  document.getElementById(sectionId).classList.add('active-section');
}