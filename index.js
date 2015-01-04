'use strict';

var through = require('through2'),
    gutil = require('gulp-util'),
    github = require('github'),
    path = require('path'),

jshint_simple_reporter = function (E) {
    return ' 1. ' + path.relative(process.cwd(), E.file) + ': line ' + E.error.line + ', col ' + E.error.character + ' *' + E.error.reason + '*';
},

jscs_simple_reporter = function (E) {
    return ' 1. ' + E.filename + ': line ' + E.line + ', col ' + E.column + ' *' + E.message + '*';
},

commentToGithub = function (body, opt) {
    var GIT = new github(opt.git_option || {
        version: '3.0.0',
        headers: {
            'user-agent': 'gulp-github'
        }
    });
    GIT.authenticate({
        type: 'oauth',
        token: opt.git_token
    });

    GIT.issues.createComment({
        user: opt.git_repo.split('/')[0],
        repo: opt.git_repo.split('/')[1],
        number: opt.git_prid,
        body: body
    });
};

module.exports = function (options) {
    var jshint_output = ['**Please fix these jshint issues first:**'],
        jscs_output = ['**Please fix these jscs issues first:**'],
        opt = options || {},
        jshint_reporter = opt.jshint_reporter || jshint_simple_reporter,
        jscs_reporter = opt.jscs_reporter || jscs_simple_reporter;

    return through.obj(function (file, enc, callback) {
        if (file.jshint && !file.jshint.success && !file.jshint.ignored) {
            file.jshint.results.forEach(function (E) {
                jshint_output.push(jshint_reporter(E));
            });
        }

        if (file.jscs && !file.jscs.success) {
            file.jscs.errors.forEach(function (E) {
                jscs_output.push(jscs_reporter(E));
            });
        }

        this.push(file);
        callback();
    }, function (cb) {
        var pr_url;

        if ((jshint_output.length === 1) && (jscs_output.length === 1)) {
            return cb();
        }

        if (opt.git_token && opt.git_repo && opt.git_prid) {
            pr_url = 'https://' + ((opt.git_option && opt.git_option.host) ? opt.git_option.host : 'github.com') + '/' + opt.git_repo + '/pull/' + opt.git_prid;
            if (jshint_output.length > 1) {
                commentToGithub(jshint_output.join('\n'), opt);
                gutil.log('[gulp-github]', gutil.colors.bold((jshint_output.length - 1) + ' jshint issues were updated to ' + pr_url));
            }
            if (jscs_output.length > 1) {
                commentToGithub(jscs_output.join('\n'), opt);
                gutil.log('[gulp-github]', gutil.colors.bold((jscs_output.length - 1) + ' jscs issues were updated to ' + pr_url));
            }
        } else {
            console.log('Not a pullrequest or no opts.git_token/opts.git_repo/opts.git_prid');
            if (jshint_output.length > 1) {
                console.log('These jshint issues will not update to github:');
                console.log(jshint_output.join('\n'));
            }
            if (jscs_output.length > 1) {
                console.log('These jscs issues will not update to github:');
                console.log(jscs_output.join('\n'));
            }
            console.log('Please read gulp-github document: https://github.com/zordius/gulp-github');
        }

        cb();
    });
};

module.exports.commentToGithub = commentToGithub;
