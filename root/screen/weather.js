__sb.fn.__addScreen('weather', function weather() {
    "use strict";
    
    this.getAjaxSettings = function getAjaxSettings() {
        return __sb.Screen.SPOOF_IN_PARSE_RAW_DATA;
    };
    this.parseRawData = function parseRawData(rawData) {
        return {
            high: 70,
            low: 60,
            sky: 'Partly Cloudy',
            precip: 40
        }
    };
});
