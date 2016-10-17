/*eslint-disable*/
var path = require('path');
var gulp = require('gulp');
var connect = require('gulp-connect');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var Server = require('karma').Server;
var hbsfy = require('hbsfy');
var uglify = require('gulp-uglify');
var eslint = require('gulp-eslint');
var rename = require('gulp-rename');
var header = require('gulp-header');
var gulpSeq = require('gulp-sequence');

var pkg = require('./package.json');
var filename = pkg.name.replace('component-', '');
var banner = ['/**', ' * @version <%= pkg.version %>', ' */', ''].join('\n');

var distPath = './dist';
var samplePath = './samples/js';

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

gulp.task('eslint', function() {
    return gulp.src(['./src/**/*.js'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('karma', function(done) {
    new Server({
        configFile: __dirname + '/karma.conf.private.js',
        singleRun: true,
        logLevel: 'error'
    }, done).start();
});

gulp.task('bundle', function() {
    var b = browserify({entries: 'index.js'});

    return b.transform(hbsfy)
        .bundle()
        .on('error', function(err) {
            console.log(err.message);
            this.emit('end');
        })
        .pipe(source(filename + '.js'))
        .pipe(buffer())
        .pipe(header(banner, {pkg: pkg}))
        .pipe(gulp.dest(distPath))
        .pipe(gulp.dest(samplePath));
});

gulp.task('compress', function() {
    return gulp.src('./dist/' + filename + '.js')
        .pipe(uglify())
        .pipe(rename({extname: '.min.js'}))
        .pipe(header(banner, {pkg: pkg}))
        .pipe(gulp.dest(distPath));
});

gulp.task('default', gulpSeq('eslint', 'karma', 'bundle', 'compress'));
