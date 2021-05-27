const DOM = {
  getInputedPlace: function () {
    return $("input").val();
  },

  emptyPlaceInput: function () {
    $("input").val("");
  },

  showFoundPlace: function (place) {
    $("#foundPlace").text(place);
  },

  resetSlots: function () {
    DOM.hidePastAlert();
    console.log($(".hidden-wrapper").removeClass("hidden-wrapper")) ||
      $(".forecasts-group").html("");
  },

  showPastAlert: function () {
    $("#past-alert").css("display", "inline-block");
  },

  hidePastAlert: function () {
    $("#past-alert").hide();
  },

  //loop for each timestamp which we have a weather forecast for
  display: function (array, configuration) {
    let { isToday, isTomorrow, isNextDays, isPast } = configuration;

    for (const interval of array) {
      let dateString = isNextDays
        ? this.stringifyDay(interval.date)
        : this.stringifyHour(interval.date);
      let rainString = isPast
        ? interval.mmsOfRain + " mm of rain"
        : interval.rainProb + "% chance of rain";
      let text =
        dateString + "<br>" + rainString + "<br>" + interval.degrees + "°C";
      let newSpan = $("<span class='forecast'>" + text + "</span>");
      let newImg = $("<img>");
      newImg.attr("src", interval.iconPath);
      newSpan.append(newImg);

      let container = isToday
        ? $("#today")
        : isTomorrow
        ? $("#tomorrow")
        : isNextDays
        ? $("#week")
        : $("#yesterday");

      container.append(newSpan);
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
