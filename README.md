gulp-github
===========

A gulp plugin to pipe contents to github pull request comments.

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
    reporter: function (E) {
        return 'Error in ' + E.file + '!';   // refer to http://jshint.com/docs/reporters/ for E structure.
    },
    git_token: 'the_oauth_token',            // refer to https://help.github.com/articles/creating-an-access-token-for-command-line-use/
    git_repo: 'zordius/test',
    git_prid: '1'
}
```
