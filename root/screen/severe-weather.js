__sb.fn.__addScreen('severe-weather', function severe_weather(self) {
    "use strict";
    
    self.getAjaxSettings = function getAjaxSettings() {
        var latitude = __sb.config.latitude;
        var longitude = __sb.config.longitude;
        var point = latitude + ',' + longitude;
        return {
            method: 'GET',
            url: 'https://api.weather.gov/alerts/active',
            data: {
                point: point
            },
            dataType: 'json'
        };
    };
    self.parseRawData = function parseRawData(rawData) {
        console.log(rawData);
        return rawData;
    };
});
