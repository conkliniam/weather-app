const searchButton = document.querySelector("button");
const locationInput = document.querySelector("#location");
const resultsDiv = document.querySelector("#results");

// Units
const fahrenheit = document.querySelector("#fahrenheit");
const celsius = document.querySelector("#celsius");

// Icons
const snowIcon = document.querySelector(".bi-cloud-snow-fill");
const tempLowIcon = document.querySelector(".bi-thermometer");
const sunriseIcon = document.querySelector(".bi-sunrise-fill");
const rainIcon = document.querySelector(".bi-cloud-drizzle-fill");
const sunnyIcon = document.querySelector(".bi-sun-fill");
const tempHighIcon = document.querySelector(".bi-thermometer-high");
const cloudyIcon = document.querySelector(".bi-clouds-fill");
const sunsetIcon = document.querySelector(".bi-sunset-fill");
const temperatureIcon = document.querySelector(".bi-thermometer-half");

const dayStrings = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

fahrenheit.addEventListener("change", switchTypes);
celsius.addEventListener("change", switchTypes);
searchButton.addEventListener("click", () => searchWeather());
locationInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    searchWeather();
  }
});

function switchTypes() {
  const temperatures = document.querySelectorAll(".temperature");

  for (const temperature of temperatures) {
    temperature.classList.toggle("hidden");
  }
}

function toCelsius(degreesFahrenheit) {
  return (((Number(degreesFahrenheit) - 32) * 5) / 9.0).toFixed(1);
}

async function searchWeather() {
  const location = locationInput.value;
  const results = await fetch(
    `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?unitGroup=us&key=6DRSPJJ2YFJK5PM5UNWXJP8VZ&contentType=json`,
    {
      mode: "cors",
    }
  );
  const json = await results.json();
  const url = await searchGifs(json.currentConditions.conditions);
  const filteredResults = filterResults(json, url);
  displayResults(filteredResults);
  locationInput.value = "";
}

async function searchGifs(conditions) {
  const searchString = `${conditions} weather`;
  const request = new Request(
    `https://api.giphy.com/v1/gifs/translate?api_key=5rQvhA7QNGb2FmoUpSAXpl1Q9SzsWuFi&s=cats${searchString}`,
    { mode: "cors" }
  );

  try {
    const response = await fetch(request);
    const result = await response.json();

    if (result.data) {
      return result.data.images.original.url;
    } else {
      console.log(`No image for ${searchString}`);
      return "";
    }
  } catch (error) {
    console.error(error);
    return "";
  }
}

function filterResults(json, url) {
  console.log(json);
  return {
    location: json.resolvedAddress,
    today: {
      conditions: json.currentConditions.conditions,
      temperature: json.currentConditions.temp,
      feelsLike: json.currentConditions.feelslike,
      time: json.currentConditions.datetime,
      sunrise: json.currentConditions.sunrise,
      sunset: json.currentConditions.sunset,
    },
    description: json.description,
    url: url,
    days: json.days.map((day) => {
      return {
        conditions: day.conditions,
        description: day.description,
        temperature: day.temp,
        tempMin: day.tempmin,
        tempMax: day.tempmax,
        date: day.datetime,
      };
    }),
  };
}

function displayResults(results) {
  resultsDiv.innerHTML = "";

  const title = document.createElement("h2");
  const description = document.createElement("h3");
  const todayDiv = createToday(results.today);
  const imageDiv = document.createElement("div");
  const img = document.createElement("img");
  const daysDiv = createDays(results.days);

  title.textContent = results.location;
  description.textContent = results.description;
  img.src = results.url;

  img.classList.add("weather-img");
  imageDiv.classList.add("image-container");
  title.classList.add("results-title");
  description.classList.add("results-title");

  imageDiv.appendChild(img);
  resultsDiv.appendChild(title);
  resultsDiv.appendChild(description);
  resultsDiv.appendChild(todayDiv);
  resultsDiv.appendChild(imageDiv);
  resultsDiv.appendChild(daysDiv);
}

function createToday(results) {
  const container = document.createElement("div");
  const conditions = document.createElement("p");
  const temperature = createTemperatureContainer(
    results.temperature,
    temperatureIcon
  );
  const feelsLike = createTemperatureContainer(
    results.feelsLike,
    null,
    "Feels Like:"
  );
  const time = createContainer(results.time, null, "Time:");
  const sunrise = createContainer(results.sunrise, sunriseIcon);
  const sunset = createContainer(results.sunset, sunsetIcon);

  container.classList.add("today-container");
  conditions.classList.add("results-text");
  conditions.textContent = results.conditions;

  container.appendChild(conditions);
  container.appendChild(temperature);
  container.appendChild(feelsLike);
  container.appendChild(time);
  container.appendChild(sunrise);
  container.appendChild(sunset);

  return container;
}

function createTemperatureContainer(temperature, icon = null, label = "") {
  const container = document.createElement("div");
  const degreesF = document.createElement("p");
  const degreesC = document.createElement("p");

  container.classList.add("results-row");

  degreesC.classList.add("temperature");
  degreesF.classList.add("temperature");

  if (fahrenheit.checked) {
    degreesC.classList.add("hidden");
  } else {
    degreesF.classList.add("hidden");
  }

  if (icon) {
    const iconCopy = icon.cloneNode(true);
    container.appendChild(iconCopy);
  }

  if (label) {
    container.appendChild(createLabel(label));
  }

  degreesF.textContent = `${temperature} °F`;
  degreesC.textContent = `${toCelsius(temperature)} °C`;
  container.appendChild(degreesF);
  container.appendChild(degreesC);

  return container;
}

function createContainer(text, icon = null, label = "") {
  const container = document.createElement("div");
  const content = document.createElement("p");

  content.textContent = text;
  container.classList.add("results-row");

  if (icon) {
    const iconCopy = icon.cloneNode(true);
    container.appendChild(iconCopy);
  }

  if (label) {
    container.appendChild(createLabel(label));
  }

  container.appendChild(content);

  return container;
}

function createLabel(label) {
  const labelP = document.createElement("p");
  labelP.classList.add("results-label");
  labelP.textContent = label;
  return labelP;
}

function createDays(days) {
  const container = document.createElement("div");
  container.classList.add("days");

  for (const day of days) {
    const dayDiv = document.createElement("div");
    dayDiv.classList.add("day");
    const description = document.createElement("p");
    const conditions = createIcons(day.description);
    const temperature = createTemperatureContainer(
      day.temperature,
      temperatureIcon
    );
    const tempMin = createTemperatureContainer(day.tempMin, tempLowIcon);
    const tempMax = createTemperatureContainer(day.tempMax, tempHighIcon);
    const datetime = new Date(day.date);
    const dayOfWeek = document.createElement("h4");

    const date = document.createElement("p");

    description.textContent = day.description;
    dayOfWeek.classList.add("results-label");
    dayOfWeek.classList.add("results-text");
    date.classList.add("resuls-text");
    date.textContent = day.date;
    dayOfWeek.textContent = dayStrings[datetime.getDay()];

    dayDiv.appendChild(dayOfWeek);
    dayDiv.appendChild(date);
    dayDiv.appendChild(temperature);
    dayDiv.appendChild(description);
    dayDiv.appendChild(conditions);
    dayDiv.appendChild(tempMax);
    dayDiv.appendChild(tempMin);

    container.appendChild(dayDiv);
  }
  return container;
}

function createIcons(text) {
  const container = document.createElement("div");

  const lowerText = text.toLowerCase();

  if (lowerText.includes("sun")) {
    container.appendChild(sunnyIcon.cloneNode(true));
  }

  if (lowerText.includes("rain")) {
    container.appendChild(rainIcon.cloneNode(true));
  }

  if (lowerText.includes("snow")) {
    container.appendChild(snowIcon.cloneNode(true));
  }

  if (lowerText.includes("cloud")) {
    container.appendChild(cloudyIcon.cloneNode(true));
  }

  if (!container.hasChildNodes()) {
    container.appendChild(sunnyIcon.cloneNode(true));
  }
  return container;
}
