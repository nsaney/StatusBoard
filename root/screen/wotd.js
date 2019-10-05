__sb.fn.__addScreen('wotd', function wotd(self) {
    "use strict";
    
    self.getAjaxSettings = function getAjaxSettings() {
        return __sb.Screen.proxyAjaxSettings(self, {
            method: 'GET',
            url: 'https://www.dictionary.com/e/word-of-the-day/'
        });
    };
    self.parseRawData = function parseRawData(rawData) {
        var doc = document.implementation.createHTMLDocument("dummy");
        doc.documentElement.innerHTML = rawData;
        var wotdItem = doc.querySelector('li.wotd-item') || {};
        var wotdPronDiv = doc.querySelector('div.wotd-item__definition__pronunciation') || {};
        var wotdDefDiv = doc.querySelector('div.wotd-item__definition__text') || {};
        var data = wotdItem.dataset || {};
        data.pronunciationHtml = (wotdPronDiv.innerHTML || '').trim();
        data.definitionText = (wotdDefDiv.innerText || '').trim();
        //console.log(data);
        return data;
    };
});
