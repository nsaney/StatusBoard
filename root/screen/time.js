__sb.fn.__addScreen('time', function time(self) {
    "use strict";
    self.start = function start() {
        if (self.__isStarted) { return; }
        self.__isStarted = true;
    };
});
