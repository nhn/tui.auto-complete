/*eslint-disable*/
var gulp = require('gulp');
var connect = require('gulp-connect');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var eslint = require('gulp-eslint');
var rename = require('gulp-rename');
var header = require('gulp-header');

var pkg = require('./package.json');
var NAME = pkg.name;
var BANNER = ['/**',
    ' * <%= pkg.name %>',
    ' * @author <%= pkg.author %>',
    ' * @version v<%= pkg.version %>',
    ' * @license <%= pkg.license %>',
    ' */',
    ''].join('\n');

/**
 * Paths
 */
var SOURCE_DIR = './src/**/*',
    ENTRY = 'index.js',
    DIST = './dist';

gulp.task('connect', function() {
    connect.server();
});

gulp.task('eslint', function() {
    return gulp.src([SOURCE_DIR])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('bundle', ['eslint'], function() {
    return browserify({entries: ENTRY, debug: true})
        .bundle()
        .on('error', function(err) {
            console.log(err.message);
            this.emit('end');
        })
        .pipe(source(NAME + '.js'))
        .pipe(buffer())
        .pipe(header(BANNER, {pkg: pkg}))
        .pipe(gulp.dest(DIST))
        .pipe(uglify())
        .pipe(rename({extname: 'min.js'}))
        .pipe(header(BANNER, {pkg: pkg}))
        .pipe(gulp.dest(DIST));
});
