// Location => JSON of full result from weather API
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

getWeather('Austin').then((weather) => {
  globalThis.atxWeather = weather;
  globalThis.atxWeatherParsed = parseWeather(weather);
});
