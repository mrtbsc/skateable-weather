const today = new Date();
const yesterday = new Date(today - 24 * 3600 * 1000);

$("#searchForm").on("submit", async function (e) {
  e.preventDefault();

  // 1. Get city/town inputed
  STATUS.targetPlace = DOM.getInputedPlace();
  DOM.emptyPlaceInput();

  //2. Get its coordinates
  const requestConfig = { params: { location: STATUS.targetPlace } };
  let response = await axios.get(
    "http://open.mapquestapi.com/geocoding/v1/address?key=" + keys.MQ,
    requestConfig
  );
  STATUS.coordinates = UTILS.extractCoordinates(response);

  // With the assimilated coordinates, get the place it corresponds to, and print it
  // SO THE USER CAN DOUBLE CHECK it results in the same place they inputed)
  let requestConfig2 = {
    params: { lat: STATUS.coordinates.lat, lon: STATUS.coordinates.lng },
  };
  axios
    .get(
      "http://open.mapquestapi.com/nominatim/v1/reverse.php?format=json&key=" +
        keys.MQ,
      requestConfig2
    )
    .then((response) => {
      STATUS.assimilatedPlace = UTILS.extractPlace(response);
      DOM.showFoundPlace(STATUS.assimilatedPlace);
    });

  //3. Get the forecasts for those coordinates (for next 48h + for next 7 days)
  let { data } = await axios.get(
    "https://api.openweathermap.org/data/2.5/onecall?exclude=minutely,alerts,current&units=metric&appid=" +
      keys.OW,
    requestConfig2
  );

  let forecasts = UTILS.extractFilteredForecasts(data);
  STATUS.todaysForecast = forecasts.todaysForecast;
  STATUS.tomorrowsForecast = forecasts.tomorrowsForecast;
  STATUS.nextDaysForecast = forecasts.nextDaysForecast;

  //4. Get the weather from the day before
  // (incase they alert possible wet floor)

  requestConfig2.params.dt = UTILS.jsToOpenWeather(yesterday);
  response = await axios.get(
    "https://api.openweathermap.org/data/2.5/onecall/timemachine?units=metric&appid=" +
      keys.OW,
    requestConfig2
  );
  STATUS.pastWeather = UTILS.extractFilteredWeather(response);
  STATUS.wasItRainny = UTILS.getPastRain(STATUS.pastWeather);

  //6. Exhibit hidden forecast groups or clear them from previous displays
  DOM.resetSlots();

  //7. Display current forecasts
  DOM.display(STATUS.todaysForecast, { isToday: true });
  DOM.display(STATUS.tomorrowsForecast, { isTomorrow: true });
  DOM.display(STATUS.nextDaysForecast, { isNextDays: true });

  //8. Display past weather if it has rained recently
  // if (STATUS.wasItRainny) {
  //   DOM.showPastAlert();
  //   DOM.display(STATUS.pastWeather, { isPast: true });
  // }
});
