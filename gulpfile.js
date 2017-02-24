var gulp        = require('gulp');
var browserSync = require('browser-sync').create();
var sequence = require('run-sequence');


var paths = {
	styles: ['./src/styles/*.css'],
	script: ['./src/scripts/*.js'],
	src: ['./src/*.*']
};

// Static server
gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });
});


gulp.task('watch', function () {
	gulp.watch([paths.src], [], function() {
		browserSync.reload();
	});
});


gulp.task('serve', function (done) {
	sequence('browser-sync', 'watch', done);
});