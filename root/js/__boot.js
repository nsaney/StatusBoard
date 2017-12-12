(function () {
    "use strict";
    
    ////// Main Code //////
    __sb.bootTime = (new Date()).valueOf();
    
    //// General/Util Functions ////
    __sb.fn = {};
    __sb.fn.noop = function noop() {};
    __sb.fn.abstractMethod = function abstractMethod() {
        try { throw new Error('Warning! Unimplemented abstract method!'); }
        catch (ex) { console.log(ex); }
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
    __sb.fn.__loadAllScreens = function loadAllScreens() {
        var allScreensLoaded = $.Deferred();
        loadAll(__sb.screens, 'template', 'html', getScreenName, loadTemplate, afterTemplates);
        function afterTemplates() {
            loadAll(__sb.screens, 'screen', 'js', getScreenName, loadScript, afterScreens);
        }
        function afterScreens() {
            allScreensLoaded.resolve();
        }
        return allScreensLoaded.promise();
    };
    
    
    ////// Helper Functions //////
    
    //// Generic Loaders ////
    function loadAll(array, folder, extension, nameParser, loader, endFn) {
        loadIndividual(0);
        function loadIndividual(i) {
            var item = array && array[i];
            if (!item) {
                if (typeof endFn === 'function') { endFn(); }
                return;
            }
            var element = loadItem(item, folder, extension, nameParser, loader);
            element.onload = getEventFn(i, element, elementOnLoad);
            element.onerror = getEventFn(i, element, elementOnError);
            function getEventFn(index, element, eventFn) {
                return function doEvent(e) {
                    eventFn(element, e);
                    afterProcessElement(index);
                };
            }
            function elementOnLoad(element) {
                //console.log('Loaded: ', element);
            }
            function elementOnError(element, e) {
                //console.logError('Error loading: ', element, e);
            }
            function afterProcessElement(index) {
                loadIndividual(index + 1);
            }
        }
    }
    function loadItem(item, folder, extension, nameParser, loader) {
        var name = nameParser(item);
        if (!name) { return; }
        var fullFileName = folder + '/' + name + '.' + extension;
        return loader(name, fullFileName);
    }
    
    function loadStyleSheet(name, fullFileName) {
        var link = document.createElement('link');
        link.id = name;
        link.rel = 'stylesheet';
        link.href = fullFileName + '?_=' + __sb.bootTime;
        document.head.appendChild(link);
        return link;
    }
    
    function loadScript(name, fullFileName) {
        var script = document.createElement('script');
        script.id = name;
        script.src = fullFileName + '?_=' + __sb.bootTime;
        document.head.appendChild(script);
        return script;
    }
    
    function loadTemplate(name, fullFileName) {
        var script = document.createElement('script');
        script.id = __sb.fn.getTemplateName(name);
        script.type = 'text/html';
        document.head.appendChild(script);
        var result = { id: script.id, onload: __sb.fn.noop, onerror: __sb.fn.noop };
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
        else if (Array.isArray(resourceItem)) {
            resourceName = resourceItem[0];
            var prodSuffix = resourceItem[1];
            var devSuffix = resourceItem[2];
            if (__sb.config.isProd && prodSuffix) {
                resourceName += '.' + prodSuffix;
            }
            else if (!__sb.config.isProd && devSuffix) {
                resourceName += '.' + devSuffix;
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
