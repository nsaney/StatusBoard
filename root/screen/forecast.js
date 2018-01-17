__sb.fn.__addScreen('forecast', function forecast() {
    "use strict";
    
    this.getAjaxSettings = function getAjaxSettings() {
        var latitude = __sb.config.latitude;
        var longitude = __sb.config.longitude;
        var point = latitude + ',' + longitude;
        return {
            method: 'GET',
            url: 'https://api.weather.gov/points/' + point + '/forecast',
            dataType: 'json'
        };
    };
    this.parseRawData = function parseRawData(data) {
        var properties = data && data.properties;
        var periods = properties && properties.periods || [];
        periods.forEach(function (period) {
            var temperature = period.temperature;
            if (isNaN(temperature)) { return; }
            var temperatureUnit = period.temperatureUnit;
            var temperatureAlt = 0;
            var temperatureUnitAlt = '?';
            if (temperatureUnit === 'F') {
                temperatureAlt = ((temperature - 32) * 5/9).toFixed(0);
                temperatureUnitAlt = 'C';
            }
            else if (temperatureUnit === 'C') {
                temperatureAlt = ((temperature * 9/5) + 32).toFixed(0);
                temperatureUnitAlt = 'F';
            }
            period.temperatureAlt = temperatureAlt;
            period.temperatureUnitAlt = temperatureUnitAlt;
        });
        
        console.log(data);
        return data;
    };
});
