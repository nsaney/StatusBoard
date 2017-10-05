__sb.fn.__addScreen('lunar', function lunar(self) {
    "use strict";
    
    var solar = self.root.getScreenByName('solar');
    self.getAjaxSettings = function getAjaxSettings() {
        return __sb.Screen.SPOOF_IN_PARSE_RAW_DATA;
    };
    self.parseRawData = function parseRawData(data) {
        data = {};
        data.fromSolar = ko.computed(function fromSolar() {
            return solar.data();
        });
        return data;
    };
    self.decodePhenAbbr = solar.decodePhenAbbr;
});
