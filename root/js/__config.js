__sb.config = {
    isProd: false,
    tickSeconds: 1,
    momentLongFormat: 'dddd, MMMM Do YYYY, h:mm:ss a',
    latitude: +33.7490,
    longitude: -84.3880
};

__sb.resources = {
    css: [
        // name[, dev]
        ['bootstrap', 'min'],
        ['bootstrap-theme', 'min'],
        'sticky-footer',
        '__index'
    ],
    js: [
        // name[, dev]
        ['moment', 'min'],
        ['jquery-3.2.1', 'min'],
        ['bootstrap', 'min'],
        ['knockout-3.4.2', 'debug'],
        '__screen',
        '__index'
    ]
};

__sb.screens = [
    // name, updateSeconds, color1, color2, required
    ['solar',   60*60, 'black', 'magenta',  true],
    ['weather', 10*60, 'white',   'green', false]
];
