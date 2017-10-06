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
    __sb.fn.__loadAllScreens = function loadAllScreens() {
        loadAll(__sb.screens, 'template', 'html', getScreenName, loadTemplate);
        loadAll(__sb.screens, 'screen', 'js', getScreenName, loadScript);
    };
    __sb.fn.getTemplateName = function getTemplateName(name) {
        return name + '-template';
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
    loadAll(__sb.resources.css, 'css', 'css', getResourceName, loadStyleSheet);
    loadAll(__sb.resources.js, 'js', 'js', getResourceName, loadScript);
    
    
    ////// Helper Functions //////
    
    //// Generic Loaders ////
    function loadAll(array, folder, extension, nameParser, loader) {
        loadIndividual(0);
        function loadIndividual(i) {
            var item = array && array[i];
            if (!item) { return; }
            var element = loadItem(item, folder, extension, nameParser, loader);
            element.onload = element.onerror = function elementOnLoad() {
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
    
    function loadStyleSheet(name, fullFileName) {
        var now = (new Date()).valueOf();
        var link = document.createElement('link');
        link.id = name;
        link.rel = 'stylesheet';
        link.href = fullFileName + '?_=' + now;
        document.head.appendChild(link);
        return link;
    }
    
    function loadScript(name, fullFileName) {
        var now = (new Date()).valueOf();
        var script = document.createElement('script');
        script.id = name;
        script.src = fullFileName + '?_=' + now;
        document.head.appendChild(script);
        return script;
    }
    
    function loadTemplate(name, fullFileName) {
        var script = document.createElement('script');
        script.id = __sb.fn.getTemplateName(name);
        script.type = 'text/html';
        document.head.appendChild(script);
        var result = { onload: __sb.fn.noop, onerror: __sb.fn.noop };
        $.get({
            url: fullFileName,
            mimeType: 'text/plain',
            cache: false,
            success: function loadSuccess(htmlText) {
                $(script).html(htmlText);
                result.onload(htmlText);
            },
            error: function loadError(_, __, errorThrown) {
                console.logError(errorThrown);
                result.onerror(errorThrown);
            }
        });
        return result;
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
