'use strict';

var through = require('through2'),
    github = require('github'),
    path = require('path'),

simple_reporter = function (E) {
    return path.relative(' * ' + process.cwd(), E.file) + ': line ' + E.error.line + ', col ' + E.error.character + ' ' + E.error.reason;
};

module.exports = function (options) {
    var output = ['**Please fix these jshint issues first:**'],
        opt = options || {},
        reporter = opt.reporter || simple_reporter;

    return through.obj(function (file, enc, callback) {
        if (file.jshint && !file.jshint.success && !file.jshint.ignored) {
            file.jshint.results.forEach(function (E) {
                output.push(reporter(E));
            });
        }
        callback();
    }, function (cb) {
        var GIT = new github({
            version: '3.0.0',
            headers: {
                'user-agent': 'gulp-github'
            }
        })

        if (output.length == 1) {
            return cb();
        }

        if (opt.git_token && opt.git_repo && opt.git_prid) {
            GIT.authenticate({
                type: 'oauth',
                token: opt.git_token
            });

            GIT.issues.createComment({
                user: opt.git_repo.split('/')[0],
                repo: opt.git_repo.split('/')[1],
                number: opt.git_prid,
                body: output.join('\n'),
            });
        } else {
            console.log(output);
        }

        cb();
    });
};
