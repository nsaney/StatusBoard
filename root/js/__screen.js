(function () {
    "use strict";
    
    ////// Constructor //////
    __sb.Screen = Screen;
    function Screen(initFields) {
        initFields = initFields || {};
        this.NAME = initFields.name || 'Unknown';
        this.UPDATE_MS = (initFields.updateSeconds || -1) * 1000;
        this.REQUIRED = initFields.required || false;
        this.__isStarted = false;
        this.__timeoutId = -1;
        this.isUpdating = ko.observable(false);
        this.data = ko.observable(null);
        this.lastSuccessTimestamp = ko.observable(null);
        this.lastErrorTimestamp = ko.observable(null);
        this.lastError = ko.observable(null);
    };
    
    ////// Abstract Methods //////
    Screen.prototype.getAjaxSettings = __sb.fn.abstractMethod;
    
    ////// Default Methods //////
    Screen.prototype.parseRawData = function parseRawData(rawData) {
        return rawData;
    };
    
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
        if (self.isUpdating()) { return; }
        self.isUpdating(true);
        
        var ajaxSettings = self.getAjaxSettings();
        var promise = null;
        if (ajaxSettings === Screen.SPOOF_IN_PARSE_RAW_DATA) {
            promise = Screen.spoofAjax();
        }
        else {
            promise = Screen.callAjax(ajaxSettings);
        }
        
        promise.done(promise_done);
        function promise_done(rawData) {
            try {
                var parsedData = self.parseRawData(rawData);
                self.data(parsedData);
                self.lastSuccessTimestamp(moment());
            }
            catch (ex) {
                promise_fail(ex);
            }
        }
        
        promise.fail(promise_fail);
        function promise_fail(errorThrown) {
            self.lastError(errorThrown);
            self.lastErrorTimestamp(moment());
            console.logError(errorThrown);
        }
        
        promise.always(promise_always);
        function promise_always() {
            self.isUpdating(false);
            window.clearTimeout(self.__timeoutId);
            if ((typeof self.UPDATE_MS === 'number') && self.UPDATE_MS >= 5000) {
                self.__timeoutId = window.setTimeout(
                    redoUpdate, 
                    self.UPDATE_MS
                );
                function redoUpdate() { self.__doUpdate(); }
            }
        }
    };
    
    ////// Static Methods //////
    Screen.callAjax = function callAjax(ajaxSettings) {
        var deferred = $.Deferred();
        var jqXhr = $.ajax(ajaxSettings);
        jqXhr.done(jqXhr_done);
        function jqXhr_done(rawData, textStatus) {
            deferred.resolve(rawData);
        }
        jqXhr.fail(jqXhr_fail);
        function jqXhr_fail(_, __, errorThrown) {
            deferred.reject(errorThrown);
        }
        return deferred.promise();
    };
    
    Screen.SPOOF_IN_PARSE_RAW_DATA = -1;
    Screen.spoofAjax = function spoofAjax() {
        var deferred = $.Deferred();
        deferred.resolve(null);
        return deferred.promise();
    };
    
})();
