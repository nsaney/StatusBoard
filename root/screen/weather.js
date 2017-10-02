(function () {
    "use strict";
    
    var weather = new __sb.Screen({
        name: 'Weather', 
        updateSeconds: 60*10
    });
    weather.getAjaxSettings = function getAjaxSettings() {
        return __sb.Screen.SPOOF_IN_PARSE_RAW_DATA;
    };
    weather.parseRawData = function parseRawData(rawData) {
        return {
            high: 70,
            low: 60,
            sky: 'Partly Cloudy',
            precip: 40
        }
    };
    
    __sb.fn.__addScreen(weather);
})();