__sb.fn.__addScreen('lunar', function lunar(self) {
    "use strict";
    
    self.solarScreen = self.root.getScreenByName('solar');
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
            dataType: 'json'
        };
    };
    self.parseRawData = function parseRawData(data) {
        console.log(data);
        return data;
    };
    
    var PhenPosition = self.solarScreen._PhenPosition;
    self.phenPositions = ko.computed(function phenPositions() {
        var result = [];
        var solarData = self.solarScreen.data();
        if (solarData) {
            solarData.orbs.allmoondata.map(function eachMoonDay(day) {
                day.value.map(function eachMoonDayPhen(phen) {
                    var phenPosition = new PhenPosition(phen.phen, 'moon', day.prefix);
                    result.push(phenPosition);
                });
            });
        }
        return result;
    });
    self.getPhenPositionByDayAndName = function getPhenPositionByDayAndName(day, name) {
        return ko.utils.arrayFirst(self.phenPositions(), function (x) {
            return x.DAY === day && x.NAME === name;
        });
    };
    self.lunarCircleStyle = ko.computed(function lunarCircleStyle() {
        var mainCircleStyle = self.solarScreen.references.mainCircleStyle();
        var u = self.getPhenPositionByDayAndName('prev', 'U')
             || self.getPhenPositionByDayAndName('', 'U')
             || self.getPhenPositionByDayAndName('next', 'U')
        ;
        var result = {};
        result.background = u
                          ? 'linear-gradient(' + (u.degrees() + 90) + 'deg, #1f1f1f, #ffffff)'
                          : '#8f8f8f'
        ;
        return $.extend(result, mainCircleStyle);
    });
    
    ko.bindingHandlers.sb_lunar_anchor = self.solarScreen.getAnchorBinding('lunar');
});
