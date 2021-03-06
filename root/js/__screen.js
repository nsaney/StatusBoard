(function () {
    "use strict";
    
    ////// Constructor //////
    __sb.Screen = Screen;
    function Screen(root, initFields) {
        var self = this;
        self.root = root;
        self.setActive = function setActive(data, event, oldTimestamp) {
            var nextTransition = root.createNextTransitionTimestamp(oldTimestamp);
            nextTransition = moment.max(root.now(), nextTransition);
            root.nextTransitionTimestamp(nextTransition);
            root.currentScreen(self);
        };
        self.isActive = ko.computed(function isActive() {
            return root.currentScreen() === self;
        });
        initFields = initFields || {};
        self.INDEX = initFields.index || 0;
        self.NAME = initFields.name || 'Unknown';
        self.TEMPLATE_NAME = __sb.fn.getTemplateName(self.NAME);
        self.UPDATE_MS = (initFields.updateSeconds || -1) * 1000;
        self.COLOR_1 = initFields.color1 || 'auto';
        self.COLOR_2 = initFields.color2 || 'auto';
        self.REQUIRED = initFields.required || false;
        self.__isStarted = false;
        self.__timeoutId = -1;
        self.isUpdating = ko.observable(false);
        self.updateProgress = ko.observable(null);
        self.lastUpdateTimestamp = ko.observable(null);
        self.data = ko.observable(null);
        self.lastSuccessTimestamp = ko.observable(null);
        self.lastError = ko.observable(null);
        self.lastErrorTimestamp = ko.observable(null);
        self.lastErrorMessage = ko.computed(function lastErrorMessage() {
            var lastError = self.lastError();
            if (!lastError) { return 'No error.'; }
            return lastError.msg || lastError.message || (typeof lastError === 'string' ? lastError : JSON.stringify(lastError));
        });
        self.lastUpdateTooltip = ko.computed(function lastUpdateTooltip() {
            var lastUpdate = self.lastUpdateTimestamp();
            if (!lastUpdate) { return null; }
            var tooltip = lastUpdate.format(__sb.config.momentLongFormat);
            return tooltip;
        });
        self.nextUpdateTimestamp = ko.computed(function nextUpdate() {
            var lastUpdate = self.lastUpdateTimestamp();
            if (!lastUpdate) { return null; }
            var nextUpdate = lastUpdate.clone().add(self.UPDATE_MS, 'ms');
            return nextUpdate;
        });
        self.nextUpdateTooltip = ko.computed(function nextUpdateTooltip() {
            var nextUpdate = self.nextUpdateTimestamp();
            if (!nextUpdate) { return null; }
            var tooltip = nextUpdate.format(__sb.config.momentLongFormat);
            return tooltip;
        });
        self.timeFromLastUpdate = ko.computed(function timeFromLastUpdate() {
            var lastUpdate = self.lastUpdateTimestamp();
            if (!lastUpdate) { return 'Unknown.'; }
            var rootNow = self.root.now();
            return rootNow.to(lastUpdate);
        });
        self.timeToNextUpdate = ko.computed(function timeToNextUpdate() {
            var nextUpdate = self.nextUpdateTimestamp();
            if (!nextUpdate) { return 'Unknown.'; }
            var rootNow = self.root.now();
            return rootNow.to(nextUpdate);
        });
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
    };
    
    Screen.prototype.__doUpdate = function __doUpdate() {
        var self = this;
        if (self.isUpdating()) { return; }
        self.isUpdating(true);

        var promise = null;
        try {
            var ajaxSettings = self.getAjaxSettings();
            if (ajaxSettings === Screen.SPOOF_IN_PARSE_RAW_DATA) {
                promise = Screen.spoofAjax();
            }
            else {
                promise = Screen.callAjax(ajaxSettings);
            }
        }
        catch (ex) {
            promise = $.Deferred().reject(ex).promise();
        }
        
        promise.progress(promise_progress);
        function promise_progress(progressData) {
            try {
                self.updateProgress(progressData);
            }
            catch (ex) {
                console.log('Progress Error: ', ex);
            }
        }
        
        promise.done(promise_done);
        function promise_done(rawData) {
            try {
                var parsedData = self.parseRawData(rawData);
                self.data(parsedData);
                self.lastSuccessTimestamp(moment());
                self.lastError(null);
                self.lastErrorTimestamp(null);
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
            self.updateProgress(null);
            self.lastUpdateTimestamp(moment());
            self.root.updateNow();
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
    Screen.callIndividualAjax = function callIndividualAjax(ajaxSettings) {
        if (ajaxSettings.then) {
            return ajaxSettings;
        }
        var deferred = $.Deferred();
        var jqXhr = $.ajax(ajaxSettings);
        jqXhr.done(jqXhr_done);
        jqXhr.fail(jqXhr_fail);
        function jqXhr_done(rawData, _, __) {
            deferred.resolve(rawData);
        }
        function jqXhr_fail(_, __, errorThrown) {
            deferred.reject(errorThrown);
        }
        return deferred.promise();
    };
    
    Screen.callAjax = function callAjax(ajaxSettings) {
        if (!Array.isArray(ajaxSettings)) {
            return Screen.callIndividualAjax(ajaxSettings);
        }
        
        var deferred = $.Deferred();
        var resultMap = {};
        var promises = ajaxSettings.map(function (ajs, i) {
            var individualDeferred = $.Deferred();
            var ajaxPromise = Screen.callIndividualAjax(ajs);
            ajaxPromise.done(ajaxPromise_done);
            function ajaxPromise_done(rawData) {
                var key = ajs.NAME;
                if (!key) { key = '__result_' + i; }
                resultMap[key] = rawData;
                individualDeferred.resolve();
            }
            return individualDeferred.promise();
        });
        var promiseAll = $.when.apply($, promises);
        promiseAll.done(promiseAll_done);
        promiseAll.fail(promiseAll_fail);
        function promiseAll_done() {
            deferred.resolve(resultMap);
        }
        function promiseAll_fail(err) {
            deferred.reject(err);
        }
        return deferred.promise();
    };
    
    Screen.PROXY_URL = '/proxy/';
    Screen.proxyAjaxSettings = function proxyAjaxSettings(screen, ajaxSettings) {
        ajaxSettings.data = {
            method: ajaxSettings.method,
            url: ajaxSettings.url,
            jsonData: JSON.stringify(ajaxSettings.data || {})
        };
        ajaxSettings.method = 'POST';
        ajaxSettings.url = Screen.PROXY_URL + '?screen=' + screen.NAME;
        return ajaxSettings;
    };
    
    Screen.SPOOF_IN_PARSE_RAW_DATA = -1;
    Screen.spoofAjax = function spoofAjax() {
        var deferred = $.Deferred();
        deferred.resolve(null);
        return deferred.promise();
    };
    
})();
