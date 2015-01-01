'use strict';

var through = require('through2'),
    github = require('github'),
    path = require('path'),

simple_reporter = function (E) {
    return path.relative(process.cwd(), E.file) + ': line ' + E.error.line + ', col ' + E.error.character + ' ' + E.error.reason;
};

module.exports = function (options) {
    var output = [],
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
        console.log(output);
        cb();
    });
};
