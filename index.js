// index.js
const weatherApi = "https://api.weather.gov/alerts/active?area=";

// Your code here!

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("state-input");
  const button = document.getElementById("fetch-alerts");
  const alertsDisplay = document.getElementById("alerts-display");
  const errorMessage = document.getElementById("error-message");

  button.addEventListener("click", async () => {
    const state = input.value.trim().toUpperCase();
    if (!state) {
      displayError("Please enter a state abbreviation.");
      return;
    }

    try {
      const data = await fetchAlerts(state);
      displayAlerts(data);
      input.value = "";
      errorMessage.textContent = "";
      errorMessage.classList.add("hidden");
    } catch (error) {
      displayError(error.message);
    }
  });

  async function fetchAlerts(state) {
    const response = await fetch(`${weatherApi}${state}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch alerts: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  }

  function displayAlerts(data) {
    alertsDisplay.innerHTML = "";
    const title = data.title;
    const features = data.features || [];
    const summary = document.createElement("p");
    summary.textContent = `${title}: ${features.length}`;
    alertsDisplay.appendChild(summary);

    features.forEach((feature) => {
      const headline = document.createElement("p");
      headline.textContent = feature.properties.headline;
      alertsDisplay.appendChild(headline);
    });
  }

  function displayError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove("hidden");
  }
});
