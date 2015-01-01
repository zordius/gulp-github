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
