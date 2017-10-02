$(function () {
    "use strict";
    
    ////// View Model //////
    __sb.vm = {};
    __sb.vm.screens = ko.observableArray([]);
    
    ////// Functions //////
    __sb.fn.__addScreen = function __addScreen(screen) {
        __sb.vm.screens.push(screen);
        screen.start();
    };
    __sb.fn.__loadAllScreens();
    
    ////// Apply Bindings //////
    ko.applyBindings(__sb.vm);
});