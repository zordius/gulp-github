gulp-github
===========

A gulp plugin to pipe contents to github pull request comments.

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
    return gulp.src('lin/*.js')
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
    git_token: 'the_oauth_token',

    // comment into this repo, this pr.
    git_repo: 'zordius/test',
    git_prid: '1',

    // Provide your own jshint reporter, optional
    reporter: function (E) {
        // refer to http://jshint.com/docs/reporters/ for E structure.
        return 'Error in ' + E.file + '!';
    }
}
```
