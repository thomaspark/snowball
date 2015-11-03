var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat-util');
var minifyCss = require('gulp-minify-css');
var notify = require('gulp-notify');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var util = require('gulp-util');
var zip = require('gulp-zip');
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
    .pipe(sourcemaps.init())
    .pipe(autoprefixer({ browsers: ['> 1%', 'IE 9'], cascade: false }))
    .pipe(minifyCss())
    .pipe(rename(function(path) {
      path.basename += '.min';
    }))
    .pipe(sourcemaps.write("./"))
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
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(rename(function (path) {
      path.basename += '.min';
    }))
    .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest("./scripts/min/"));
});

gulp.task('minify-templates', function () {
  gulp.src('./modules/*/template.js')
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(sourcemaps.init())
    .pipe(concat('templates.min.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest("scripts/min"));
});

gulp.task('minify-admins', function () {
  gulp.src('./modules/*/admin.js')
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(sourcemaps.init())
    .pipe(concat('admins.min.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write("./"))
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

var snowballFiles = [
    '**/*',
    '!.git',
    '!.gitignore',
    '!gulpfile.js',
    '!./node_modules',
    '!./node_modules/**',
    '!README.md',
    '!package.json',
    '!snowball.zip',
    '!./svn',
    '!./svn/**'
];

gulp.task('zip', function () {
    gulp.src(snowballFiles)
        .pipe(zip('snowball.zip'))
        .pipe(gulp.dest('./'));
});

gulp.task('svn', function () {
    gulp.src(snowballFiles)
        .pipe(gulp.dest('./svn/trunk'));
});
