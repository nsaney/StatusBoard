$(function () {
    "use strict";
    
    ////// View Model //////
    var self = __sb.vm = {};
    self.screens = ko.observableArray([]);
    self.currentScreen = ko.observable(null);
    self.setActive = function setActive(s) {
        return function setActiveScreen() {
            self.currentScreen(s);
        };
    };
    self.isActive = function isActive(s) {
        return ko.computed(function screenIsActive() {
            return self.currentScreen() === s;
        });
    };
    
    ////// Functions //////
    __sb.fn.__addScreen = function __addScreen(name, initFn) {
        var screenItem = ko.utils.arrayFirst(__sb.screens, function nameFilter(item) {
            return item && Array.isArray(item) && (item[0] === name);
        });
        if (!screenItem) {
            throw new Error('Unknown screen: ' + name);
        }
        
        var screen = new __sb.Screen({
            name: name,
            updateSeconds: (screenItem[1] || -1),
            required: (screenItem[2] || false)
        });
        initFn.call(screen);
        
        self.screens.push(screen);
        if (self.screens().length == 1) {
            self.currentScreen(screen);
        }
        
        screen.start();
    };
    __sb.fn.__loadAllScreens();
    
    ////// Apply Bindings //////
    ko.applyBindings(self);
});
