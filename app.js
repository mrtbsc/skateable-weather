const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun","Jul", "Aug", "Sept", "Oct", "Novr", "Dec"];
const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
let today = new Date();
let yesterday = new Date(today - 24*3600*1000);

// 1. Get city/town inputed
$('#searchForm').on('submit', async function (e) {
    e.preventDefault();
    const searchedPlace = $("input").val();

    //2. Get its coordinates
    const config = { params: { location: searchedPlace } }
    const resCoordinates = await axios.get('http://open.mapquestapi.com/geocoding/v1/address?key='+ keys.MQ , config);
    const coordinates = tellCoordinates(resCoordinates);
    $('input').val('');

    //3. Get the forecasts for those coordinates (for next 48h + for next 7 days)
    let configWeather = { params: { lat: coordinates.lat ,lon: coordinates.lng}}
    let { data } = await axios.get('https://api.openweathermap.org/data/2.5/onecall?exclude=minutely,alerts,current&units=metric&appid='+ keys.OW, configWeather);
    const { hourly, daily } = data;
    // console.dir(hourly);
    // console.dir(daily);
    
    //4. Exhibit hidden forecastSlots or clear them from previous displays
    console.log($('.hidden-wrapper').removeClass('hidden-wrapper'))||$('.forecastSlot').html('');
   
    
    //5. Display current forecasts
    display(hourly, true);
    display(daily, false);

    //6. Double-check the used coordinates' city/town, and print it
    //add to config appid
    let { data : dataPlace } = await axios.get('http://open.mapquestapi.com/nominatim/v1/reverse.php?format=json&key='+ keys.MQ, configWeather);
    // console.dir(data);
    $('#foundPlace').text( `${(dataPlace.address.city||dataPlace.address.village||dataPlace.address.town)}, ${dataPlace.address.country}`);

    //7. Get the weather from day before incase they alert current wet floor
    configWeather = { params: {appid: keys.OW, lat: coordinates.lat, lon: coordinates.lng, dt: yesterday.JsToOpenWeather()}}
    resWeather = await axios.get('https://api.openweathermap.org/data/2.5/onecall/timemachine?units=metric', configWeather);
    const yesterdayHourly = resWeather.data.hourly;
    console.dir(yesterdayHourly);

    for (hour of yesterdayHourly) {
        if (hasPrecipitation(hour.weather[0].id)){
            $('#past-alert').show();
            displayYesterday(yesterdayHourly);
            break;
        } else {
            $('#past-alert').hide();
        }
    }
})


/** DISPLAY-FORECAST FUNCTIONS **/
    const display = (array, isHourly) => {
        
        //let's separate the hours from the current day and the next (and ignore the day after that, for which we might not have all hours)
        if (isHourly) {
            const hoursDayAfterTomorrow = today.getHours();
            const arrayToday = array.slice(1 , 24 - hoursDayAfterTomorrow);
            const arrayTomorrow = array.slice( 24 - hoursDayAfterTomorrow, 48 - hoursDayAfterTomorrow);
            displayLoop(arrayToday, true, true);
            displayLoop(arrayTomorrow, true, false);

        //let's ignore the daily forecast of the 1st and 2nd days (for which we display the hourly forecasts)    
        } else {
            array = array.slice(2,6);
            displayLoop(array, false, false);
        }
    }

    //loop for each timestamp which we have a weather forecast for
    const displayLoop = (array, isHourly, isToday ) => {
            
            for (const weather of array) {

                let date = OpenWeatherToJs(weather.dt); //let date = new Date(weather.dt*1000);
                let dateString = isHourly ? stringifyHour(date) : stringifyDay(date);
                let degrees = isHourly ? Math.round(weather.temp) : Math.round((weather.temp.min + weather.temp.max)/2);
                let rainProb = Math.round(weather.pop*10)*10; 
                let text = dateString + '<br>' + rainProb + '% chance of rain<br>' + degrees + '°C';
                let newSpan = $('<span>'+ text + '</span>'); 
        
                let newImg = $('<img>');
                newImg.attr('src',`./images/${weather.weather[0].icon}.png`);
                newSpan.append(newImg);
                
                let container = isHourly ? (isToday ? $('#today') : $('#tomorrow')) : $('#week');
                container.append(newSpan);
            }
    }

    //loop for yesterday's weather
    const displayYesterday = function (array) {

        for (const weather of array) {
            let date = OpenWeatherToJs(weather.dt); 
            let dateString = stringifyHour(date);
            let degrees =  Math.round(weather.temp);
            let rainArray = weather.rain || {"1h" : "0"} ;
            let text = dateString + '<br>' + rainArray["1h"] + ' mm of rain<br>' + degrees + '°C';
            let newSpan = $('<span>'+ text + '</span>'); 

            let newImg = $('<img>');
            newImg.attr('src',`./images/${weather.weather[0].icon}.png`);
            newSpan.append(newImg);
            $('#yesterday').append(newSpan);

        }
    }

/**/

/** FORMAT-CONVERSION FUNCTIONS */

    // Gets the coordinates from the GEOcoding API's response
    const tellCoordinates = (response) => {
        return response.data.results[0].locations[0].latLng;
    }

    // Converts a JS date to the OpenWeather API's format, and vice versa.
    Date.prototype.JsToOpenWeather  = function () { return Math.floor(this.getTime()/1000) };
    const OpenWeatherToJs  = function (OWDate) { return new Date(OWDate*1000) };

    // Checks if a weather id involves rain or snow 
    const hasPrecipitation = function (id) {
        return (id >= 200) && (id <= 622) &&  ![210, 211, 212, 221].includes(id);       
    }


    const stringifyHour = (d) => {
        return d.getHours()+'h'

        // if (d.getDate() === today.getDate()) {
        //     return `Today<br>`+d.getHours()+'h';
        // } else if (d.getDate() === (today.getDate() + 1)) {
        //     return `Tomorrow<br>`+d.getHours()+'h'; 
        // } else {
        //     return `${weekDays[d.getDay()]}<br> (${d.getDate()} ${monthNames[d.getMonth()]})<br>`+d.getHours()+':'+d.getMinutes(); 
        // }
        
    }

    const stringifyDay = (d) => `${weekDays[d.getDay()]}<br>${d.getDate()} ${monthNames[d.getMonth()]}`;
/**/