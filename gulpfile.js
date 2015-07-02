var gulp = require('gulp');
var uglify = require('gulp-uglify');
var browserSync = require('browser-sync');
var rename = require('gulp-rename');
var minifyCss = require('gulp-minify-css');
//var glob = require('glob');
//var StreamQueue = require('streamqueue');
var plumber = require('gulp-plumber');
var gutil = require('gulp-util');
var notify = require('gulp-notify');

var WORDPRESSURL = "http://localhost:8888/wordpresstest/wp-admin/edit.php?post_type=snowball";

var onError = function (err) {  
  gutil.beep();
  console.log(err);
};

gulp.task('minify', function () {
    //var negateMinCSS = 'styles/!(*.min.css)'; for retrieving all non .min.css
    gulp.src('styles/*.css')
        .pipe(plumber({
          errorHandler: onError
        }))
        .pipe(minifyCss())
        .pipe(rename(function(path) {
            if (path.extname == ".css") {
                path.basename += '.min';
            }
        }))
        .pipe(gulp.dest("./styles/min/"));
});

gulp.task('uglify', function() {
	//var negateMinJS = 'scripts/!(*.min.js)'; for retrieving all non .min.js
    gulp.src('./scripts/*.js')
        .pipe(plumber({
          errorHandler: notify.onError({
            title: 'Error!',
            message: '<%= error.message %>',
            sound: 'Beep'
          })
        }))
		.pipe(uglify())
        .pipe(rename(function (path) {
            if (path.extname == ".js") {
                path.basename += '.min';
            }
        }))
		.pipe(gulp.dest("./scripts/min/"));
});

gulp.task('minify-codemirror', function() {
  var dir = "./lib/codemirror/**/";
  // minify js
  gulp.src([dir + '*.js', '!' + dir + '*.min.js'])
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(uglify())
        .pipe(rename(function (path) {
            path.basename += '.min';
        }))
        .pipe(gulp.dest("./lib/codemirror/"));
 
  // minify css
  gulp.src([dir + '*.css', '!' + dir + '*.min.css'])
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(minifyCss())
        .pipe(rename(function (path) {
            path.basename += '.min';
        }))
        .pipe(gulp.dest("./lib/codemirror/"));
});

gulp.task('minify-fixed-sticky', function() {
  var dir = "./lib/fixed-sticky/*";
  // minify js
  gulp.src([dir + '*.js', '!' + dir + '*.min.js'])
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(uglify())
        .pipe(rename(function (path) {
            path.basename += '.min';
        }))
        .pipe(gulp.dest("./lib/fixed-sticky/"));
 
  // minify css
  gulp.src([dir + '*.css', '!' + dir + '*.min.css'])
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(minifyCss())
        .pipe(rename(function (path) {
            path.basename += '.min';
        }))
        .pipe(gulp.dest("./lib/fixed-sticky/"));
});
/*
    This will open a new tab of your wordpress site whenever
    the browersync server is restarted.
*/
gulp.task('browser-sync', function() {
    browserSync.init(["styles/*.css", "scripts/*.js", "*.php", "inc/*.php", "modules/*/*"], {
        proxy: WORDPRESSURL
    });
});

gulp.task('default', ['uglify', 'minify', 'browser-sync'], function () {
    gulp.watch("scripts/*.js", ['uglify']).on('change', browserSync.reload);
    gulp.watch("styles/*.css", ['minify']).on('change', browserSync.reload);
    gulp.watch("*.php").on('change', browserSync.reload);
    gulp.watch("inc/*.php").on('change', browserSync.reload);
    gulp.watch("modules/*/*").on('change', browserSync.reload);
});

  /*
    TODO:
    Can't figure out why the code keeps outputting:
    [TypeError: Invalid non-string/buffer chunk]
    
    Possible solution would be trying a different streamqueue.
    This is the codemirror solution for solving globs
  */
  //gulp.task('minify-codemirror-glob', function() {
  // var libDir = glob.sync('lib/codemirror/**/');
  // var queue = new StreamQueue();
  // libDir.forEach(function(folder) {
  //   var dirName = folder.match(/.+\/(.+)\/$/)[1];
  //   queue.queue(
  //     gulp.src([folder + '*.js', '!' + folder + '*.min.js'])
  //       .pipe(plumber({
  //           errorHandler: onError
  //       }))
  //       .pipe(uglify())
  //       .pipe(rename(function (path) {
  //           if (path.extname == ".js") {
  //               path.basename += '.min';
  //           }
  //       }))
  //       .pipe(gulp.dest(folder))
  // );

    // queue.queue(
    //   gulp.src([folder + '*.css', '!' + folder + '*.min.css'])
    //       .pipe(plumber({
    //         errorHandler: notify.onError({
    //           title: 'Error!',
    //           message: '<%= error.message %>',
    //           sound: 'Beep'
    //         })
    //       }))
    //       .pipe(minifyCss())
    //       .pipe(rename(function (path) {
    //         path.basename += ".min";
    //       }))
    //       .pipe(gulp.dest(folder))
    // );

  // });

  // return queue;
//});

