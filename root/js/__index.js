$(function () {
    "use strict";
    
    ////// View Model //////
    var self = __sb.vm = {};
    var screensByName = {};
    self.getScreenByName = function getScreenByName(name) {
        return screensByName[name] || null;
    };
    self.screens = ko.observableArray([]);
    self.currentScreen = ko.observable(null);
    self.now = ko.observable(moment());
    self.updateNow = function updateNow() {
        self.now(moment());
    };
    setInterval(self.updateNow, __sb.config.tickSeconds * 1000);
    self.nowFormatted = ko.computed(function nowFormatted() {
        return self.now().format(__sb.config.momentLongFormat);
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
    __sb.fn.__loadAllScreens();
    
    
    ////// Apply Bindings //////
    ko.applyBindings(self);
});
