'use strict';

var through = require('through2'),
    github = require('github'),

getReporter = function (reporter) {
    if (typeof reporter === 'function') {
        return reporter;
    }

    if (typeof reporter !== 'string') {
        reporter = 'default';
    }

    try {
        return require('jshint/src/reports/' + reporter);
    } catch (E) {
        // do nothing
    }

    try {
        return require(reporter);
    } catch (E) {
        // do nothing
    }
};

module.exports = function (options) {
    var output = [],
        reporter = getReporter(options.reporter);

    return through.obj(function (file, enc, callback) {
        if (file.jshint && !file.jshint.success && !file.jshint.ignored) {
            file.jshint.results.forEach(function (E) {
                output.push(file.path + ': line ' + E.line + ', col ' + E.character + ' ' + E.reason);
            });
        }
        callback();
    }, function (cb) {
        console.log(output);
        cb();
    });
};
