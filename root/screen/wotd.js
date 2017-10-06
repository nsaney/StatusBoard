__sb.fn.__addScreen('wotd', function wotd(self) {
    "use strict";
    
    self.getAjaxSettings = function getAjaxSettings() {
        var url = 'http://australiandictionary.org/embed.php';
        return {
            method: 'POST',
            url: '/cgi-bin/proxy.py',
            mimeType: 'text/plain',
            success: function(data) {
                console.log(data);
            }
        };
        // return __sb.Screen.SPOOF_IN_PARSE_RAW_DATA;
    };
    self.parseRawData = function parseRawData(rawData) {
        return rawData;
    };
});
