//? configuration API
const API_KEY = "892269c32191d36296f4b66dfa3e66ad";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

//? Elements DOM
const cityInput = document.querySelector("#city-input");
const searchBtn = document.querySelector("#search-btn");
const locationBtn = document.querySelector("#location-btn");
const errorMessage = document.querySelector("#error-message");
const loading = document.querySelector("#loading");
const currentWeather = document.querySelector("#current-weather");
const forecast = document.querySelector("#forecast");
const headPage = document.querySelector("#head-box");

//? fonctions utilitaire
const showLoading = () => {
  loading.style.display = "block";
  currentWeather.style.display = "none";
  forecast.style.display = "none";
};

const hideLoading = () => {
  loading.style.display = "none";
};

const showError = (message) => {
  errorMessage.textContent = message;
  errorMessage.style.display = "block";
  hideLoading();
};

const hideError = () => {
  errorMessage.style.display = "none";
};

//? Fonction pour récupérer les données meteo par coordonnées
async function getWeatherByCoords(lat, lon) {
  try {
    showLoading();
    hideLoading();

    const currentResponse = await fetch(
      `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=fr`
    );

    if (!currentResponse.ok) {
      throw new Error("Erreur lors de la récupération des données");
    }

    const currentData = await currentResponse.json();

    const forecastResponse = await fetch(
      `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=fr`
    );

    const forecastData = await forecastResponse.json();

    displayWeather(currentData, forecastData); // Pas encore declaré
  } catch (error) {
    showError("Ville non trouvée ou erreur de connexion");
    console.error(error);
  }
}

// Fonction pour récupérer les données météo par nom de ville
async function getWeatherByCity(cityName) {
  try {
    showLoading();
    hideError();

    const currentResponse = await fetch(
      `${BASE_URL}/weather?q=${cityName}&appid=${API_KEY}&units=metric&lang=fr`
    );

    if (!currentResponse.ok) {
      throw new Error("Ville non trouvée");
    }

    const currentData = await currentResponse.json();

    const forecastResponse = await fetch(
      `${BASE_URL}/forecast?q=${cityName}&appid=${API_KEY}&units=metric&lang=fr`
    );

    const forecastData = await forecastResponse.json();

    displayWeather(currentData, forecastData);
  } catch (error) {
    showError("Ville non trouvée ou erreur de connexion");
    console.error(error);
  }
}

//? Fonction pour afficher les donneés meteo
async function displayWeather(currentData, forecastData) {
  hideLoading();

  // Affichage meteo actuelle
  document.querySelector("#city-name").textContent = currentData.name;
  document.querySelector("#temperature").textContent = `${Math.round(
    currentData.main.temp
  )} °C`;
  document.querySelector("#description").textContent =
    currentData.weather[0].description;
  document.querySelector(
    "#humidity"
  ).textContent = `Humidité : ${currentData.main.humidity} %`;
  document.querySelector(
    "#wind-speed"
  ).textContent = `Vent: ${currentData.wind.speed} m/s`;

  currentWeather.style.display = "block";
  headPage.style.display = "none"; //cacher le header

  // Affichage prévisions (prendre 1 prévision par jour)
  const dailyForecasts = [];
  const today = new Date().getDate();

  forecastData.list.forEach((item) => {
    const forecastDate = new Date(item.dt * 1000);
    const forecastDay = forecastDate.getDate();

    // Prendre la prévision de midi pour chaque jour différent
    if (forecastDay !== today && forecastDate.getHours() === 12) {
      dailyForecasts.push(item);
    }
  });

  // Limiter à 5 jours
  const next5Days = dailyForecasts.slice(0, 5);

  const forecastHTML = next5Days
    .map((day) => {
      const date = new Date(day.dt * 1000);
      const dayName = date.toLocaleDateString("fr-FR", { weekday: "long" });

      return `
            <div>
                <strong>${dayName}</strong><br>
                ${Math.round(day.main.temp)}°C<br>
                ${day.weather[0].description}
            </div>
        `;
    })
    .join("");

  document.getElementById("forecast-list").innerHTML = forecastHTML;
  forecast.style.display = "block";
}

// Fonction pour obtenir la géolocalisation
function getCurrentLocation() {
  if (navigator.geolocation) {
    showLoading();
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        getWeatherByCoords(lat, lon);
      },
      (error) => {
        showError("Impossible d'obtenir votre position");
        console.error(error);
      }
    );
  } else {
    showError("Géolocalisation non supportée par votre navigateur");
  }
}

// Événements
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) {
    getWeatherByCity(city);
  }
});

cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const city = cityInput.value.trim();
    if (city) {
      getWeatherByCity(city);
    }
  }
});

locationBtn.addEventListener("click", getCurrentLocation);

// Message d'information pour la clé API
if (API_KEY === "") {
  showError("Veuillez ajouter votre clé API OpenWeatherMap dans le code");
}
