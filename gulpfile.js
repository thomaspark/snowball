var gulp = require('gulp');
var concat = require('gulp-concat-util');
var minifyCss = require('gulp-minify-css');
var notify = require('gulp-notify');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var util = require('gulp-util');
var browserSync = require('browser-sync');

var onError = function (err) {
  util.beep();
  console.log(err);
};

gulp.task('default', ['minify-snowball-css', 'minify-snowball-js', 'minify-templates', 'minify-admins'], function () {
  gulp.watch("scripts/*.js", ['minify-snowball-js']);
  gulp.watch("styles/*.css", ['minify-snowball-css']);
  gulp.watch("modules/*/template.js", ['minify-templates']);
  gulp.watch("modules/*/admin.js", ['minify-admins']);
});

gulp.task('minify-snowball-css', function () {
  gulp.src('styles/*.css')
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(minifyCss())
    .pipe(rename(function(path) {
      path.basename += '.min';
    }))
    .pipe(gulp.dest("./styles/min/"));
});

gulp.task('minify-snowball-js', function() {
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
      path.basename += '.min';
    }))
    .pipe(gulp.dest("./scripts/min/"));
});

gulp.task('minify-templates', function () {
  gulp.src('./modules/*/template.js')
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(concat('templates.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest("scripts/min"));
});

gulp.task('minify-admins', function () {
  gulp.src('./modules/*/admin.js')
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(concat('admins.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest("scripts/min"));
});



// minifies the code for the css/js libraries
gulp.task('minify-libraries', ['minify-codemirror', 'minify-fixed-sticky']);

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
  gulp.src([dir + '*.js', '!' + dir + '*.min.js'])
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(uglify())
    .pipe(rename(function (path) {
      path.basename += '.min';
    }))
    .pipe(gulp.dest("./lib/fixed-sticky/"));

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