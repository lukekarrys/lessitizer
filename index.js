var less = require('less');
var path = require('path');
var async = require('async');
var defaults = require('defaults');
var fs = require('fs');
var cssesc = require('cssesc');
var _ = require('lodash');


function passError(err, cb) {
    if (cb) {
        cb(err);
    } else {
        throw err;
    }
}

function cssErr(err) {
    var errMessage = cssesc("Lessitizer error: \n\n" + err, { escapeEverything: true });
    var css = fs.readFileSync(path.join(__dirname, 'error.css')).toString();
    css += 'body:before { content: "' + errMessage + '"; }';
    return css;
}

module.exports = function (options, done) {
    var optionsErr;

    // Defaults, yo
    defaults(options, {
        files: [],
        less: {},
        toCSS: {},
        developmentMode: false,
        outputDir: null
    });

    // Some real bad errors right here
    if (!options.files || options.files.length === 0) {
        optionsErr = new Error('You must specify some `files`.');
    }

    if (!done || typeof done !== 'function') {
        optionsErr = new Error('A callback must be specified.');
    }

    if (optionsErr) {
        return passError(optionsErr, done);
    }

    // Some options we dont allow
    delete options.less.outputDir;
    delete options.less.filename;

    var lessFiles = Array.isArray(options.files) ? options.files : [options.files];
    var outputDir = options.outputDir;

    async.map(lessFiles, function _lessFile(lessFile, fileDone) {
        var filename;
        var lessString;
        var lessDir;
        var lessOptions = _.clone(options.less);
        var paths = [];

        if (typeof lessFile === 'string') {
            filename = lessFile;
        } else {
            lessDir = path.extname(lessFile.dir) === '.less' ? path.dirname(lessFile.dir) : lessFile.dir;
            lessString = lessFile.less;
        }

        var lessFileName = filename ? path.basename(filename) : 'lessitizier-file-' + _.uniqueId() + '.less';
        var cssPath = outputDir ? path.resolve(outputDir, path.basename(lessFileName, '.less') + '.css') : null;

        if (!lessDir) {
            lessDir = path.dirname(filename) !== '.' ? path.dirname(filename) : null;
        }

        if (!lessString && lessDir) {
            lessString = fs.readFileSync(path.resolve(lessDir, lessFileName), 'utf8');
        }

        if (lessDir) {
            paths.push(lessDir);
        }

        if (lessOptions.paths) {
            paths = paths.concat(lessOptions.paths);
        }

        defaults(lessOptions, {
            optimization: 1,
            relativeUrls: true,
            paths: _.uniq(paths),
            filename: lessFileName,
            outputDir: outputDir
        });

        new less.Parser(lessOptions)
        .parse(lessString, function _parseLess(lessErr, cssTree) {
            var css;
            lessErr && (lessErr = less.formatError(lessErr));

            if (lessErr && !options.developmentMode) {
                return fileDone(new Error(lessErr));
            } else if (lessErr) {
                css = cssErr(lessErr);
            } else {
                css = cssTree.toCSS(options.toCSS);
            }

            if (cssPath) {
                fs.writeFile(cssPath, css, {encoding: 'utf8'}, function (fileErr) {
                    if (fileErr) return fileDone(fileErr);
                    fileDone(null, cssPath);
                });
            } else {
                fileDone(null, css);
            }
        });
    }, function (err, results) {
        done(err || null, results);
    });
};