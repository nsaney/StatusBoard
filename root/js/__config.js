__sb.config = {
    isProd: true,
    latitude: +33.7490,
    longitude: -84.3880
};

__sb.resources = {
    css: [
        // name[, dev]
        ['bootstrap', 'min'],
        ['bootstrap-theme', 'min'],
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
    // name, updateSeconds, required
    ['solar',   60*60,  true],
    ['weather', 10*60, false]
];
