/**
 * The view model instantiations and logic setup will
 * be applied in knockout view bindings once the dom is loaded.
 */
(function($) {
  'use strict'

  /* main viewmodel class */
  function MapViewModel() {
    /* class with marker basic info to create vender markers */
    var MapMarker = function (marker, name, category, position) {
      this.marker = marker;
      this.name = name;
      this.category = category;
      this.position = position;
    };


    /**
    * setting var self = this; at the top of every view model makes
    * it easier to track 'this'. This causes some messiness, but results
    * in easier to read code than passing 'this' everywhere, and also
    * helps prevent bugs where the value of this is misunderstood
    * in computed observables.
    */
    var self = this;
    var map;
    var geocoder;
    var service;
    var mapBounds;
    var infowindow;
    var mapInfoBubble;
    /* array to keep track of neighborhood markers */
    self.localityMarkers = ko.observableArray([]);
    /* array to keep track of venue markers */
    self.venueMarkers = ko.observableArray([]);
    /*
    * entry to search by location or ciy. The default
    * location is set to my locality.
    */
    self.neighborhood = ko.observable('Midtown, Atlanta');
    /* popular places in defined neighborhood */
    self.popularPlacesList = ko.observableArray([]);
    /*
    * array to store places searched by keywords.
    * https://www.airpair.com/knockout/posts/top-10-mistakes-knockoutjs
    * Read item 7.
    */
    self.filteredPlacesList = ko.observableArray(self.popularPlacesList() );
    /* entry to search places by keyword */
    self.keywordToSearch = ko.observable('');
    /* boolean value to hide or show the list of places displayed on the view */
    self.showList = ko.observable(true);
    /* boolean value to hide or show the the input to search for locations */
    self.showLocationSearch = ko.observable(true);
    /* error message */
    self.errorMessage = ko.observable('');
    /* class will be active if there is an error without adding class att to the error div */
    self.errorClass   = ko.observable('');
    /* boolean value for mobile slider with touch event */
    self.leftArrowTouch  = ko.observable(false);
    self.rightArrowTouch = ko.observable(true);


    /* initialize the map */
    function initializeMap() {
      // library with map options
      var mapOptions;
      var mapOptions = mapLib.MAP_OPTIONS;
      map = new google.maps.Map(document.getElementById('map'), mapOptions);
      infowindow = new google.maps.InfoWindow();
    }
    /**
    * Initialize the app once the DOM and the Google Maps API is
    * successfully loaded. If not, display an error.
    */
    if(  typeof google === 'object'
      && typeof google.maps === 'object'
      && typeof google.maps.event === 'object'
      && typeof google.maps.places === 'object') {

        $('#spinner').hide();
        google.maps.event.addDomListener(window, 'load', initializeMap() );

    } else {
        $('#spinner').show();
        /**
        * For some reason I dont understand, error function I created,
        * doest not show when google map link on the view is deactivated.
        * other than that, this function is doing its job. As an alternative,
        * I output an alert message, which is also visible to the user.
        */
        alert('Error: There was a problem with Google Mpas. Please reload the page.');
        self.errorMessage('The map could not be loaded. Please reload the page.');
        self.errorClass('error-message');
    }


    /**
    * if venueMarkers array has items it means there was a previous
    * request. When a new request is made, remove the old location
    * markers and  display the markers for the new requested location.
    */
    self.updateMarkers = ko.computed(function() {
      if(self.neighborhood() != '') {
        if(self.venueMarkers().length > 0) {
          removeVenueMarkers();
        }
        removeNeighborhoodMarker();
        //requestNeighborhood(self.neighborhood());
        requestGeolocation(self.neighborhood());
        self.keywordToSearch('');
      }
    },{ pure: true });



    /**
    * remove neighborhood marker from the map this method is
    * called when neighborhood is newly defined.
    */
    function removeNeighborhoodMarker() {
      for(var i in self.localityMarkers()) {
         self.localityMarkers()[i].setMap(null);
         self.localityMarkers()[i] = null;
      }
      while (self.localityMarkers().length > 0) {
         self.localityMarkers().pop();
      }
    }


    /**
    * remove markers of popular places from the map
    * this method is called when neighborhood is newly defined
    */
    function removeVenueMarkers() {
      for (var i in self.venueMarkers()) {
        self.venueMarkers()[i].marker.setMap(null);
        self.venueMarkers()[i].marker = null;
      }
      while (self.venueMarkers().length > 0) {
        self.venueMarkers().pop();
      }
    }



    /* filtering method for map markers */
    function filteringMarkersBy(keyword) {
      for (var i in self.venueMarkers()) {
        if (self.venueMarkers()[i].marker.map === null) {
           self.venueMarkers()[i].marker.setMap(map);
        }
        if(self.venueMarkers()[i].name.indexOf(keyword) === -1 &&
          self.venueMarkers()[i].category.indexOf(keyword) === -1) {
          self.venueMarkers()[i].marker.setMap(null);
        }
      }
    }



    /**
    * when click on any venue on the list, trigger
    * click event  to open the map marker with same
    * venue
    */
    self.clickMarker = function(venue) {
      // console.log(venue);
      var venueName = venue.venue.name.toLowerCase();
      for(var i in self.venueMarkers()) {
          // console.log(self.venueMarkers()[i].marker);
          if (self.venueMarkers()[i].name === venueName) {
           google.maps.event.trigger(self.venueMarkers()[i].marker, 'click');
           map.panTo(self.venueMarkers()[i].position);
         }
      }
    };



    /**
    * this method is executed when the markers are updated
    * (using updateMarkers method) upon user making a new
    * search for a location in the neiborhood input.
    */
    function requestNeighborhood(neighborhood) {
      var request = {
        query: neighborhood
      };
      /* request neighborhood location data from PlaceService */
      service = new google.maps.places.PlacesService(map);
      service.textSearch(request,
        function(results, status) {
          if(status == google.maps.places.PlacesServiceStatus.OK) {
            self.findFourSquerelocalityPlaces(map,'topPicks', results[0]);
          }
        }
      );
    }



    function requestGeolocation(neighborhood) {
      /**
      *  use Geocode() to find the requested locality and pass the
      *  result to  findFourSquerelocalityPlaces method to get FS near
      *  locality popular places
      */
      geocoder = new google.maps.Geocoder();
      geocoder.geocode( {'address': neighborhood},
        function(results, status) {
          if(status == google.maps.GeocoderStatus.OK) {
            // result[0] is the most approximate geolocation
            // console.log(results);
            // console.log(results[0]);

            /**
            * the geocode result[0] object is passed as neiborhood param
            *  in findFourSquerelocalityPlaces() method. At the same time,
            *  this method calls APIs.fSquare.popularPlacesByLocation(),
            *  which uses ll param in the FS request to find popular places
            *  by locality.
            */
            self.findFourSquerelocalityPlaces(map, 'topPicks', results[0]);

          } else {
              self.errorMessage('There was a problem requestiong the location: ' + status);
              self.errorClass("alert alert-danger");
          }
        }
      );
    }



    /**
    * This method gets popular places from API and set neighborhood
    * marker on the map
    */
    self.findFourSquerelocalityPlaces = function(map, keyword, placeLoc){
      /**
      * placeLoc param is a geocoder result generated from the search
      * of neiborhood  or locality. This result (result[0]) is passad to
      * this method when is called in requestGeolocation() function
      */

      // check placeLoc data
      // console.log(placeLoc);

      /**
      * define variables for locality marker and get the lat
      * and lng of the of the requested location to find fsquare
      * popular places by locality
      */
      var lat = placeLoc.geometry.location.lat();
      var lng = placeLoc.geometry.location.lng();
      var localityCenter = new google.maps.LatLng(lat, lng);
      var localityName = placeLoc.formatted_address;
      var popularPlace;

      /* create the neighborhood markers */
      self.createLocalityMarker(map, localityName, localityCenter, 'images/location.png');

      /* API was abstratcted into its own library */
      var fsUrl = APIs.fSquare.popularPlacesByLocation(keyword, lat, lng);

      /* diplay the spinner image to le the user know tha data is being requested */
      $('#spinner').show();

      $.getJSON (fsUrl)
        .done(function (data) {

          $('#spinner').hide();
          // console.log(data.response);
          // console.log(data.response.groups[0].items[0]);
          /**
          * NOTE: "Pushing multiple times into observable arrays can cause significant
          * performance issues with your application".
          * Read (iten 7): https://www.airpair.com/knockout/posts/top-10-mistakes-knockoutjs
          */
          // self.popularPlacesList().push(data.response.groups[0].items);
          // self.popularPlacesList(data.response.groups[0].items);
          // console.log(self.popularPlacesList());

          /**
          * store places in an observable array to filter them by keyword
          * search and display them on the list later.
          *
          * What is stored this here will affect the result of computed
          * function displayList.
          *
          * We will store items object instead of venues to have access to
          * other objects on the same level that venue, like  tips. When
          * popularPlacesList() is iterated over in displayList, we will be
          * able to display tips on the view.
          */
          self.popularPlacesList(data.response.groups[0].items);

          self.items = ko.utils.arrayForEach(self.popularPlacesList(),
            function(place) {
              popularPlace = place.venue;
              // console.log(popularPlace);
              createVenueMarkers(popularPlace)
            }
          );
          /**
          * Adjust markers bounds and the map zoom level.
          * Note: FS response suggested bounds does not
          * seem to work.
          */
          self.adjustMapBounds();
      })
      .fail( function(error, status){
          //console.log(error);
          //console.log(status);
          //console.log(error.getResponseHeader('Origin'));
          //console.log(error.getAllResponseHeaders());
          if (error.status === "timeout"){
            // console.log(error.status);
            self.errorMessage("Something is wrong with the connection. Please, try again.");
            self.errorClass('error-message');
          }
          else if (error.statusText === "error" ){
            /**
            * If we are catching an error here, it means that an  unexpected
            * exception has been raised. This should result in a status code
            * of '500 Internal Server Error'.
            */
            console.log(error.statusText);
            self.errorMessage('Foursquare servers are experiencing problems. Please, try again later.');
            self.errorClass('error-message');
          }
          else if (typeof error.responseJSON === 'object') {
            /**
            * if there is a responseJSON, the connction with the server was
            * stablished but there was a malformed request.
            */
            // console.log('then error.responseJSON !== undefined');
            // console.log(error.responseJSON.meta.errorDetail);
            self.errorMessage('Data request failed. Please, reload the page or try again later. ');
            self.errorClass('error-message');
          }
      });

    }; // end func


    self.getUserGeolocation = function() {

      if(navigator.geolocation) {
          navigator.geolocation.getCurrentPosition ( function(position) {
            var latitude =  position.coords.latitude;
            var longitude = position.coords.longitude;
            var userLocation = new google.maps.LatLng(latitude, longitude);
            // console.log(userLocation);
            // Reverse Geocoding
            // https://developers.google.com/maps/documentation/javascript/geocoding#ReverseGeocoding
            geocoder = new google.maps.Geocoder();
            geocoder.geocode({'latLng': userLocation}, function(results, status) {
              if (status == google.maps.GeocoderStatus.OK) {
                 /*
                 *compare to console.logo(placeData) on findFourSquarePlaces()
                 * method. Should be the same object.
                 */
                 console.log(results[0]);
                 /*
                 * remove markers of previous requests before adding the markers
                 * of the the new request for user geolocation
                 */
                 if(self.venueMarkers().length > 0) {
                    removeVenueMarkers();
                 }
                 removeNeighborhoodMarker();

                 self.findFourSquerelocalityPlaces(map, 'topPicks', results[0]);
              } else {
                self.errorMessage('There was a problem requestiong the location: '+ status);
                self.errorClass("alert alert-danger");
              }
            });

            /* if something went goes with user geolocation request, show erros */
          }, function() {
             handleNoGeolocation(true);
          });

      } else {
          self.errorMessage("Geolocation is not supported by this browser.");
          self.errorClass('error-message');
      }
    };


    /* html5 geolocation error handling */
    // http://www.codekhan.com/2012/01/how-to-handle-errors-that-we-get-while.html
    function handleNoGeolocation(error) {
      if(error) {
          switch(error.code) {
            case error.PERMISSION_DENIED:
              self.errorMessage("The Geolocation service failed: User denied the request for Geolocation.");
              self.errorClass('error-message');
              break;
            case error.POSITION_UNAVAILABLE:
              self.errorMessage("The Geolocation service failed: Location information is unavailable.");
              self.errorClass('error-message');
              break;
            case error.TIMEOUT:
              self.errorMessage("The Geolocation service failed: The request to get user location timed out.");
              self.errorClass('error-message');
              break;
            case error.UNKNOWN_ERROR:
              self.errorMessage("The Geolocation service failed: An unknown error occurred.");
              self.errorClass('error-message');
              break;
          }
      } else {
        self.errorMessage('Error: Your browser doesn\'t support geolocation.');
        self.errorClass('error-message');
      }
    };



    /* create map markers of neiborhood or location */
    self.createLocalityMarker = function(map, name, location, iconImg) {
      var marker = new google.maps.Marker({
        map: map,
        title: name,
        position: location,
        icon: iconImg,
        //animation: google.maps.Animation.DROP
        animation: google.maps.Animation.BOUNCE
      });
      self.localityMarkers().push(marker);
      // console.log(self.localityMarkers());

      // create the event listener. It now has access to the values of i and marker
      // as they were during its creation
      google.maps.event.addListener(marker, 'click', function() {
        if(typeof infowindow != 'undefined')
          infowindow.close();
          infowindow = new google.maps.InfoWindow();
          // setting the content of the InfoWindow
          infowindow.setContent(name);
          infowindow.open(map, marker);
      });
    };


    /* create map markers of popular places */
    function createVenueMarkers(venue) {
      var lat = venue.location.lat;
      var lng = venue.location.lng;
      /* convert name and category to Lower case so the
      * same values can be found when searching  a for
      * match on clickMarker func.
      */
      var name = venue.name.toLowerCase();
      var position = new google.maps.LatLng(lat, lng);
      var category = venue.categories[0].name.toLowerCase();
      var address  = venue.location.address;
      var city     = venue.location.formattedAddress[1];
      var country  = venue.location.country;
      var fsUrl = "https://foursquare.com/v/" + venue.id;
      var rating = venue.rating;

      var ratingImg;
      var halfRating = rating / 2;
        if(halfRating >= 4.9) {
          ratingImg = 'images/star-5.0.png';
        } else if (halfRating < 4.9 && halfRating >= 4.25) {
          ratingImg = 'images/star-4.5.png';
        } else if (halfRating < 4.25 && halfRating >= 3.75) {
          ratingImg = 'images/star-4.0.png';
        } else if (halfRating < 3.75 && halfRating >= 3.25) {
          ratingImg = 'images/star-3.5.png';
        } else if (halfRating < 3.25 && halfRating >= 2.75) {
          ratingImg = 'images/star-3.0.png';
        } else {
          ratingImg = 'images/star-2.5.png';
        }

      /* content for infowindow */
      var infoContent = '<div class="container infowindow">'
      + '<p><a href="'+ fsUrl +'" target="_blank">'
      + '<span class="v-name">' + name +'</span>'
      +'</a></p>'
      + '<p class="v-category"><span>'+ category +'</span></p>'
      + '<p class="v-address"><span>'
      +  address + ', ' + city + ', ' + country +'.'
      + '<span></p>';

      var ratingContent;
      if(rating != undefined) {
         ratingContent = '<div  class="v-rating-cont">'
         + '<p><a href="'+ fsUrl +'" target="_blank">'
         + '<img class="fs-icon" src="images/foursquare-icon-25x25.png"></a>'
         + '<span class="v-rating">'+ rating.toFixed(1) +'</span>'
         + '<img src="'+ ratingImg +'" class="rating-stars"></p></div></div>';
      } else {
          ratingContent = '<p class="v-rating-cont"><a href="'+ fsUrl +'" target="_blank">'
          + '<img class="fs-icon" src="images/images/foursquare-icon-25x25.png"></a>'
          + '<span class="v-rating"><em>no rating available</em></span></p></div></div>';
      }
      /* create marker object */
      var marker = new google.maps.Marker({
          map: map,
          position: position,
          name: name,
          title: name,
          animation: google.maps.Animation.DROP
        });
        /**
        * NOTE: to get the clicker function to open the infowindow,
        *  it is necessary to create a marker class. if the marker is
        *  pushed into venueMarkers array as an object, the clicker
        *  function wont open the marker when when using the index
        *  result of the loop.
        */
        // self.venueMarkers().push(marker);
        self.venueMarkers().push(new MapMarker(marker, name, category, position));
        // console.log(this.venueMarkers());

        /* create and add an infoWindow or an infoBubble to the markers */
        var infobubbleOptions = {
          position: position,
          map: map,
          content: infoContent + ratingContent,
          ShadowStyle: 2, //or 1
          Padding: 5,
          borderRadius: 10,
          borderWidth: 2,
          borderColor: '#40B3DF' ,
          backgroundColor: '#fff' ,
          minWidth: 230, //sets width
          maxWidth: 400,
          minHeight: 300,
          maxHeight: 180, //sets height
          arrowSize: 15,
          arrowPosition: 50,
          backgroundClassName: 'noscrollbar',
          arrowStyle: 0 //others 1 and 2
        };
        /**
        * this var has to be global, or infoBoxes
        * wont close when the other windows open
        */
        mapInfoBubble = new InfoBubble();
        //console.log(mapInfoBubble);
        google.maps.event.addListener(marker, 'click', function() {
          // Setting infobubble content and style
          mapInfoBubble.setOptions(infobubbleOptions);
          // mapInfoBubble.setContent('test');
          mapInfoBubble.open(map, this);
          map.panTo(position);
        });

    } // end createVenueMarker


    /**
    * display on the view a list of places found as a result of
    * the user keyword search.
    */
    self.displayFilteredList = ko.computed(function() {
        var venueName;
        var categoryName;
        var venueList = [];
        // this is the the input value variable
        var keyword = self.keywordToSearch().toLowerCase();
        // items in popularPlacesList() observable array are stored
        // after getting the json data response from FS url on
        // findFourSquerelocalityPlaces() or findFourSquereCityPlaces()
        // methods, depending on the type of location that was especified
        // on the FS endpoint resource.

        for(var i = self.popularPlacesList().length - 1; i >= 0; i--) {
            // Object {reasons: Object, venue: Object, tips: Array[1]...
            // console.log(self.popularPlacesList()[i]);
            // once we gather the popular places, we will look
            // into this array to check if it contains any of
            // the terms the user is entering on the input.
            venueName    = self.popularPlacesList()[i].venue.name;
            categoryName = self.popularPlacesList()[i].venue.categories[0].name;
            //console.log(venueName);
            //console.log(categoryName);
            if(venueName.toLowerCase().indexOf(keyword) != -1 ||
               categoryName.toLowerCase().indexOf(keyword) != -1) {
               // store the keyword places found in a temp array
               venueList.push(self.popularPlacesList()[i]);
            }
        }
        // pass temp array to an observable list of filtered items
        // that will be used to display these items on the view
        self.filteredPlacesList(venueList);
        // console.log(self.filteredPlacesList());
    },{ pure: true });



    /* update map markers based on search keyword */
    self.displayMarkers = ko.computed(function() {
      filteringMarkersBy(self.keywordToSearch().toLowerCase());
    },{ pure: true });



    /**
     * this method shows or hides the list. this is done by
     * setting the list to visible in the knockout view as
     * a boolean for the visible binding.
     */
    self.togglePlacesList = function() {
        var placesList = $('.list-container');
        var button     = $('#collapse-btn');
        placesList.slideToggle("slow");

        if(button.hasClass('glyphicon-chevron-up') ) {
            button.removeClass('glyphicon-chevron-up');
            button.addClass('glyphicon-chevron-down');
        } else {
            button.removeClass('glyphicon-chevron-down');
            button.addClass('glyphicon-chevron-up');
        }
    };


     /**
     * shows or hides the the input for searching
     * a location. This is done by setting the list
     * to visible in the knockout view as a boolean
     * for the visible binding.
     */
    self.toggleLocationSearch = function() {
      var searchBar     = $('.locationBar');
      var bntText       = $('.toggle-setting').text();
      var toggleSetting = $('.toggle-setting');
      // toggle bar
      searchBar.slideToggle("slow");

      if(bntText === "Hide Search Bar") {
          toggleSetting.html('Show Search Bar');
      } else {
          toggleSetting.html('Hide Search Bar');
      }
    };



    // fit map height to window size
    self.setMapSize = ko.computed(function() {
      $("#map").height($(window).height());
    });



    /*
    * make sure the map bounds get updated on page resize
    * http://stackoverflow.com/questions/8792676/center-google-maps-v3-on-browser-resize-responsive
    */
    google.maps.event.addDomListener(window, 'resize', function() {
      var center = map.getCenter();
      map.setCenter(center);
      self.adjustMapBounds();
    });


    /* fit map to display markers and fit the view to all markers at once */
    /* http://grapsus.net/blog/post/Google-API-v3-fit-map-zoom-and-bounds-to-all-markers*/
    self.adjustMapBounds = function() {
        // create a new viewpoint bound
        var bounds = new google.maps.LatLngBounds();

        // make sure there are at least 2 markers before fitting the map
        var markersLength = self.venueMarkers().length;
        if(markersLength >= 2) {
          for(var i = 0; i < markersLength; i++) {
            // user goggle extend method to increase the bounds
            // and fit the markers according to the space
            bounds.extend (self.venueMarkers()[i].marker.position);
          }
          $("#map").height($(window).height());
          map.fitBounds(bounds);

        }
    };



    // swipeable list on mobile screens
    // http://css-tricks.com/the-javascript-behind-touch-friendly-sliders
    function mobileSlider(filteredList, keyword) {
      var holderElem = document.getElementsByClassName('holder')[0];
      var sliderElem = document.getElementsByClassName('slider')[0];
      var slideElems = document.getElementsByClassName('slide');
      var listWidth = window.innerWidth - 10;
      var filteredListLength = filteredList.length;
      var clickEvent = new Event('click');

      holderElem.style.width = (filteredListLength * 100) + '%';
      sliderElem.style.width = listWidth + 'px';
      $('.slide').width(listWidth);

      if (navigator.msMaxTouchPoints) {
          sliderElem.classList.add('ms-touch');
      } else {
          var slider = {
            el: {
              slider: sliderElem,
              holder: holderElem
            },
            slideWidth: listWidth,
            touchstartx: undefined,
            touchmovex: undefined,
            movex: undefined,
            index: 0,

            // initialize the function and define the events.
            init: function() {
              this.bindUIEvents();
            },

            // reset position
            reset: function() {
              this.el.holder.style.transform = 'translate3d(-' + this.index * this.slideWidth + 'px,0,0)';
              this.movex = 0;
              this.index = 0;
              if (filteredListLength > 0) {
                 slideElems[0].dispatchEvent(clickEvent);
              }
            },

            // binds touch events to the element
            bindUIEvents: function() {
              this.el.holder.addEventListener('touchstart', function(event) {
                slider.start(event);
              });
              this.el.holder.addEventListener("touchmove", function(event) {
                slider.move(event);
              });
              this.el.holder.addEventListener("touchend", function(event) {
                slider.end(event);
              });
            },

            start: function(event) {
              // Get the original touch position.
              this.touchstartx = event.touches[0].pageX;
              // The movement gets all janky if there's a transition on the elements.
              $('.animate').removeClass('animate');
            },

            move: function(event) {
              // Continuously return touch position.
              this.touchmovex = event.touches[0].pageX;
              // Calculate distance to translate holder.
              this.movex = this.index * this.slideWidth + (this.touchstartx - this.touchmovex);
              // Makes the holder stop moving when there is no more content.
              if (this.movex < this.slideWidth*(filteredListLength-1)) {
                 this.el.holder.style.transform = 'translate3d(-' + this.movex + 'px,0,0)';
              }
            },

            end: function(event) {
              // Calculate the distance swiped.
              var absMove = Math.abs(this.index * this.slideWidth - this.movex);
              // Calculate the index. All other calculations are based on the index.
              if (absMove > this.slideWidth / 2) {
                if (this.movex > this.index * this.slideWidth && this.index < filteredListLength-1) {
                   this.index++;
                } else if (this.movex < this.index * this.slideWidth && this.index > 0) {
                  this.index--;
                }
              }
              // trigger click event to the focused list item
              slideElems[this.index].dispatchEvent(clickEvent);

              // toggle arrow booleans appropriately
              if (this.index === 0 || filteredListLength === 0) {
                 self.leftArrowTouch(false);
              } else {
                 self.leftArrowTouch(true);
              }
              if (this.index === filteredListLength-1 || filteredListLength < 2) {
                 self.rightArrowTouch(false);
              } else {
                 self.rightArrowTouch(true);
              }
              // Move and animate the elements.
              this.el.holder.classList.add('animate');
              this.el.holder.style.transform = 'translate3d(-' + this.index * this.slideWidth + 'px,0,0)';
            }
          }; // end var slider

          slider.init();

          // reset the slider when keyword is changed
          if (keyword != '' || slideElems.length > 0) {
             slider.reset();
             self.leftArrowTouch(false);
          }
          // toggle right arrow boolean
          if (filteredListLength < 2) {
             self.rightArrowTouch(false);
          } else {
            self.rightArrowTouch(true);
          }

      } // end else - if navigator.msMaxTouchPoints
    }


    // Computed binding for horizontally swipeable list
    self.mobileList = ko.computed(function() {
      if (window.innerWidth < 900) {
          mobileSlider(self.filteredPlacesList(), self.keywordToSearch());
      }
    },{ pure: true });


  }; // end MapViewModel

  /* initialize the view model binding */
  ko.applyBindings(new MapViewModel());

}(jQuery)); // end closure