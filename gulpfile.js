/*eslint-disable*/
var path = require('path');
var gulp = require('gulp');
var connect = require('gulp-connect');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var KarmaServer = require('karma').Server;
var hbsfy = require('hbsfy');
var uglify = require('gulp-uglify');
var eslint = require('gulp-eslint');
var rename = require('gulp-rename');
var filename = require('./package.json').name.replace('component-', '');

var distPath = './dist';
var samplePath = './samples/js';

gulp.task('eslint', function() {
    return gulp.src(['./src/**/*.js'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('karma', ['eslint'], function(done) {
    new KarmaServer({
        configFile: __dirname + '/karma.conf.private.js',
        singleRun: true,
        logLevel: 'error'
    }, done).start();
});

gulp.task('connect', function() {
    connect.server({livereload: true});
    gulp.watch(['./src/**/*.js', './index.js', './demo/**/*.html'], ['liveBuild']);
});

gulp.task('liveBuild', function() {
    var b = browserify({
        entries: 'index.js',
        debug: true
    });

    return b.transform(hbsfy)
        .bundle()
        .on('error', function(err) {
            console.log(err.message);
            this.emit('end');
        })
        .pipe(source(filename + '.js'))
        .pipe(buffer())
        .pipe(gulp.dest(distPath))
        .pipe(gulp.dest(samplePath));
});

gulp.task('bundle', ['karma'], function() {
    var b = browserify({entries: 'index.js'});

    return b.transform(hbsfy)
        .bundle()
        .on('error', function(err) {
            console.log(err.message);
            this.emit('end');
        })
        .pipe(source(filename + '.js'))
        .pipe(buffer())
        .pipe(gulp.dest(distPath))
        .pipe(gulp.dest(samplePath));
});

gulp.task('compress', ['bundle'], function() {
    gulp.src(filename + '.js')
        .pipe(uglify())
        .pipe({extname: '.min.js'})
        .pipe(gulp.dest(distPath));
});

gulp.task('default', ['eslint', 'karma', 'bundle', 'compress']);
