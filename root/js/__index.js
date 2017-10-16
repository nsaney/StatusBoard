$(function () {
    "use strict";
    
    ////// View Model //////
    var self = __sb.vm = {};
    
    //// Current Time ////
    self.now = ko.observable(moment());
    self.updateNow = function updateNow() {
        self.now(moment());
    };
    setInterval(self.updateNow, __sb.config.tickSeconds * 1000);
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
    self.nextTransitionTimestamp = ko.observable(null);
    self.secondsToNextTransition = ko.computed(function secondsToNextTransition() {
        var nextTransition = self.nextTransitionTimestamp();
        if (!nextTransition) { return; }
        var now = self.now();
        return nextTransition.diff(now, 's');
    });
    self.nextTransitionTooltip = ko.computed(function nextUpdateTooltip() {
        var nextTransition = self.nextTransitionTimestamp();
        if (!nextTransition) { return; }
        var tooltip = nextTransition.format(__sb.config.momentLongFormat);
        return tooltip;
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
            var currentScreen = self.currentScreen();
            if (!currentScreen) { return; }
            var screens = self.screens();
            var screenCount = screens.length;
            var nextIndex = (currentScreen.INDEX + 1) % screenCount;
            var nextScreen = screens[nextIndex];
            nextTransition.add(__sb.config.screenSeconds, 's');
            self.nextTransitionTimestamp(moment.max(now, nextTransition));
            self.currentScreen(nextScreen);
        });
        var firstTransition = moment().add(__sb.config.screenSeconds, 's');
        self.nextTransitionTimestamp(firstTransition);
    });
    
    
    ////// Apply Bindings //////
    ko.applyBindings(self);
});
