 (function(window, google, mapLib) {

    // object literal containing the properties we want to pass to the map
    // https://developers.google.com/maps/documentation/javascript/controls
    mapLib.MAP_OPTIONS = {
      center: {
        lat : 33.7833019,
        lng: -84.3828403
      },
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true ,
      scrollwheel: false,
      panControl: false,
      draggable:true,
      // panControl: true,
      panControlOptions: {
        position: google.maps.ControlPosition.TOP_RIGHT
      },
      zoom: 14,
      zoomControl: true,
      zoomControlOptions: {
        style: google.maps.ZoomControlStyle.SMALL,
        position: google.maps.ControlPosition.TOP_LEFT
      },
      mapTypeControl: false,
      mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: google.maps.ControlPosition.TOP_CENTER
      }

    };

  } (window, google, window.mapLib || (window.mapLib = {} ) ) );
