var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    github = require('./index');

gulp.task('default', function () {
    return gulp.src('*.js')
    .pipe(jshint())
    .pipe(github({
        git_token: process.env.GHTK,
        git_repo: process.env.TRAVIS_REPO_SLUG,
        git_prid: process.env.TRAVIS_PULL_REQUEST
    }));
});