$(function () {
    "use strict";
    
    ////// View Model //////
    var self = __sb.vm = {};
    
    //// Current Time ////
    self.now = ko.observable(moment());
    self.updateNow = function updateNow() {
        self.now(moment());
    };
    setInterval(self.updateNow, __sb.config.tickSeconds * 500);
    self.nowFormatted = ko.computed(function nowFormatted() {
        return self.now().format(__sb.config.momentLongFormat);
    });
    
    //// Screens ////
    var screensByName = {};
    self.getScreenByName = function getScreenByName(name) {
        return screensByName[name] || null;
    };
    self.screens = ko.observableArray([]);
    self.currentScreen = ko.observable(null);
    self.offsetScreenFn = function (offset) {
        return ko.computed(function offsetScreen() {
            var currentScreen = self.currentScreen();
            if (!currentScreen) { return null; }
            var screens = self.screens();
            var screenCount = screens.length;
            var currentOffset = offset;
            while (currentOffset < 0) { currentOffset += screenCount; }
            var nextIndex = (currentScreen.INDEX + currentOffset) % screenCount;
            return screens[nextIndex];
        });
    };
    self.setScreenActiveFn = function setScreenActiveFn(screenKo) {
        return function setScreenActive(data, event) {
            var screen = ko.unwrap(screenKo);
            if (!screen) { return; }
            screen.setActive(data, event);
        };
    };
    self.prevScreen = self.offsetScreenFn(-1);
    self.setPrevScreenActive = self.setScreenActiveFn(self.prevScreen);
    self.nextScreen = self.offsetScreenFn(+1);
    self.setNextScreenActive = self.setScreenActiveFn(self.nextScreen);
    self.nextTransitionTimestamp = ko.observable(null);
    self.createNextTransitionTimestamp = function createNextTransitionTimestamp(oldTimestamp) {
        oldTimestamp = oldTimestamp || moment();
        return oldTimestamp.add(__sb.config.screenSeconds, 's');
    }
    self.secondsToNextTransition = ko.computed(function secondsToNextTransition() {
        var nextTransition = self.nextTransitionTimestamp();
        if (!nextTransition) { return; }
        var now = self.now();
        return nextTransition.diff(now, 's');
    });
    self.nextTransitionPercent = ko.computed(function nextTransitionPercent() {
        var secondsToNextTransition = self.secondsToNextTransition();
        var elapsedPercent = 100 * secondsToNextTransition / __sb.config.screenSeconds;
        return 100 - elapsedPercent;
    });
    self.nextTransitionPercentage = ko.computed(function nextTransitionPercent() {
        var nextTransitionPercent = self.nextTransitionPercent();
        return nextTransitionPercent + '%';
    });
    self.nextTransitionTooltip = ko.computed(function nextUpdateTooltip() {
        var nextTransition = self.nextTransitionTimestamp();
        if (!nextTransition) { return; }
        var formattedTime = nextTransition.format(__sb.config.momentLongFormat);
        return 'Next screen transition at ' + formattedTime;
    });
    self.nextRequiredScreen = ko.computed(function nextRequiredScreen() {
        var currentScreen = self.currentScreen();
        if (!currentScreen) { return null; }
        var screens = self.screens();
        var screenCount = screens.length;
        var next = { screen: currentScreen };
        do {
            next.index = next.screen.INDEX;
            next.screen = screens[(next.index + 1) % screenCount];
        } while (!next.screen.REQUIRED);
        return next.screen;
    });
    
    
    ////// jQuery //////
    $("body").keyup(function(e) {
        if (e.which === $.ui.keyCode.LEFT) {
            self.setPrevScreenActive(self, e);
        }
        else if (e.which === $.ui.keyCode.RIGHT) {
            self.setNextScreenActive(self, e);
        }
    });
    
    
    ////// Functions //////
    __sb.fn.__addScreen = function __addScreen(name, initFn) {
        var screenItem = ko.utils.arrayFirst(__sb.screens, function nameFilter(item) {
            return item && Array.isArray(item) && (item[0] === name);
        });
        if (!screenItem) {
            throw new Error('Unknown screen: ' + name);
        }
        
        var screen = new __sb.Screen(self, {
            index: self.screens().length,
            name: name,
            updateSeconds: screenItem[1],
            color1: screenItem[2],
            color2: screenItem[3],
            required: screenItem[4]
        });
        initFn.call(screen, screen);
        
        screensByName[name] = screen;
        self.screens.push(screen);
        if (!self.currentScreen()) {
            self.currentScreen(screen);
        }
        
        screen.start();
    };
    __sb.fn.__loadAllScreens().then(function afterAllScreens() {
        if (__sb.config.screenSeconds < 5) { return; }
        self.now.subscribe(function screenTransition(now) {
            var nextTransition = self.nextTransitionTimestamp();
            if (!nextTransition) { return; }
            var nextTransitionIsDue = now.isAfter(nextTransition);
            if (!nextTransitionIsDue) { return; }
            var nextScreen = self.nextRequiredScreen();
            if (!nextScreen) { return; }
            nextScreen.setActive(nextScreen, null, nextTransition);
        });
        var firstTransition = self.createNextTransitionTimestamp();
        self.nextTransitionTimestamp(firstTransition);
    });
    
    
    ////// Apply Bindings //////
    ko.applyBindings(self);
});
