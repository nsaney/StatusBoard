(function () {
    "use strict";
    
    ////// Main Code //////
    
    //// General/Util Functions ////
    __sb.fn = {};
    __sb.fn.noop = function noop() {};
    __sb.fn.abstractMethod = function abstractMethod() {
        try { throw new Error('Warning! Unimplemented abstract method!'); }
        catch (ex) { console.log(ex); }
    };
    
    //// CYA ////
    if (!window.console) { window.console = {}; }
    if (!console.log) { console.log = __sb.fn.noop; }
    if (!console.logError) { console.logError = __sb.fn.noop; }
    window.onerror = function window_onerror(msg, source, line, col, err) {
        var errMsg = 'Error in ' + source + ': line ' + line + ', col ' + col;
        errMsg += '. Message: ' + msg;
        console.logError(errMsg, err);
    };
    
    //// Initialization ////
    loadAll(__sb.resources.css, 'css', 'css', getResourceName, loadCssFile);
    loadAll(__sb.resources.js, 'js', 'js', getResourceName, loadJsFile);
    __sb.fn.__loadAllScreens = function loadAllScreens() {
        loadAll(__sb.screens, 'screen', 'js', getScreenName, loadJsFile);
    };
    
    
    ////// Helper Functions //////
    
    //// Generic Loaders ////
    function loadAll(array, folder, extension, nameParser, loader) {
        loadIndividual(0);
        function loadIndividual(i) {
            var item = array && array[i];
            if (!item) { return; }
            var element = loadItem(item, folder, extension, nameParser, loader);
            element.onload = function elementOnLoad() {
                loadIndividual(i + 1);
            };
        }
    }
    function loadItem(item, folder, extension, nameParser, loader) {
        var name = nameParser(item);
        if (!name) { return; }
        var fullFileName = folder + '/' + name + '.' + extension;
        return loader(name, fullFileName);
    }
    
    function loadCssFile(name, fullFileName) {
        var link = document.createElement('link');
        link.id = name;
        link.rel = 'stylesheet';
        link.href = fullFileName;
        document.head.appendChild(link);
        return link;
    }
    
    function loadJsFile(name, fullFileName) {
        var script = document.createElement('script');
        script.id = name;
        script.src = fullFileName;
        document.head.appendChild(script);
        return script;
    }
    
    //// Resource Loading ////
    function getResourceName(resourceItem) {
        var resourceName = null;
        if (!resourceItem) {
            console.logError('Blank resource item given: ' + resourceItem);
        }
        else if (typeof resourceItem === 'string') {
            resourceName = resourceItem;
        }
        else if ((typeof resourceItem[0] === 'string') && (typeof resourceItem[1] === 'string')) {
            resourceName = resourceItem[0];
            if (__sb.config.isProd) {
                resourceName += '.' + resourceItem[1];
            }
        }
        else {
            console.logError('Could not parse resource item: ' + resourceItem);
        }
        return resourceName;
    }
    
    //// Screen Loading ////
    function getScreenName(screenItem) {
        var screenName = null;
        if (!screenItem) {
            console.logError('Blank screen item given: ' + screenItem);
        }
        else if (typeof screenItem[0] === 'string') {
            screenName = screenItem[0];
        }
        else {
            console.logError('Could not parse screen item: ' + screenItem);
        }
        return screenName;
    }
    
})();