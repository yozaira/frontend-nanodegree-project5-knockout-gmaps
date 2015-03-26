# Front-end Nanodegree Neighborhood Map Project

## Summary

<p>This is a <b>Google Maps-based Web Application</b> where users can find Foursquare's top popular places near
their geolocation or a location they choose.</p>

<p>The main purpose of this app is to give users an easy-to-use platform, with a simple, clean UI
that allows them to search interesting places to visit on the go.</p>

## Application Structure, Components and Tools

* The application structure is based on Model-View-ViewModel pattern, implemented through the use of
  <a href="http://knockoutjs.com/documentation/introduction.html">KnockoutJS</a> JavaScript framework.
  KO library makes it very easy for developers to bind data with templating features to create dynamic
  views. The main sections of the app are update automatically whenever the user enters a place or
  location on the input fields.

* The data displayed on the view is requested from <a href="https://developer.foursquare.com/overview/">Foursquare
  API</a> leveraging JQuery's Ajax method.

* The map was created with <a href="https://developers.google.com/maps/documentation/javascript/tutorial">Google Maps
  JavaScript API</a>, and the locations requested for users are processed with <b>Google Geocode Service</b>.
  To provide users with popular places near their geolocation, we used <b>HTML5 geolocation API</b>.

Other tools used to create this app:

* <b><a href="http://bower.io/">Bower</a></b>, for easy installation and management of Knockoutjs and jquery libraries.

* <b><a href="http://requirejs.org/">RequireJS</a></b>, for js files asyncronous loading (AMD).

* We still need to optimize the RequireJS modules for this project. This will be done by
  using <a href="http://requirejs.org/docs/optimization.html">r.js</a>, an optimization tool that combines, concatenates, and minifies all JavaScript modules, including CSS files.

The files are organized in the following way:

* scripts folder - with the app and vendor subfolders for js files. It also contains main.js,
  the <b>RequireJS</b> initialization file.
* css folder - for style files.
* images folder - containing the images.
* index.html - includes just one path to the require.js file, and a data-main attribute
  linking to main.js, which contains the modules configuration and paths to modules.


## How to use
If you are familiar with Google Maps, you will find this application fairly simple to use.

Besides the search areas, where users can look for a specific location or place, this program is
operated primarily through interacting with the map markers. There are two ways to do this:

1. Click on a marker to get the information about a location.
2- Click on one of the places displayed on the list (upper right side, for big screens; bottom left corner,
   for tablets and smart phones).

A live version of this website is available
at <b><a href="http://yozaira.github.io/frontend-nanodegree-project5-ko-gmaps">Neighborhood Map Project</a></b>.
This is the production version; however, its functionality should be synchronized with the development version
at all times.




