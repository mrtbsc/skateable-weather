const UTILS = {
  /** FORMAT-CONVERSIONS TO INTEGRATE WITH GEOCODING API **/

  // Extracts the coordinates from the GEOcoding API's response
  extractCoordinates: function (response) {
    return response.data.results[0].locations[0].latLng;
  },

  // Extracts the place from the GEOcoding API's response
  extractPlace: function (response) {
    let {
      data: { address },
    } = response;
    let settlement = address.city || address.village || address.town;
    return `${settlement}, ${address.country}`;
  },

  /** FORMAT-CONVERSIONS TO INTEGRATE WITH WEATHER API **/

  // Extracts forecasts from OpenWeather API's response
  extractForecasts: function (object) {
    let hourlyData = object.hourly;
    let dailyData = object.daily;
    return { hourlyData, dailyData };
  },

  // Extracts past weather from OpenWeather API's response
  extractPastWeather: function (response) {
    return response.data.hourly;
  },

  // Converts a JS date to the OpenWeather API's format, and vice versa.
  jsToOpenWeather: function (date) {
    return Math.floor(date.getTime() / 1000);
  },
  openWeatherToJs: function (OWDate) {
    return new Date(OWDate * 1000);
  },

  /** FILTERING THE DATA FROM THE WEATHER API'S RESPONSES**/

  // Extract wanted forecast info
  extractFilteredForecasts: function (data) {
    // Extract forecasts
    let { hourlyData, dailyData } = UTILS.extractForecasts(data);

    // filter out redundant or unwanted timestamps
    let { todaysData, tomorrowsData } = this.ommitUnwantedHours(hourlyData);
    dailyData = this.ommitRedundantDays(dailyData);

    // filter out unwanted info, for each wanted timestamp
    let todaysForecast = this.ommitUnwantedInfo(todaysData, { isHourly: true });
    let tomorrowsForecast = this.ommitUnwantedInfo(tomorrowsData, {
      isHourly: true,
    });
    let nextDaysForecast = this.ommitUnwantedInfo(dailyData);
    return { todaysForecast, tomorrowsForecast, nextDaysForecast };
  },

  getPastRain: function (hours) {
    return hours.reduce((accu, hour) => accu + hour.mmsOfRain, 0);
  },

  //Extract wanted past weather info
  extractFilteredWeather: function (response) {
    pastData = this.extractPastWeather(response);
    let pastWeather = this.ommitUnwantedInfo(pastData, {
      isPast: true,
    });
    return pastWeather;
  },

  ommitUnwantedHours: function (array) {
    //let's separate the hours from the current day and the next
    //(and ignore the day after that, for which we might not have all hours)

    let hoursDayAfterTomorrow = today.getHours();
    let todaysData = array.slice(1, 24 - hoursDayAfterTomorrow);
    let tomorrowsData = array.slice(
      24 - hoursDayAfterTomorrow,
      48 - hoursDayAfterTomorrow
    );
    return { todaysData, tomorrowsData };
  },

  ommitRedundantDays: function (array) {
    //let's ignore the daily forecast of the 1st and 2nd days
    //(for which we display the hourly forecasts)
    return array.slice(2, 7);
  },

  // Filter out info that is not needed for every timestamp
  ommitUnwantedInfo: function (
    array,
    configuration = { isHourly: false, isPast: false }
  ) {
    let { isHourly, isPast } = configuration;

    return array.map(function (interval) {
      let recievedMms = isPast && interval.rain ? interval.rain["1h"] : 0;
      return {
        date: new Date(1000 * interval.dt),
        degrees:
          isHourly || isPast
            ? Math.round(interval.temp)
            : Math.round((interval.temp.min + interval.temp.max) / 2),
        iconPath: `./images/${interval.weather[0].icon}.png`,
        rainProb: isPast ? null : Math.round(interval.pop * 10) * 10,
        mmsOfRain: isPast ? recievedMms : null,
        weatherId: interval.weather[0].id,
      };
    });
  },
};
