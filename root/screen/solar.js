(function () {
    "use strict";
    var solar = new __sb.Screen('Solar', 1000*10);
    solar.getAjaxSettings = function getAjaxSettings() {
        var latitude = __sb.config.latitude;
        var longitude = __sb.config.longitude;
        var now = moment();
        var date = now.format('MM/DD/YYYY');
        var tz = now.utcOffset() / 60;
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
    
    __sb.fn.__addScreen(solar);
})();