'use strict';

var through = require('through2'),
    gutil = require('gulp-util'),
    github = require('github'),
    path = require('path'),

simple_reporter = function (E) {
    return ' 1. ' + path.relative(process.cwd(), E.file) + ': line ' + E.error.line + ', col ' + E.error.character + ' *' + E.error.reason + '*';
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
    var output = ['**Please fix these jshint issues first:**'],
        opt = options || {},
        reporter = opt.reporter || simple_reporter;

    return through.obj(function (file, enc, callback) {
        if (file.jshint && !file.jshint.success && !file.jshint.ignored) {
            file.jshint.results.forEach(function (E) {
                output.push(reporter(E));
            });
        }
        this.push(file);
        callback();
    }, function (cb) {

        if (output.length == 1) {
            return cb();
        }

        if (opt.git_token && opt.git_repo && opt.git_prid) {
            commentToGithub(output.join('\n'), opt);
            gutil.log('[gulp-github]', gutil.colors.bold((output.length - 1) + ' jshint issues were updated to https://' + ((opt.git_option && opt.git_option.host) ? opt.git_option.host : 'github.com') + '/' + opt.git_repo + '/pull/' + opt.git_prid));
        } else {
            console.log('Not a pullrequest or no opts.git_token/opts.git_repo/opts.git_prid');
            console.log('These jshint issues will not update to github:');
            console.log(output.join('\n'));
            console.log('Please read gulp-github document: https://github.com/zordius/gulp-github');
        }

        cb();
    });
};

module.exports.commentToGithub = commentToGithub;
