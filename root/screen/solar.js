__sb.fn.__addScreen('solar', function solar(self) {
    "use strict";
    
    self.getAjaxSettings = function getAjaxSettings() {
        var latitude = __sb.config.latitude;
        var longitude = __sb.config.longitude;
        var date = 'today';
        var tz = self.root.now().utcOffset() / 60;
        return {
            method: 'GET',
            url: 'http://api.usno.navy.mil/rstt/oneday',
            data: {
                date: date,
                tz: tz,
                coords: latitude + ',' + longitude
            },
            dataType: 'json',
            success: function(data) {
                console.log(data);
            }
        };
    };
    
    self.parseRawData = function parseRawData(data) {
        data.allmoondata = ['prev', '', 'next'].map(function processMoonPrefix(prefix) {
            var key = prefix + 'moondata';
            var value = data[key] || [];
            return {
                prefix: prefix,
                value: value
            };
        });
        return data;
    };
    
    var phenomenonAbbreviations = {
        'BC': 'First Light',
        'R': 'Rise',
        'U': 'Highest Point',
        'S': 'Set',
        'EC': 'Last Light',
        'L': 'Lowest Point',
        '**': 'always above horizon',
        '--': 'always below horizon',
        '^^': 'always above twilight',
        '~~': 'always below twilight'
    };
    self.decodePhenAbbr = function decodePhenAbbr(abbr) {
        return phenomenonAbbreviations[abbr] || '(Unknown)';
    };
});
