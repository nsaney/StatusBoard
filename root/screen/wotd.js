__sb.fn.__addScreen('wotd', function wotd(self) {
    "use strict";
    
    self.getAjaxSettings = function getAjaxSettings() {
        return __sb.Screen.proxyAjaxSettings(self, {
            method: 'GET',
            url: 'https://www.dictionary.com/wordoftheday/'
        });
    };
    self.parseRawData = function parseRawData(rawData) {
        var doc = document.implementation.createHTMLDocument("dummy");
        doc.documentElement.innerHTML = rawData;
        var img = doc.querySelectorAll('.wotd-today a[href*="dictionary.com/browse"] img')[0];
        var data = {
            imageAlt: img.alt || '',
            imageSrc: img.src,
            imageSrcUrl: 'url("' + img.src + '")'
        };
//        console.log(data);
        return data;
    };
});
