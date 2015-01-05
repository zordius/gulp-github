var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    jscs = require('gulp-jscs'),
    github = require('./index');

gulp.task('default', function () {
    return gulp.src('*.js')
    .pipe(jshint())
    .pipe(jscs())
    .on('error', function () {
        // handle error, skip gulp-jscs messages
    })
    .pipe(github({
        // Read http://docs.travis-ci.com/user/encryption-keys/
        // travis encrypt GHTK=your_github_access_token
        // Then save into your .travis.yml
        git_token: process.env.GHTK,
        git_repo: process.env.TRAVIS_REPO_SLUG,
        git_prid: process.env.TRAVIS_PULL_REQUEST,
        git_sha: process.env.TRAVIS_COMMIT,

        jshint_status: 'error',
        jscs_status: 'failure',
    }))
    .pipe(jshint.reporter('fail'));
});
