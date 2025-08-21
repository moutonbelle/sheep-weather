// TODO
// -- Rendering
// -- Icons

import './styles.css';

// Location string => JSON of full result from weather API
async function getWeather(location) {
  let weatherURL =
    'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/' +
    location +
    '?unitGroup=us&include=days%2Chours&key=R565NZRJHX8D3XBTNCCZ9ZKAW&contentType=json';
  let weather = await (await fetch(weatherURL)).json();
  return weather;
}

// Full JSON from weather API => weather object containing fields we need
function parseWeather(weather) {
  let weatherObject = {};

  // Extract days
  weatherObject.days = [];
  for (let i = 0; i < 7; i++) {
    let day = weather.days[i];
    let dayObject = {};
    dayObject.date = day.datetime;
    dayObject.conditions = day.conditions;
    dayObject.description = day.description;
    dayObject.icon = day.icon;
    dayObject.moonphase = day.moonphase;
    dayObject.chanceofrain = day.precipprob;
    dayObject.sunrise = day.sunrise;
    dayObject.sunset = day.sunset;
    dayObject.temp = day.temp;
    dayObject.tempMax = day.tempmax;
    dayObject.tempMin = day.tempmin;
    weatherObject.days.push(dayObject);
  }

  // Extract hours for today
  let hoursObject = [];
  let hours = weather.days[0].hours;

  for (let i = 0; i < 24; i++) {
    let hour = hours[i];
    hoursObject[i] = {};
    hoursObject[i].conditions = hour.conditions;
    hoursObject[i].datetime = hour.datetime;
    hoursObject[i].icon = hour.icon;
    hoursObject[i].chanceofrain = hour.precipprob;
    hoursObject[i].temp = hour.temp;
  }

  weatherObject.hoursToday = hoursObject;

  return weatherObject;
}

function round(num, places = 0) {
  let scaler = 10 ** places;
  return Math.round(num * scaler) / scaler;
}

function tempUnits(temp, tempUnit) {
  if (tempUnit === 'celsius')
    return round((parseFloat(temp) - 32) * (5 / 9), 1) + '°C';
  else return round(temp, 0) + '°F';
}

function dateDisplay(date) {
  let [year, month, day] = date.split('-');
  let dateObj = new Date(year, month, day);
  return dateFormatter.format(dateObj);
}

function hourDisplay(hour) {
  let output = '';
  if (hour === 0) output = 'Midnight';
  if (hour > 0 && hour < 12) output = hour + ' a.m.';
  if (hour === 12) output = 'High Noon';
  if (hour > 12) output = hour - 12 + ' p.m.';
  return output;
}

// Parsed weather object => render on page
function renderWeather(weather, target, settings = { tempUnit: 'fahrenheit' }) {
  console.log(weather);
  let days = weather.days;

  // Weather by hour for today
  let todayDiv = target.querySelector('div.today');
  todayDiv.replaceChildren();

  let todayHeading = document.createElement('h3');
  todayHeading.textContent = 'Today';
  todayDiv.append(todayHeading);

  let todayPara = document.createElement('p');
  todayPara.textContent = `${dateDisplay(days[0].date)} High: ${tempUnits(days[0].tempMax, settings.tempUnit)} Low: ${tempUnits(days[0].tempMin, settings.tempUnit)} ${days[0].description}`;
  todayDiv.append(todayPara);

  target.classList.add(`bg-${days[0].icon}`);

  weather.hoursToday.forEach((hour) => {
    let hourPara = document.createElement('p');
    hourPara.textContent = `${hourDisplay(
      parseInt(hour.datetime.split(':')[0], 10)
    )} ${tempUnits(hour.temp, settings.tempUnit)} ${hour.conditions}`;
    todayDiv.append(hourPara);
  });

  // Weather by day for rest of week (next six days)
  let restOfWeekDiv = target.querySelector('div.rest-of-week');
  restOfWeekDiv.replaceChildren();

  let restOfWeekHeading = document.createElement('h3');
  restOfWeekHeading.textContent = 'Rest of the Week';
  restOfWeekDiv.append(restOfWeekHeading);

  for (let i = 1; i < 7; i++) {
    let dayPara = document.createElement('p');
    dayPara.textContent = `${dateDisplay(days[i].date)} High: ${tempUnits(days[i].tempMax, settings.tempUnit)} Low: ${tempUnits(days[i].tempMin, settings.tempUnit)} ${days[i].description}`;
    restOfWeekDiv.append(dayPara);
  }
}

let tempUnit = 'fahrenheit';
let remoteWeatherParsed, atxWeatherParsed;
let dateFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
});

getWeather('Austin').then((weather) => {
  atxWeatherParsed = parseWeather(weather);
  renderWeather(atxWeatherParsed, document.querySelector('div.hq'));
});

document
  .querySelector('button#get-target-location')
  .addEventListener('click', () => {
    let loc = document.querySelector('input#target-location').value;
    let locHeading = document.querySelector('div.target-location > h2');
    locHeading.textContent = loc;
    locHeading.classList.remove('hidden');
    getWeather(loc)
      .then((weather) => {
        remoteWeatherParsed = parseWeather(weather);
        return remoteWeatherParsed;
      })
      .then((weather) =>
        renderWeather(weather, document.querySelector('div.target-location'))
      );
  });

document.querySelector('div#temp-units').addEventListener('change', (e) => {
  let selectedUnit = e.target.closest('label').id;
  if (selectedUnit === tempUnit) return;
  tempUnit = selectedUnit;
  renderWeather(atxWeatherParsed, document.querySelector('div.hq'), {
    tempUnit: selectedUnit,
  });
  if (remoteWeatherParsed)
    renderWeather(
      remoteWeatherParsed,
      document.querySelector('div.target-location'),
      { tempUnit: selectedUnit }
    );
});
