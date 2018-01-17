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
    this.parseRawData = function parseRawData(rawData) {
        console.log(rawData);
        return rawData;
    };
});
