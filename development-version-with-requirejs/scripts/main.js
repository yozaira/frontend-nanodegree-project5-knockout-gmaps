// Declare this variable before loading RequireJS library

require.config({
    // path config is relative to the baseUrl, and
    // never includes a ".js" extension since
    // the paths config could be for a directory.
    paths: {
        knockout: [
            "https://cdnjs.cloudflare.com/ajax/libs/knockout/3.2.0/knockout-min",
            // if cdn goes fails, load from this location
            "vendor/knockout-3.2.0.min"
        ],
        jquery: [
            "http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min",
            "vendor/jquery.min"
        ],
        mapInfoBox: [
           'http://google-maps-utility-library-v3.googlecode.com/svn/trunk/infobubble/src/infobubble-compiled',
           "vendor/infobubble.min"
        ]
    }
});


require([
    'knockout', // use this same name on the appView define()
    'jquery',
    'mapInfoBox',
    'app/MapViewModel',
    'app/map-options',
    'app/api-lib'
    ],
    function(ko, $, infB, MapViewModel) {
      ko.applyBindings(new MapViewModel());
  }
);


// global onError handler that will catch any errors not already handled by "errbacks"
requirejs.onError = function (err) {
    console.log(err.requireType);
    // err has the same info as the errback callback:
    // err.requireType & err.requireModules
    if (err.requireType === 'timeout') {
        console.log('modules: ' + err.requireModules);
    }

    throw err;
};