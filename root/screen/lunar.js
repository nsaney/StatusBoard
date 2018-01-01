__sb.fn.__addScreen('lunar', function lunar(self) {
    "use strict";
    
    var solar = self.root.getScreenByName('solar');
    self.getAjaxSettings = function getAjaxSettings() {
        var date = 'today';
        var numPhases = 4;
        return {
            method: 'GET',
            url: 'http://api.usno.navy.mil/moon/phase',
            data: {
                date: date,
                nump: numPhases
            },
            dataType: 'json',
            success: function(data) {
                console.log(data);
            }
        };
    };
    self.parseRawData = function parseRawData(data) {
        data.fromSolar = solar.data;
        return data;
    };
    self.getPhenInfoByAbbr = solar.getPhenInfoByAbbr;
});
