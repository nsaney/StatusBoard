$(function () {
    "use strict";
    
    ////// View Model //////
    __sb.vm = {};
    __sb.vm.screens = ko.observableArray([]);
    
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
        
        __sb.vm.screens.push(screen);
        screen.start();
    };
    __sb.fn.__loadAllScreens();
    
    ////// Apply Bindings //////
    ko.applyBindings(__sb.vm);
});
