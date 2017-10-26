__sb.fn.__addScreen('time', function time(self) {
    "use strict";
    self.start = function start() {
        if (this.__isStarted) { return; }
        this.__isStarted = true;
    };
});
