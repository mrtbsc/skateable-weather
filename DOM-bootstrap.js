const DOM = {
  getInputedPlace: function () {
    return $("#question input").val();
  },

  emptyPlaceInput: function () {
    $("#question input").val("");
  },

  showFoundPlace: function (place) {
    $("#foundPlace").text(place);
  },

  resetSlots: function () {
    DOM.hidePastAlert();
    $(".hidden-slot").removeClass("hidden-slot");
    $(".forecastSlot").removeClass("bg-blue");
    $(".card-group").html("");
  },

  showPastAlert: function () {
    $("#yesterdaySlot").css("display", "inline-block");
  },

  hidePastAlert: function () {
    $("#yesterdaySlot").hide();
  },

  //loop for each timestamp which we have a weather forecast for
  display: function (array, configuration) {
    let { isToday, isTomorrow, isNextDays, isPast } = configuration;

    for (const interval of array) {
      let dateString = isNextDays
        ? this.stringifyDay(interval.date)
        : this.stringifyHour(interval.date);
      let rainMeasurement = isPast ? interval.mmsOfRain : interval.rainProb;
      let rainDescription = isPast ? " mms" : "%";

      let newCardHour = $("<div class='card-hour'>" + dateString + "</div>");
      let newImg = $("<img class='img-fluid' />");
      newImg.attr("src", interval.iconPath);

      let newCardBody = $('<div class="card-body text-dark pb-1">');
      let newCardTitle = $(
        '<h5 class="card-title mb-0 pt-1">' + rainMeasurement + "</h5>"
      );
      newCardTitle.append($("<small>" + rainDescription + "</small>"));
      let newCardText = $(
        '<p class="card-text"> ' + interval.degrees + " ºC</p>"
      );
      newCardBody.append(newCardTitle);
      newCardBody.append(newCardText);

      let newForecast = $("<div class='card'></div>");
      newForecast.append(newCardHour);
      newForecast.append(newImg);
      newForecast.append(newCardBody);

      let [container, forecastSlot] = isToday
        ? [$("#today"), $("#todaySlot")]
        : isTomorrow
        ? [$("#tomorrow"), $("#tomorrowSlot")]
        : isNextDays
        ? [$("#nextDays"), $("#nextDaysSlot")]
        : [$("#yesterday"), $("#yesterdaySlot")];

      if (interval.hasPrecipitation) {
        newForecast.addClass("bg-blue");
        forecastSlot.addClass("bg-blue");
      }

      container.append(newForecast);
    }
  },

  stringifyHour: function (d) {
    return d.getHours() + "h";
  },

  stringifyDay: function (d) {
    return `${CONFIG.weekDays[d.getDay()]}<br>${d.getDate()} ${
      CONFIG.monthNames[d.getMonth()]
    }`;
  },

  /**/
};
