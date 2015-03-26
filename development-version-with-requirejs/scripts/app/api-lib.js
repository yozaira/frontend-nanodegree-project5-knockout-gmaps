 (function(window, APIs) {

    /* Foursquare API */
    APIs.fSquare = {

          clientId: 'GQVM3TG2JHRG53PTWCZSCQDKUKQJH34I1BUOJOLLHOSBL1Q0',
          clientSecret: 'M41YZKEES3UIG4QYWVMQ0HQIMUPD0G1YD5ZSQTYUPJLVG4DD',

          // Returns a list of recommended venues near the current location
          // https://developer.foursquare.com/docs/venues/explore
          popularPlacesByCity: function (keyword, city) {
            return'https://api.foursquare.com/v2/venues/explore?'
                + 'client_id='+ this.clientId
                + '&client_secret='+ this.clientSecret
                + '&near=' + city        // https://developer.foursquare.com/docs/responses/geocode
                + '&section='+ keyword
                + '&limit=20'
                + '&day=any&time=any&radius=1500'
                + '&v=20140806&m=foursquare';
          },


          popularPlacesByLocation: function (keyword, locLat, locLng) {
            return'https://api.foursquare.com/v2/venues/explore?'
                + 'client_id='+ this.clientId
                + '&client_secret='+ this.clientSecret
                + '&ll='+ locLat + ','+ locLng   // Latitude and longitude of the user's location.
                + '&section='+ keyword
                + '&limit=20'
                + '&day=any&time=any&radius=1500'
                + '&v=20140806&m=foursquare';
          },


          topPicksPlacesByLocation: function (location) {
            // topPicks are a mix of recommendations generated without a query from the user.
            return'https://api.foursquare.com/v2/venues/explore?'
                + 'client_id='+ this.clientId
                + '&client_secret='+ this.clientSecret
                + '&ll='+ location.lat + ','+ location.lng   // Latitude and longitude of the user's location.
                + '&section=topPicks'
                + '&limit=20'
                + '&day=any&time=any&radius=1500'
                + '&v=20140806&m=foursquare';
          },


          // https://developer.foursquare.com/docs/events/categories
          getEvents: function () {
             return 'https://api.foursquare.com/v2/events/categories?'
                  + 'client_id=' + this.clientId
                  + '&client_secret=' + this.clientSecret
                  + '&v=20140806&m=foursquare';
          },


          // Retrieves the places available in a neighborhood using the Foursquare API.
          // Returns a list of venues near the current location, optionally matching a search term
          // https://developer.foursquare.com/docs/venues/search
          getPlaces: function (keyword, neighborhood) {
            return'https://api.foursquare.com/v2/venues/search?'
                + 'client_id=' + this.clientId
                + '&client_secret='+ this.clientSecret
                // Latitude and longitude of the user's location.
                + '&ll='+ neighborhood.lat + ','+ neighborhood.lng
                      + '&query=' + keyword
                + '&limit=30'
                + '&day=any&time=any&radius=1500'
                + '&v=20140806&m=foursquare';
          },


          // Retrieves all the photos URLs of a place using the Foursquare API.
          getPlacePhotos: function (place) {
            return'https://api.foursquare.com/v2/venues/' + place.id + '/photos?client_id='
                + this.clientId + '&client_secret=' + this.clientSecret + '&v=20140806&m=foursquare';
          },


          getPlaceHours: function (place) {
            return'https://api.foursquare.com/v2/venues/' + place.id + '/hours?client_id='
                + this.clientId + '&client_secret=' + this.clientSecret + '&v=20140806&m=foursquare';
          }
      };


  } (window, window.APIs || (window.APIs = {}) ));
