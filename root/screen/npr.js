__sb.fn.__addScreen('npr', function npr(self) {
    "use strict";
    
    self.getAjaxSettings = function getAjaxSettings() {
        return __sb.Screen.proxyAjaxSettings({
            method: 'GET',
            url: 'https://text.npr.org/'
        });
    };
    self.parseRawData = function parseRawData(rawData) {
        var doc = document.implementation.createHTMLDocument("dummy");
        doc.documentElement.innerHTML = rawData;
        var scripts = doc.querySelectorAll('script');
        $.each(scripts, function (i, script) {
            script.parentElement.removeChild(script);
        });
        var anchors = doc.querySelectorAll('a');
        $.each(anchors, function (i, anchor) {
            var oldAnchorHref = anchor.href;
            if (!/:\/\//.test(oldAnchorHref)) {
                anchor.href = 'https://text.npr.org/' + oldAnchorHref;
            }
            anchor.target = 'npr';
        });
        return {
            bodyHtml: doc.body.innerHTML
        };
    };
});
