__sb.fn.__addScreen('forecast', function forecast(self) {
    "use strict";

    function ftoc(degF) { return (degF - 32) * 5/9; }
    function ctof(degC) { return (degC * 9/5) + 32; }

    self.station = 'unknown station';
    self.point = 'unknown point';

    var original_start = self.start;
    self.start = function start() {
        var latitude = __sb.config.latitude;
        var longitude = __sb.config.longitude;
        self.point = latitude + ',' + longitude;
        var stationSettings = {
            method: 'GET',
            url: 'https://api.weather.gov/points/' + self.point + '/stations',
            dataType: 'json'
        };
        var stationPromise = __sb.Screen.callIndividualAjax(stationSettings);
        stationPromise.done(stationPromise_done);
        function stationPromise_done(rawData) {
            try {
                var stations = rawData && rawData.observationStations || [];
                var firstStation = stations[0];
                self.station = firstStation;
                original_start.apply(self);
            }
            catch (ex) {
                console.logError(ex);
            }
        }
    };

    self.getAjaxSettings = function getAjaxSettings() {
        if (self.station === null) {
            throw new Error('Unable to find a station for the given coordinates: ' + point);
        }
        var forecastSettings = {
            NAME: 'forecast',
            method: 'GET',
            url: 'https://api.weather.gov/points/' + self.point + '/forecast',
            dataType: 'json'
        };
        var currentObservationSettings = {
            NAME: 'currentObservation',
            method: 'GET',
            url: self.station + '/observations/current',
            dataType: 'json'
        };
        return [forecastSettings, currentObservationSettings];
    };
    self.parseRawData = function parseRawData(data) {
        var forecast = data && data.forecast;
        var properties = forecast && forecast.properties;
        var periods = (properties && properties.periods) || [];
        periods.forEach(function (period) {
            var temperature = period.temperature;
            if (isNaN(temperature)) { return; }
            var temperatureUnit = period.temperatureUnit;
            var temperatureAlt = 0;
            var temperatureUnitAlt = '?';
            if (temperatureUnit === 'F') {
                temperatureAlt = ftoc(temperature).toFixed(0);
                temperatureUnitAlt = 'C';
            }
            else if (temperatureUnit === 'C') {
                temperatureAlt = ctof(temperature).toFixed(0);
                temperatureUnitAlt = 'F';
            }
            period.temperatureAlt = temperatureAlt;
            period.temperatureUnitAlt = temperatureUnitAlt;
        });

        var currentObservation = data && data.currentObservation;
        var currentProperties = currentObservation && currentObservation.properties;
        var currentTemperatureInfo = currentProperties.temperature;
        var currentTemperature = currentTemperatureInfo.value;
        if (!isNaN(currentTemperature)) {
            var currentTemperatureUnitCode = currentTemperatureInfo.unitCode;
            var currentTemperatureUnit = '?';
            var currentTemperatureAlt = 0;
            var currentTemperatureUnitAlt = 'unit:????';
            if (currentTemperatureUnitCode === 'unit:degF') {
                currentTemperatureAlt = ftoc(currentTemperature);
                currentTemperatureUnit = 'F';
                currentTemperatureUnitAlt = 'C';
            }
            else if (currentTemperatureUnitCode === 'unit:degC') {
                currentTemperatureAlt = ctof(currentTemperature);
                currentTemperatureUnit = 'C';
                currentTemperatureUnitAlt = 'F';
            }
            currentTemperatureInfo.unit = currentTemperatureUnit;
            currentTemperatureInfo.valueAlt = currentTemperatureAlt;
            currentTemperatureInfo.unitAlt = currentTemperatureUnitAlt;
        }

        console.log(data);
        return data;
    };
});
