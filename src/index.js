function formatDate(timestamp) {
  const date = new Date(timestamp * 1000);

  return date.toLocaleString("en-AU", {
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// source:  SC Athena
const { DateTime } = luxon;
let currentTimeZone = null;

function formatCityDateTime(timestamp, tzName) {
  return DateTime.fromSeconds(timestamp).setZone(tzName).toFormat("cccc HH:mm"); // Tuesday 21:05
}

function formatForecastDay(timestamp, tzName) {
  return DateTime.fromSeconds(timestamp).setZone(tzName).toFormat("ccc"); // Tue
}

// Function to get date and time for a specific timezone
function getCityTime(cityTimezone) {
  const localTime = DateTime.now().setZone(cityTimezone);
  return localTime.toString(); // Returns the date and time as a string
}

function getTimeZoneName(lat, lon) {
  const username = "PUT_YOUR_GEONAMES_USERNAME_HERE";
  const url = `https://secure.geonames.org/timezoneJSON?lat=${lat}&lng=${lon}&username=${username}`;
  return axios.get(url).then((res) => res.data.timezoneId);
}

function formatCityDateTime(timestamp, timeZoneName) {
  return luxon.DateTime.fromSeconds(timestamp)
    .setZone(timeZoneName)
    .toFormat("cccc h:mm a");
}

// codes related to weather icons
function forceHttps(url) {
  if (!url) return "";
  return url.replace(/^http:\/\//i, "https://");
}

// get weather forecast for city
function displayWeather(response) {
  document.querySelector("#current_city").innerHTML = response.data.city;

  const lat = response.data.coordinates.latitude;
  const lon = response.data.coordinates.longitude;

  // Always show something immediately (fallback = your local time)
  document.querySelector("#date-time").innerHTML = `${formatDate(
    response.data.time
  )}   local time `;

  // Try to get timezone name and update to city local time
  getTimeZoneName(lat, lon)
    .then((tzName) => {
      currentTimeZone = tzName;
      document.querySelector("#date-time").innerHTML = `${formatCityDateTime(
        response.data.time,
        tzName
      )}   local time`;
    })
    .catch(() => {
      // keep fallback if GeoNames fails
      currentTimeZone = null;
    });

  // condition/humidity/wind/icon/temp
  document.querySelector("#weather_condition").innerHTML =
    capitalizeFirstLetter(response.data.condition.description);

  document.querySelector("#humidity").innerHTML =
    response.data.temperature.humidity;

  document.querySelector("#wind").innerHTML = response.data.wind.speed;

  document
    .querySelector("#weather_icon")
    .setAttribute("src", forceHttps(response.data.condition.icon_url));

  document.querySelector("#current_temperature").innerHTML = Math.round(
    response.data.temperature.current
  );

  getForecast(response.data.coordinates);
}

function getTimeZoneName(lat, lon) {
  const username = "YOUR_GEONAMES_USERNAME";
  const url = `https://secure.geonames.org/timezoneJSON?lat=${lat}&lng=${lon}&username=${username}`;

  return axios.get(url).then((res) => res.data.timezoneId); // e.g. "Australia/Melbourne"
}

// current day forecast function (adjust lat/lon + apiKey)
function getForecast(coordinates) {
  let apiKey = "34t14b5f55afff878dodf0ce647bbe96";
  let apiUrl = `https://api.shecodes.io/weather/v1/forecast?lat=${coordinates.latitude}&lon=${coordinates.longitude}&key=${apiKey}&units=metric`;
  axios.get(apiUrl).then(displayForecast);
}

// search city function
function searchCity(city) {
  let apiKey = "34t14b5f55afff878dodf0ce647bbe96";
  let apiUrl = `https://api.shecodes.io/weather/v1/current?query=${city}&key=${apiKey}&units=metric`;
  axios.get(apiUrl).then(displayWeather);
}

function search(event) {
  event.preventDefault();
  let city = document.querySelector("#search_input").value;
  searchCity(city);
}

// format daily forecast displayed day function
function formatDay(timestamp, timezoneOffsetSeconds = 0) {
  const local = new Date((timestamp + timezoneOffsetSeconds) * 1000);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[local.getUTCDay()];
}

// 7-days weekly forecast function
function displayForecast(response) {
  let forecastDays = response.data.daily;
  let forecastElement = document.querySelector("#forecast");

  let forecastHTML = "";

  forecastDays.slice(0, 7).forEach(function (day) {
    const dayLabel = currentTimeZone
      ? formatForecastDay(day.time, currentTimeZone)
      : formatDayFallback(day.time);

    forecastHTML += `
      <li>
        <span class="forecast-day">${dayLabel}</span>
        <div class="forecast-temps">
          <span class="temp-max">${Math.round(day.temperature.maximum)}°</span>
          <span class="temp-min">${Math.round(day.temperature.minimum)}°</span>
        </div>
        <img class="dayFCst_icon"
          src="${forceHttps(day.condition.icon_url)}"
          alt="${day.condition.description}"
        />
      
      </li>
    `;
  });

  forecastElement.innerHTML = forecastHTML;
}

function formatDayFallback(timestamp) {
  let date = new Date(timestamp * 1000);
  let days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[date.getDay()];
}

function capitalizeFirstLetter(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

let searchForm = document.querySelector("#search_form");
searchForm.addEventListener("submit", search);

// ✅ Load default city with correct timezone time
searchCity("Melbourne");
