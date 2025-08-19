// TODO
// -- Search for location
// -- Toggle display in F or C
// -- Rendering
// -- Icons
// -- Background based on weather

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

class Weather {
  constructor(location) {
    this.location = location;
  }
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

function renderWeather(weather, target) {
  let days = weather.days;

  // Weather by hour for today
  let todayDiv = target.querySelector('div.today');
  todayDiv.replaceChildren();

  let todayHeading = document.createElement('h3');
  todayHeading.textContent = 'Today';
  todayDiv.append(todayHeading);

  let todayPara = document.createElement('p');
  todayPara.textContent = `Date: ${days[0].date} Temp: ${days[0].temp} High: ${days[0].tempMax} Low: ${days[0].tempMin} Conditions: ${days[0].conditions}`;
  todayDiv.append(todayPara);

  weather.hoursToday.forEach((hour) => {
    let hourPara = document.createElement('p');
    hourPara.textContent = `Hour: ${parseInt(
      hour.datetime.split(':')[0],
      10
    )} Temp: ${hour.temp} Conditions: ${hour.conditions}`;
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
    dayPara.textContent = `Date: ${days[i].date} Temp: ${days[i].temp} High: ${days[i].tempMax} Low: ${days[i].tempMin} Conditions: ${days[i].conditions}`;
    restOfWeekDiv.append(dayPara);
  }
}

getWeather('Austin').then((weather) => {
  globalThis.atxWeather = weather;
  globalThis.atxWeatherParsed = parseWeather(weather);
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
      .then((weather) => parseWeather(weather))
      .then((weather) =>
        renderWeather(weather, document.querySelector('div.target-location'))
      );
  });
