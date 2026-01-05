// source:  SC Athena
const { DateTime } = luxon;
let currentTimeZone = null;

//(9)
function capitalizeFirstLetter(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

//(6)
function formatDate(timestamp) {
  const date = new Date(timestamp * 1000);

  return date.toLocaleString("en-AU", {
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

//(8) format output for current day forecast day, e.g. Tuesday 21:05
function formatCityDateTime(timestamp, tzName) {
  return DateTime.fromSeconds(timestamp).setZone(tzName).toFormat("cccc HH:mm");
}

//(13) format output for daily forecast day, e.g. Tue
function formatForecastDay(timestamp, tzName) {
  return DateTime.fromSeconds(timestamp).setZone(tzName).toFormat("ccc");
}

// function to get date and time for a specific city timezone
function getCityTime(cityTimezone) {
  const localTime = DateTime.now().setZone(cityTimezone);
  return localTime.toString(); // Returns the date and time as a string
}

//(7)
function getTimeZoneName(lat, lon) {
  const username = "jcc4sc";
  const url = `https://secure.geonames.org/timezoneJSON?lat=${lat}&lng=${lon}&username=${username}`;

  return axios.get(url).then((res) => res.data.timezoneId); // e.g. "Australia/Melbourne"
}

//(5) get current weather forecast for city
function displayWeather(response) {
  document.querySelector("#current_city").innerHTML = response.data.city;

  const lat = response.data.coordinates.latitude;
  const lon = response.data.coordinates.longitude;

  // show current city local time (default: user local time); call formatDate #6 function
  document.querySelector("#date-time").innerHTML = `${formatDate(
    response.data.time
  )}   local time `;

  // call function #7 to get timezone name to match city local time
  getTimeZoneName(lat, lon)
    .then((tzName) => {
      currentTimeZone = tzName;

      // call function #8 to format city's date & time
      document.querySelector("#date-time").innerHTML = `${formatCityDateTime(
        response.data.time,
        tzName
      )}  local time `; // local time (should work with a user account; already exceeded free tier access)
    })
    .catch(() => {
      // keep fallback if GeoNames fails
      currentTimeZone = null;
    });

  // weather condition/humidity/wind/temp/icon; call function #9
  document.querySelector("#weather_condition").innerHTML =
    capitalizeFirstLetter(response.data.condition.description);

  document.querySelector("#humidity").innerHTML =
    response.data.temperature.humidity;

  document.querySelector("#wind").innerHTML = response.data.wind.speed;

  const iconName = response.data.condition.icon; // e.g. "broken-clouds-day"

  document.querySelector(
    "#weather_icon"
  ).src = `https://shecodes-assets.s3.amazonaws.com/api/weather/icons/${iconName}.png`;

  document.querySelector("#current_temperature").innerHTML = Math.round(
    response.data.temperature.current
  );

  getForecast(response.data.coordinates); // call getForecast #10 function
}

//(10) get current day forecast function (adjust lat/lon + apiKey)
function getForecast(coordinates) {
  let apiKey = "34t14b5f55afff878dodf0ce647bbe96";
  let apiUrl = `https://api.shecodes.io/weather/v1/forecast?lat=${coordinates.latitude}&lon=${coordinates.longitude}&key=${apiKey}&units=metric`;
  axios.get(apiUrl).then(displayForecast); //call displayForecast #11 function
}

//(4) search city function
function searchCity(city) {
  let apiKey = "34t14b5f55afff878dodf0ce647bbe96";
  let apiUrl = `https://api.shecodes.io/weather/v1/current?query=${city}&key=${apiKey}&units=metric`;
  axios.get(apiUrl).then(displayWeather); // call displayWeather function
}

//(3)
function search(event) {
  event.preventDefault();
  let city = document.querySelector("#search_input").value;
  searchCity(city); // call searchCity function
}

//(14)
function formatDay(timestamp) {
  let date = new Date(timestamp * 1000);
  let days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[date.getDay()];
}

//(11) 7-days forecast function
function displayForecast(response) {
  let forecastDays = response.data.daily;
  let forecastElement = document.querySelector("#forecast");

  let forecastHTML = "";

  forecastDays.slice(0, 7).forEach(function (day) {
    const dayLabel = currentTimeZone
      ? formatForecastDay(day.time, currentTimeZone) //call #13 function to format current day output
      : formatDay(day.time); //call #14 function

    forecastHTML += `
      <li>
        <span class="forecast-day">${dayLabel}</span>
        <div class="forecast-temps">
          <span class="temp-max">${Math.round(day.temperature.maximum)}°</span>
          <span class="temp-min">${Math.round(day.temperature.minimum)}°</span>
        </div>
        <img class="dayFCst_icon"
          src="https://shecodes-assets.s3.amazonaws.com/api/weather/icons/${
            day.condition.icon
          }.png"
          alt="${day.condition.description}"
        />
              
      </li>
    `;
  });

  forecastElement.innerHTML = forecastHTML;
}

//(2) run search
let searchForm = document.querySelector("#search_form");
searchForm.addEventListener("submit", search); // call search function

//(1) load default city with correct timezone time
searchCity("Melbourne");
