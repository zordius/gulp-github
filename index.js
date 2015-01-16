'use strict';

var through = require('through2'),
    gutil = require('gulp-util'),
    github = require('github'),
    path = require('path'),

jshint_simple_reporter = function (E) {
    return ' 1. ' + path.relative(process.cwd(), E.file) + ': line ' + E.error.line + ', col ' + E.error.character + ' *' + E.error.reason + '*';
},

jscs_simple_reporter = function (E, file) {
    return ' 1. ' + path.relative(process.cwd(), file.path) + ': line ' + E.line + ', col ' + E.column + ' *' + E.message + '*';
},

getGIT = function (opt) {
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
    return GIT;
},

closePR = function (opt) {
    getGIT(opt).issues.edit({
        user: opt.git_repo.split('/')[0],
        repo: opt.git_repo.split('/')[1],
        number: opt.git_prid,
        state: 'closed'
    });
},

commentToPR = function (body, opt) {
    getGIT(opt).issues.createComment({
        user: opt.git_repo.split('/')[0],
        repo: opt.git_repo.split('/')[1],
        number: opt.git_prid,
        body: body
    });
},

createStatusToCommit = function (state, opt) {
    getGIT(opt).statuses.create({
        user: opt.git_repo.split('/')[0],
        repo: opt.git_repo.split('/')[1],
        sha: opt.git_sha,
        state: state.state,
        description: state.description,
        context: state.context
    });
},

isPullRequest = function (opt) {
    return opt.git_token && opt.git_repo && opt.git_prid && (opt.git_prid !== 'false');
},

isMerge = function (opt, callback) {
    if (!isPullRequest(opt)) {
        return;
    }

    getGIT(opt).pullRequests.getCommits({
        user: opt.git_repo.split('/')[0],
        repo: opt.git_repo.split('/')[1],
        number: opt.git_prid,
        per_page: 100
    }, function (E, D) {
        var merged = [];

        if (E) {
            console.warn(E);
            return callback(E);
        }

        D.forEach(function (commit) {
            if (commit.parents.length > 1) {
                merged.push('* Commit: @' + commit.sha + ' is a merge from ' + commit.parents.map(function (C) {
                    return '@' + C.sha;
                }).join(' , ') + ' !!');
            }
        });

        callback(merged.length ? merged.join('\n') : false);
    });
},

failMergedPR = function (opt) {
    isMerge(opt, function (M) {
        if (!M) {
            return;
        }

        commentToPR('**Do not accept PR with merge, please use rebase always!**\n' + M, opt);

        createStatusToCommit({
            state: 'failure',
            description: 'merge in PR',
            context: 'gulp-github/is_merge'
        }, opt);

        closePR(opt);
    });
},

failThisTask = function () {
    var jshint_fails = 0,
        jscs_fails = 0;

    return through.obj(function (file, enc, callback) {
        if (file.jshint && !file.jshint.success && !file.jshint.ignored) {
            jshint_fails += file.jshint.results.length;
        }

        if (file.jscs && !file.jscs.success) {
            jscs_fails += file.jscs.errors.length;
        }
        this.push(file);
        callback();
    }, function (cb) {
        var message = [];

        if (jshint_fails) {
            message.push('found ' + jshint_fails + ' jshint issues');
        }

        if (jscs_fails) {
            message.push('found ' + jscs_fails + ' jscs issues');
        }

        if (message.length) {
            this.emit('error', new gutil.PluginError('gulp-github', {
                message: 'Failed: ' + message.join(', ') + '.',
                showStack: false
            }));
        }

        cb();
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
                jshint_output.push(jshint_reporter(E, file));
            });
        }

        if (file.jscs && !file.jscs.success) {
            file.jscs.errors.forEach(function (E) {
                jscs_output.push(jscs_reporter(E, file));
            });
        }

        this.push(file);
        callback();
    }, function (cb) {
        var pr_url;

        if ((jshint_output.length === 1) && (jscs_output.length === 1)) {
            return cb();
        }

        if (isPullRequest(opt)) {
            pr_url = 'https://' + ((opt.git_option && opt.git_option.host) ? opt.git_option.host : 'github.com') + '/' + opt.git_repo + '/pull/' + opt.git_prid;
            if (jshint_output.length > 1) {
                commentToPR(jshint_output.join('\n'), opt);
                gutil.log('[gulp-github]', gutil.colors.bold((jshint_output.length - 1) + ' jshint issues were updated to ' + pr_url));
            }
            if (jscs_output.length > 1) {
                commentToPR(jscs_output.join('\n'), opt);
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

        if (opt.git_token && opt.git_repo && opt.git_sha) {
            if (jshint_output.length > 1) {
                if (opt.jshint_status) {
                    createStatusToCommit({
                        state: opt.jshint_status,
                        description: (jshint_output.length - 1) + ' jshint issues found',
                        context: 'gulp-github/jshint'
                    }, opt);
                }
            }

            if (jscs_output.length > 1) {
                if (opt.jscs_status) {
                    createStatusToCommit({
                        state: opt.jscs_status,
                        description: (jscs_output.length - 1) + ' jscs issues found',
                        context: 'gulp-github/jscs'
                    }, opt);
                }
            }
        }

        cb();
    });
};

module.exports.commentToPR = commentToPR;
module.exports.createStatusToCommit = createStatusToCommit;
module.exports.failThisTask = failThisTask;
module.exports.failMergedPR = failMergedPR;
module.exports.isMerge = isMerge;
