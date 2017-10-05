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
    
    var phenomenonAbbreviations = {
        'BC': 'Begin civil twilight',
        'R': 'Rise',
        'U': 'Upper Transit',
        'S': 'Set',
        'EC': 'End civil twilight',
        'L': 'Lower Transit (above the horizon)',
        '**': 'object continuously above the horizon',
        '--': 'object continuously below the horizon',
        '^^': 'object continuously above the twilight limit',
        '~~': 'object continuously below the twilight limit'
    };
    self.decodePhenAbbr = function decodePhenAbbr(abbr) {
        return phenomenonAbbreviations[abbr] || '(Unknown)';
    };
});
