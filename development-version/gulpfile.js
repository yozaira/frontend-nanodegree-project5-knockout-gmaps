// include gulp
var gulp = require('gulp');

var stripDebug = require('gulp-strip-debug');
// general plug-ings
var concat = require('gulp-concat');
var rename = require('gulp-rename');
// js plug-ins
var uglify = require('gulp-uglify');
// css plug-ins
var minifyCSS = require('gulp-minify-css');

var watch = require('gulp-watch');

// copy and paste dependancies installation
/*
 npm install gulp-concat gulp-uglify gulp-rename gulp-minify-css gulp-order gulp-minify-html gulp-strip-debug gulp-watch --save-dev
*/


// JS strip debugging and minify vendor scripts files
/*
note: if 'base' ins not included on gulp.order(), the
module wont work.
 http://stackoverflow.com/questions/23501495/gulp-order-node-module-with-merged-streams
*/
var order = require("gulp-order");

gulp.task('app-js', function() {
  return gulp.src('scripts/app/*.js')
        .pipe(order([
                    'scripts/app/api-lib.js',
                    'scripts/app/map-options.js',
                    'scripts/app/MapViewModel.js'
                    ],{base: './'} ))
        .pipe(stripDebug())
        .pipe(concat('app-scripts.js'))
        .pipe(uglify())
        .pipe(rename('app-scripts.min.js'))
        .pipe(gulp.dest('../build/js/'));
});



// concatenate the necessary libs downloaded with bower,
// in this case jquery and knockoutjs.
// so far, the concat order of this files have not affected the app.
gulp.task('lib-js', function() {
  return gulp.src(['scripts/vendor/jquery/dist/jquery.min.js',
                   'scripts/vendor/infobubble.min.js',
                   'scripts/vendor/knockoutjs/dist/knockout.js'
                  ])
    .pipe(stripDebug())
    .pipe(concat('libs-scripts.js'))
    .pipe(uglify())
    .pipe(rename('libs-scripts.min.js'))
    .pipe(gulp.dest('../build/js/'));
});




// CSS concat, auto-prefix and minify
gulp.task('styles', function() {
  gulp.src(['css/*.css'])
    // .pipe(concat('combined.css'))
    .pipe(minifyCSS())
	  // add a suffix to avoid confusion
    .pipe(rename({suffix: '.min'}))
     // the destination of new uncssed file
    .pipe(gulp.dest('../build/css/'));
});


// Minify html with minimize.
// https://www.npmjs.com/package/gulp-minify-html
// npm install --save-dev gulp-minify-html
var minifyHTML = require('gulp-minify-html');

gulp.task('min-html', function() {
    var opts = {
	   comments:true,
	   spare:true
	};
   gulp.src('./index-prod.html')
    .pipe(minifyHTML(opts))
    .pipe(rename('index.html'))
    .pipe(gulp.dest('../'))
});


// add a watch task that will automatically run specific
// tasks when specific files change.when gulp watch
// run in the command line, it will update files within the
// src directory when a file change is made
gulp.task('watch', function() {

  gulp.watch('scripts/*.js', ['lib-js']);
	gulp.watch('scripts/app/*.js', ['app-js']);
    // watch for CSS changes
	gulp.watch('css/*.css', ['styles']);
	// watch for HTML changes
	gulp.watch('./*.html', ['min-html']);
});

// The default task (called when you run 'gulp' from cli)
gulp.task('default', ['app-js', 'lib-js', 'styles', 'min-html', 'watch']);





