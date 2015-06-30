var gulp = require('gulp');
var uglify = require('gulp-uglify');
var browserSync = require('browser-sync');
var rename = require('gulp-rename');
var minifyCss = require('gulp-minify-css');

var WORDPRESSURL = "http://localhost:8888/wordpresstest/wp-admin/edit.php?post_type=snowball";

gulp.task('minify', function () {
    //var negateMinCSS = 'styles/!(*.min.css)'; for retrieving all non .min.css
    gulp.src('styles/*.css')
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
		.pipe(uglify())
		.pipe(rename(function (path) {
			if (path.extname == ".js") {
                path.basename += '.min';
			}
		}))
		.pipe(gulp.dest("./scripts/min/"));
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
