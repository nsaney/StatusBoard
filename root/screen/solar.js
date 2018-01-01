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
        };
    };
    
    self.parseRawData = function parseRawData(data) {
        data.orbs = {};
        ['sun', 'moon'].map(function processOrb(orb) {
            var origKey = orb + 'data';
            data.orbs['all' + origKey] = ['prev', '', 'next'].map(function processMoonPrefix(prefix) {
                var key = prefix + origKey;
                var value = data[key] || [];
                return {
                    prefix: prefix,
                    value: value
                };
            });
        });
        data.orbs.getOrbItem = function getOrbItem(orb, prefix) {
            var orb = data.orbs['all' + orb + 'data'];
            var item = ko.utils.arrayFirst(orb, function kouaf(x) { 
                return x.prefix === prefix; 
            });
            return item;
        };
        console.log(data);
        return data;
    };
    
    function PhenomenonInfo(abbr, meaning, color) {
        var pi = this;
        pi.abbr = abbr;
        pi.meaning = meaning;
        pi.color = color;
    }
    self.phenomenonInfos = [
        new PhenomenonInfo('BC', 'First Light',           '#001fdf'),
        new PhenomenonInfo('R',  'Rise',                  'red'),
        new PhenomenonInfo('U',  'Highest Point',         'black'),
        new PhenomenonInfo('S',  'Set',                   'red'),
        new PhenomenonInfo('EC', 'Last Light',            '#0000bf'),
        new PhenomenonInfo('L',  'Lowest Point',          'white'),
        new PhenomenonInfo('**', 'always above horizon',  'black'),
        new PhenomenonInfo('--', 'always below horizon',  'black'),
        new PhenomenonInfo('^^', 'always above twilight', 'black'),
        new PhenomenonInfo('~~', 'always below twilight', 'black')
    ];
    var unknownPhen = new PhenomenonInfo('??', 'Unknown', 'black');
    self.getPhenInfoByAbbr = function getPhenInfoByAbbr(abbr) {
        return ko.utils.arrayFirst(self.phenomenonInfos, function kouaf(x) {
            return x.abbr === abbr;
        }) || unknownPhen;
    };
    
    self.getDegreesFromTime = function getDegreesFromTime(time) {
        if (!time) { return 0; }
        var split = time.split(':');
        var hour = parseInt(split[0]);
        var minute = parseInt(split[1] || '0');
        var second = parseInt(split[2] || '0');
        var degrees = (hour * 15) + (minute / 4) + (second / 240);
        degrees += 90 + 360;
        degrees %= 360;
        return degrees;
    };
    
    self.getRadiansFromDegrees = function getRadiansFromDegrees(degrees) {
        return degrees * Math.PI / 180;
    };
    
    function Anchor() {
        var a = this;
        a.parentElement = ko.observable(null);
        function getParentPropComputed(propName) {
            return ko.computed(function getParentProp() {
                var parentElement = a.parentElement();
                return (parentElement && parentElement[propName]) || 0;
            });
        };
        a.parentWidth = getParentPropComputed('clientWidth');
        a.parentHeight = getParentPropComputed('clientHeight');
        a.sideSize = ko.computed(function sideSize() {
            return Math.min(a.parentWidth(), a.parentHeight());
        });
        a.widthBounded = ko.computed(function widthBounded() {
            return a.parentWidth() === a.sideSize();
        });
        a.heightBounded = ko.computed(function heightBounded() {
            return a.parentHeight() === a.sideSize();
        });
        a.radius = ko.computed(function radius() {
            return a.sideSize() / 2;
        });
        a.centerHorizontal = ko.computed(function centerHorizontal() {
            return a.parentWidth() / 2;
        });
        a.centerVertical = ko.computed(function centerVertical() {
            return a.parentHeight() / 2;
        });
        a.left = ko.computed(function left() {
            return (a.parentWidth() - a.sideSize()) / 2;
        });
        a.top = ko.computed(function top() {
            return (a.parentHeight() - a.sideSize()) / 2;
        });
        a.right = ko.computed(function right() {
            return a.left() + a.sideSize();
        });
        a.bottom = ko.computed(function bottom() {
            return a.top() + a.sideSize();
        });
    }
    
    function AbstractTimePosition(name, timeFn) {
        var p = this;
        p.NAME = name;
        p.time = ko.computed(timeFn);
        p.degrees = ko.computed(function degrees() {
            var time = p.time();
            return self.getDegreesFromTime(time);
        });
        p.radians = ko.computed(function radians() {
            var degrees = p.degrees();
            return self.getRadiansFromDegrees(degrees);
        });
        p.leftOffset = ko.computed(function leftOffset() {
            var a = self.references.anchor;
            return a.radius() * Math.cos(p.radians());
        });
        p.topOffset = ko.computed(function topOffset() {
            var a = self.references.anchor;
            return a.radius() * Math.sin(p.radians());
        });
        p.left = ko.computed(function left() {
            var a = self.references.anchor;
            return a.centerHorizontal() + p.leftOffset();
        });
        p.top = ko.computed(function top() {
            var a = self.references.anchor;
            return a.centerVertical() + p.topOffset();
        });
        p.style = ko.computed(function style() {
            return {
                position: 'absolute',
                left: p.left() + 'px',
                top: p.top() + 'px'
            };
        });
        p.radialBoxStyle = ko.computed(function radialBoxStyle() {
            return {
                padding: '0 4px',
                lineHeight: '1em',
                transformOrigin: 'left top',
                transform: 'rotate(' + p.degrees() + 'deg) translateY(-50%) translateX(-100%)'
            };
        });
        p.invertRadialBox = ko.computed(function invertRadialBox() {
            return p.leftOffset() < 0;
        });
        p.innerRadialBoxStyle = ko.computed(function invertedBoxStyle() {
            var invert = p.invertRadialBox();
            var style = {
                display: 'flex'
            };
            if (invert) {
                style.transformOrigin = 'center center';
                style.transform = 'rotate(180deg)';
                style.flexDirection = 'row-reverse';
            }
            return style;
        });
        p.externalBoxStyle = ko.computed(function externalBoxStyle() {
            return {
                padding: '0.25em 0',
                lineHeight: '1em',
                transformOrigin: 'top left',
                transform: 'rotate(' + (90 + p.degrees()) + 'deg) translateY(-100%) translateX(-50%)'
            };
        });
        p.invertExternalBox = ko.computed(function invertExternalBox() {
            return p.topOffset() > 0;
        });
        p.innerExternalBoxStyle = ko.computed(function innerExternalBoxStyle() {
            var invert = p.invertExternalBox();
            var style = {};
            if (invert) {
                style.transformOrigin = 'center center';
                style.transform = 'rotate(180deg)';
            }
            return style;
        });
    }
    
    self._PhenPosition = PhenPosition;
    function PhenPosition(name, orb, day) {
        var p = this;
        AbstractTimePosition.call(this, name, function timeFn() {
            var data = self.data();
            if (!data) { return null; }
            var currentDay = data.orbs.getOrbItem(orb, day);
            if (!currentDay ) { return null; }
            var entry = ko.utils.arrayFirst(currentDay.value, function kouaf(x) {
                return x.phen === p.NAME;
            });
            return entry && entry.time;
        });
        p.ORB = orb;
        p.DAY = day;
        p.info = self.getPhenInfoByAbbr(name);
        var baseStyle = p.style;
        p.style = ko.computed(function style() {
            var result = baseStyle();
            result.color = p.info.color;
            return result;
        });
    }
    
    function CurrentTimePosition() {
        var p = this;
        AbstractTimePosition.call(this, 'NOW', function timeFn() {
            //return "0:00";
            var now = self.root.now();
            return now.format(__sb.config.momentShortTimeFormat);
        });
    }
    
    self.references = {};
    self.references.anchor = new Anchor();
    self.references.center = {
        style: ko.computed(function style() {
            var a = self.references.anchor;
            return {
                position: 'absolute',
                left: a.centerHorizontal() + 'px',
                top: a.centerVertical() + 'px'
            };
        })
    };
    self.references.points = {
        radius: ko.observable(3),
        radiusUnit: ko.observable('px')
    };
    self.references.points.style = ko.computed(function style() {
        var r = self.references.points.radius();
        var d = 2*r;
        var u = self.references.points.radiusUnit();
        return {
            position: 'absolute',
            top: '-' + r + u,
            left: '-' + r + u,
            width: '' + d + u,
            height: '' + d + u,
            border: '1px solid black',
            borderRadius: '' + r + u
        };
    });
    self.phenPositions = ['BC', 'R', 'U', 'S', 'EC'].map(function processPhen(x) {
        return new PhenPosition(x, 'sun', '');
    });
    self.currentTimePosition = new CurrentTimePosition();
    self.getPhenPositionByName = function getPhenPositionByName(name) {
        return ko.utils.arrayFirst(self.phenPositions, function (x) {
            return x.NAME === name;
        });
    };
    self.references.mainCircleStyle = ko.computed(function mainCircleStyle() {
        var a = self.references.anchor;
        return {
            position: 'absolute',
            border: '1px solid black',
            left: a.left() + 'px',
            top: a.top() + 'px',
            borderRadius: a.radius() + 'px',
            width: a.sideSize() + 'px',
            height: a.sideSize() + 'px'
        };
    });
    self.references.solarCircleStyle = ko.computed(function solarCircleStyle() {
        var mainCircleStyle = self.references.mainCircleStyle();
        var u = self.getPhenPositionByName('U');
        var result = {
            background: 'linear-gradient(' + (u.degrees() + 90) + 'deg, #000000, #001f1f, #004f4f, #ff9f9f, #ffff00, #ffffff)'
        };
        return $.extend(result, mainCircleStyle);
    });
    self.getAnchorBinding = function getAnchorBinding(screenName) {
        return {
            init: function initSolarElement(element) {
                // styles
                var horizontalMarginSize = 1.5;
                var verticalMarginSize = horizontalMarginSize;
                var marginUnit = 'em';
                var hm = '' + horizontalMarginSize + marginUnit;
                var vm = '' + verticalMarginSize + marginUnit;
                var h2m = '' + (2*horizontalMarginSize) + marginUnit;
                var v2m = '' + (2*verticalMarginSize) + marginUnit;
                element.id = screenName + 'Anchor';
                element.style.position = 'relative';
                element.style.width = 'calc(100% - ' + h2m + ')';
                element.style.height = 'calc(100% - ' + v2m + ')';
                element.style.margin = vm + ' ' + hm;
                
                // events
                function updateAnchor() {
                    self.references.anchor.parentElement(element);
                }
                setTimeout(updateAnchor, 1);
                $(window).on('resize.' + screenName, updateAnchor);
                ko.utils.domNodeDisposal.addDisposeCallback(element, function dispose() {
                    $(window).off('resize.' + screenName);
                });
            }
        };
    };
    ko.bindingHandlers.sb_solar_anchor = self.getAnchorBinding('solar');
});
