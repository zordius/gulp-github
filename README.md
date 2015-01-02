gulp-github
===========

A gulp plugin to pipe contents to github pull request comments.

[![npm version](https://img.shields.io/npm/v/gulp-github.svg)](https://www.npmjs.org/package/gulp-github) [![Dependency Status](https://david-dm.org/zordius/gulp-github.svg)](https://david-dm.org/zordius/gulp-github) [![Build Status](https://travis-ci.org/zordius/gulp-github.svg?branch=master)](https://travis-ci.org/zordius/gulp-github) [![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE.txt)

Features
--------

* Write collected info then comment on a github pull request.
* Collect <a href="https://github.com/spenceralger/gulp-jshint">gulp-jshint</a> results.
* **TODO** Collect mocha results.
* **TODO** Collect istanbul results.

Installation
------------

```sh
npm install gulp-github
```

Usage
-----

```javascript
var gulp = require('gulp'),
    github = require('gulp-github');

gulp.task('link_report_github', function () {
    return gulp.src('lib/*.js')
    .pipe(jshint())
    .pipe(github(options));
});
```

Options
-------

```javascript
{
    // Required options: git_token, git_repo, git_prid
    // refer to https://help.github.com/articles/creating-an-access-token-for-command-line-use/
    git_token: 'your_github_oauth_token',

    // comment into this repo, this pr.
    git_repo: 'zordius/test',
    git_prid: '1',

    // when ussing github enterprise, optional
    git_option: {
        // refer to https://www.npmjs.com/package/github
    }

    // Provide your own jshint reporter, optional
    reporter: function (E) {
        // refer to http://jshint.com/docs/reporters/ for E structure.
        return 'Error in ' + E.file + '!';
    }
}
```

Check this <a href="gulpfile.js">sample gulpfile</a> to see how to migrate this with travis CI.
