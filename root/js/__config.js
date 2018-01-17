__sb.config = {
    isProd: false,
    tickSeconds: 1,
    screenSeconds: 15,
    momentLongFormat: 'dddd, MMMM Do YYYY, h:mm:ss a',
    momentShortTimeFormat: 'HH:mm:ss',
    latitude: +33.7490,
    longitude: -84.3880
};

__sb.resources = {
    css: [
        // name[, prod[, dev]]
        ['bootstrap', 'min'],
        ['bootstrap-theme', 'min'],
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
    // name, updateSeconds,  color1,    color2, required
    ['time',               0, 'white',   'black',  true],
    ['solar',          15*60, 'black',  'yellow',  true],
    ['lunar',          15*60, 'white',    'gray',  true],
    ['wotd',           15*60, 'black',  'orange',  true],
    ['npr',            15*60, 'white', '#ff3300', false],
    ['forecast',       30*60, 'white',    'blue', false],
    ['severe-weather',  5*60, 'white',    'navy',  true]
];
