__sb.fn.__addScreen('wotd', function wotd(self) {
    "use strict";
    
    self.getAjaxSettings = function getAjaxSettings() {
        return __sb.Screen.proxyAjaxSettings({
            method: 'GET',
            url: 'http://www.dictionary.com/wordoftheday/'
        });
    };
    self.parseRawData = function parseRawData(rawData) {
        var doc = document.implementation.createHTMLDocument("dummy");
        doc.documentElement.innerHTML = rawData;
        var img = doc.querySelectorAll('.wotd-today a[href*="dictionary.com/browse"] img')[0];
        return {
            imageSrc: img.src,
            imageSrcUrl: 'url("' + img.src + '")'
        };
    };
});
