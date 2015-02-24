var less = require('less');
var path = require('path');
var async = require('async');
var defaults = require('defaults');
var fs = require('fs');
var cssesc = require('cssesc');
var _ = require('lodash');


function overwriteWarn(msg) {
    console.warn('Lessitizer will overwrite the passed in ' + msg + ' option');
}

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

function isPath(str) {
    return _.isString(str) && str.indexOf(path.sep) > -1;
}


module.exports = function (options, done) {
    var optionsErr;

    // Defaults, yo
    defaults(options, {
        files: [],
        less: {},
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
    if (options.less.outputDir) {
        overwriteWarn('less.outputDir');
    }
    if (options.less.filename) {
        overwriteWarn('less.filename');
    }
    delete options.less.outputDir;
    delete options.less.filename;

    var lessFiles = Array.isArray(options.files) ? options.files : [options.files];
    var outputDir = options.outputDir;
    var count = 1;

    async.map(lessFiles, function _lessFile(lessFile, fileDone) {
        var lessOptions = _.cloneDeep(options.less);
        var paths, lessFileName, lessDir, lessString, cssPath;

        if (typeof lessFile === 'string') {
            lessDir = path.dirname(lessFile);
            lessFileName = path.basename(lessFile);
        } else {
            lessDir = lessFile.dir;
            lessFileName = lessFile.filename;
            lessString = lessFile.less;
        }

        // Make a fallback less file name
        if (!lessFileName) {
            lessFileName = 'lessitizer-file-' + count++ + '.less';
        }

        // If we have an output dir, create the path to write the css file
        if (outputDir) {
            cssPath = path.resolve(outputDir, path.basename(lessFileName, '.less') + '.css');
        }

        // If we dont have a string, read it from the file
        if (!lessString && typeof lessFile === 'string') {
            lessString = fs.readFileSync(path.resolve(lessFile), 'utf8');
        }

        // Paths for less parser to use for imports
        // - include our dir and filename if we have one
        // - include user supplied options too
        // - include the outputDir if there are no other paths
        paths = _.chain([lessDir, lessFileName, lessOptions.paths]).flatten().filter(isPath).value();
        if (paths.length === 0 && isPath(outputDir)) {
            paths.push(outputDir);
        }

        defaults(lessOptions, {
            optimization: 1,
            relativeUrls: true,
            paths: _.uniq(['.'].concat(paths)),
            filename: lessFileName,
            outputDir: outputDir
        });

        less.render(lessString, lessOptions, function _parseLess(lessErr, cssObj) {
            var css;
            lessErr && (lessErr = less.formatError(lessErr));

            if (lessErr && !options.developmentMode) {
                return fileDone(new Error(lessErr));
            } else if (lessErr) {
                css = cssErr(lessErr);
            } else {
                css = cssObj.css;
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