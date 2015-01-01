var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    github = require('./index');

gulp.task('default', function () {
    return gulp.src('*.js')
    .pipe(jshint())
    .pipe(github({}));
});