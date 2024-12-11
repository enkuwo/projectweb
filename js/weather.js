const apiKey = '87d72235b5e64e8983843005241012'; //i used weatherapi.com

async function fetchWeather(location) {
  const weatherUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${location}&days=7`;
  try {
    // Fetch weather forecast
    const response = await fetch(weatherUrl);
    const data = await response.json();

    if (!data || !data.forecast) throw new Error('Invalid response from WeatherAPI.');

    updateForecastTable(data.location.name, data.forecast.forecastday);
    renderTemperatureTrend(data.forecast.forecastday);
  } catch (error) {
    console.error('Error fetching weather:', error);
    alert('Could not fetch weather details. Please try again.');
  }
}
document.getElementById('toggleSidebar').addEventListener('click', () => {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');
  
    sidebar.classList.toggle('open');
    mainContent.classList.toggle('sidebar-open');
  });

  function updateForecastTable(location, forecast) {
    document.querySelector('.header h1').textContent = `7-Day Weather Forecast for ${location}`;
    const forecastBody = document.getElementById('forecastBody');
    forecastBody.innerHTML = ''; // Clear previous data
  
    forecast.forEach((day) => {
      const date = day.date;
      const temperature = `${day.day.avgtemp_c} °C`;
      const humidity = `${day.day.avghumidity} %`;
      const description = day.day.condition.text;
      const icon = day.day.condition.icon;
  
      const row = `
        <tr>
          <td>${date}</td>
          <td>${temperature}</td>
          <td>${humidity}</td>
          <td>${description}</td>
          <td><img src="https:${icon}" alt="${description}" title="${description}" /></td>
        </tr>
      `;
      forecastBody.innerHTML += row;
    });
  }
function renderTemperatureTrend(forecast) {
  const dates = forecast.map((day) => day.date);
  const temperatures = forecast.map((day) => day.day.avgtemp_c);

  Highcharts.chart('temperatureTrendChart', {
    chart: { type: 'line' },
    title: { text: 'Temperature Trend for Next 7 Days' },
    xAxis: { categories: dates, title: { text: 'Date' } },
    yAxis: { title: { text: 'Temperature (°C)' } },
    series: [
      {
        name: 'Temperature',
        data: temperatures,
        color: '#FF5722',
      },
    ],
  });
}

document.getElementById('fetchWeatherButton').addEventListener('click', () => {
  const location = document.getElementById('weatherLocation').value;
  fetchWeather(location);
});