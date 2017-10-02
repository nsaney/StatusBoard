(function () {
    "use strict";
    
    ////// Constructor //////
    __sb.Screen = Screen;
    function Screen(initFields) {
        initFields = initFields || {};
        this.NAME = initFields.name || 'Unknown';
        this.UPDATE_MS = initFields.updateMs || -1;
        this.__isStarted = false;
        this.__timeoutId = -1;
        this.data = ko.observable(null);
        this.lastSuccessTimestamp = ko.observable(null);
        this.lastErrorTimestamp = ko.observable(null);
        this.lastError = ko.observable(null);
    };
    
    ////// Abstract Methods //////
    Screen.prototype.getAjaxSettings = __sb.fn.abstractMethod;
    
    ////// Default Methods //////
    Screen.prototype.parseData = function parseData(data) {
        return data;
    }
    
    ////// Concrete Methods //////
    Screen.prototype.start = function start() {
        if (this.__isStarted) { return; }
        this.__isStarted = true;
        this.__doUpdate();
    };
    
    Screen.prototype.stop = function stop() {
        if (!this.__isStarted) { return; }
        this.__isStarted = false;
        window.clearTimeout(this.__timeoutId);
    }
    
    Screen.prototype.__doUpdate = function __doUpdate() {
        var self = this;
        var ajaxSettings = self.getAjaxSettings();
        var jqXhr = $.ajax(ajaxSettings);
        
        jqXhr.done(onSuccess);
        function onSuccess(data, textStatus, __) {
            try {
                var parsedData = self.parseData(data);
                self.data(parsedData);
                self.lastSuccessTimestamp(new Date());
            }
            catch (ex) {
                onError(jqXhr, textStatus, ex);
            }
        }
        
        jqXhr.fail(onError);
        function onError(__, textStatus, errorThrown) {
            self.lastError(errorThrown);
            self.lastErrorTimestamp(new Date());
        }
        
        jqXhr.always(onComplete);
        function onComplete() {
            window.clearTimeout(self.__timeoutId);
            if ((typeof self.UPDATE_MS === 'number') && self.UPDATE_MS >= 5000) {
                self.__timeoutId = window.setTimeout(
                    redoUpdate, 
                    self.UPDATE_MS
                );
                function redoUpdate() {
                    self.__doUpdate();
                }
            }
        }
    };
    
})();