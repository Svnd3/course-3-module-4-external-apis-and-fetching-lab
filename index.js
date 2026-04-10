// index.js
const weatherApi = "https://wttr.in/";

// Your code here!

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("state-input");
  const button = document.getElementById("fetch-alerts");
  const weatherDisplay = document.getElementById("weather-display");
  const errorMessage = document.getElementById("error-message");

  button.addEventListener("click", async () => {
    const city = input.value.trim();
    if (!city) {
      displayError("Please enter a city name.");
      return;
    }

    try {
      const data = await fetchWeatherData(city);
      displayWeather(data);
      input.value = "";
      errorMessage.textContent = "";
      errorMessage.classList.add("hidden");
    } catch (error) {
      displayError(error.message);
    }
  });

  async function fetchWeatherData(city) {
    const response = await fetch(
      `${weatherApi}${encodeURIComponent(city)}?format=j1`,
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch weather data: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  }

  function displayWeather(data) {
    weatherDisplay.innerHTML = "";
    const current = data.current_condition[0];
    const temp = current.temp_C;
    const humidity = current.humidity;
    const description = current.weatherDesc[0].value;

    const weatherInfo = document.createElement("div");
    weatherInfo.innerHTML = `
      <p>Temperature: ${temp}°C</p>
      <p>Humidity: ${humidity}%</p>
      <p>Description: ${description}</p>
    `;
    weatherDisplay.appendChild(weatherInfo);
  }

  function displayError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove("hidden");
  }
});
