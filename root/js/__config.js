__sb.config = {
    isProd: false,
    tickSeconds: 1,
    screenSeconds: 20,
    momentLongFormat: 'dddd, MMMM Do YYYY, h:mm:ss a',
    latitude: +33.7490,
    longitude: -84.3880
};

__sb.resources = {
    css: [
        // name[, prod[, dev]]
        ['bootstrap', 'min'],
        ['bootstrap-theme', 'min'],
        'sticky-footer',
        '__index'
    ],
    js: [
        // name[, prod[, dev]]
        ['moment', 'min'],
        ['jquery-3.2.1', 'min'],
        ['bootstrap', 'min'],
        ['knockout-3.4.2', null, 'debug'],
        '__screen',
        '__index'
    ]
};

__sb.screens = [
    // name, updateSeconds, color1, color2, required
    ['solar',   60*60, 'black', 'yellow',  true],
    ['lunar',   60*60, 'white',   'gray',  true],
    ['wotd',    60*60, 'black', 'orange',  true],
    //['weather', 10*60, 'white',   'blue', false]
];
