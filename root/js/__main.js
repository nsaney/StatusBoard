(function () {
    "use strict";
    
    ////// Main Code //////
    
    //// CYA ////
    var noop = function () {};
    if (!window.console) { window.console = {}; }
    if (!console.log) { console.log = noop; }
    if (!console.logError) { console.logError = noop; }
    window.onerror = function (msg, source, line, col, err) {
        var errMsg = 'Error in ' + source + ': line ' + line + ', col ' + col;
        errMsg += '. Message: ' + msg;
        console.logError(errMsg, err);
    };
    
    //// Initialization ////
    __sb.resources.css.map(loadResource('css', 'css', loadCssFile));
    __sb.resources.js.map(loadResource('js', 'js', loadJsFile));
    
    
    ////// Functions //////
    
    //// Resource Loading ////
    function loadResource(folder, extension, loader) {
        return function (resource) {
            var fileName = getFileName(resource, extension);
            var fullFileName = folder + '/' + fileName;
            loader(fullFileName);
        };
    }
    
    function loadCssFile(fullFileName) {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = fullFileName;
        document.head.appendChild(link);
    }
    
    function loadJsFile(fullFileName) {
        var script = document.createElement('script');
        script.src = fullFileName;
        document.head.appendChild(script);
    }
    
    function getFileName(resource, extension) {
        var fileName = null;
        if (!resource) {
            console.logError('Blank resource given: ' + resource);
        }
        else if (typeof resource === 'string') {
            fileName = resource + '.' + extension;
        }
        else if ((typeof resource[0] === 'string') && (typeof resource[1] === 'string')) {
            fileName = resource[0];
            if (__sb.config.isProd) {
                fileName += '.' + resource[1];
            }
            fileName += '.' + extension;
        }
        else {
            console.logError('Could not parse resource: ' + resource);
        }
        return fileName;
    }
    
    
})();