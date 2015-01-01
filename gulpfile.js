var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    github = require('./index');

gulp.task('default', function () {
    return gulp.src('*.js')
    .pipe(jshint())
    .pipe(github({
        git_token: process.env.GHTK,
        git_repo: 'zordius/gulp-github',
        git_prid: process.env.prid
    }));
});