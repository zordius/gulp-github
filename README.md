gulp-github
===========

A gulp plugin to pipe contents to github pull request comments.

[![npm version](https://img.shields.io/npm/v/gulp-github.svg)](https://www.npmjs.org/package/gulp-github) [![Dependency Status](https://david-dm.org/zordius/gulp-github.svg)](https://david-dm.org/zordius/gulp-github) [![Build Status](https://travis-ci.org/zordius/gulp-github.svg?branch=master)](https://travis-ci.org/zordius/gulp-github) [![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE.txt)

Features
--------

* Collect <a href="https://github.com/spenceralger/gulp-jshint">gulp-jshint</a> results.
* Collect <a href="https://github.com/jscs-dev/gulp-jscs">gulp-jscs</a> results.
* Write collected info then comment on a github pull request.
* Update github pull request status based on collected info.
* **TODO** Collect lcov result.

Installation
------------

```sh
npm install gulp-github
```

Usage
-----

```javascript
var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    jscs = require('gulp-jscs'),
    github = require('gulp-github');

gulp.task('link_report_github', function () {
    return gulp.src('lib/*.js')
    .pipe(jshint())
    .pipe(jscs()).on('error', function (E) {
        console.log(E.message); // This handled jscs stream error
    })
    .pipe(github(options)); // comment issues in github PR!
});

// Or, direct output your comment with same options
github.commentToPR('Yes! it works!!', options);
```

Options
-------

```javascript
{
    // Required options: git_token, git_repo
    // refer to https://help.github.com/articles/creating-an-access-token-for-command-line-use/
    git_token: 'your_github_oauth_token',

    // comment into this repo, this pr.
    git_repo: 'zordius/test',
    git_prid: '1',

    // create status to this commit, optional
    git_sha: 00000000,
    jshint_status: 'error',       // Set status to error when jshint errors
    jscs_status: 'failure',       // Set status to failure when jscs errors

    // when using github enterprise, optional
    git_option: {
        // refer to https://www.npmjs.com/package/github
        host: 'github.mycorp.com'
    },

    // Provide your own jshint reporter, optional
    jshint_reporter: function (E, file) { // gulp stream file object
        // refer to http://jshint.com/docs/reporters/ for E structure.
        return 'Error in ' + E.file + '!';
    },

    // Provide your own jscs reporter, optional
    jscs_reporter: function (E, file) { // gulp stream file object
        // refer to https://github.com/jscs-dev/node-jscs/wiki/Error-Filters for E structure.
        return 'Error in ' + E.filename + '!';
    }
}
```

Check this <a href="gulpfile.js">sample gulpfile</a> to see how to migrate this with travis CI.

Check <a href="https://github.com/zordius/gulp-github/pull/3">This PR</a> to see live demo. Click on ✘ symbol before d9bc05e to see created status.
