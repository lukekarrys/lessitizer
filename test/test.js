var Lab = require('lab');
var lessitizer = require('..');
var path = require('path');
var fs = require('fs');
var rmrf = require('rmrf');
var fileAsContents = function (f) {
    return fs.readFileSync(f, 'utf8');
};
var filePath = function (f) {
    return path.join(__dirname, '..', 'sample', 'less', f + '.less');
};
var buildDir = function () {
    var _buildDir = path.join(__dirname, '..', '_build');
    var exists = fs.existsSync(_buildDir);
    if (exists) {
        rmrf(_buildDir);
    }
    fs.mkdirSync(_buildDir);
    return _buildDir;
};

Lab.experiment('Init', function () {
    Lab.test('Builds an array', function (done) {
        lessitizer({
            files: ['app-combined'].map(filePath),
            outputDir: buildDir()
        }, function (err, files) {
            Lab.expect(err).to.equal(null);
            Lab.expect(Array.isArray(files)).to.equal(true);
            Lab.expect(files.length).to.equal(1);
            Lab.expect(typeof files[0]).to.equal('string');
            Lab.expect(files[0].length > 1).to.equal(true);
            done();
        });
    });

    Lab.test('Builds a file string', function (done) {
        lessitizer({
            files: filePath('app-combined'),
            outputDir: buildDir()
        }, function (err, files) {
            Lab.expect(err).to.equal(null);
            Lab.expect(Array.isArray(files)).to.equal(true);
            Lab.expect(files.length).to.equal(1);
            Lab.expect(typeof files[0]).to.equal('string');
            Lab.expect(files[0].length > 1).to.equal(true);
            done();
        });
    });
});

Lab.experiment('Errors', function () {
    Lab.test('No files', function (done) {
        lessitizer({
            outputDir: buildDir()
        }, function (err) {
            Lab.expect(err instanceof Error).to.equal(true);
            done();
        });
    });

    Lab.test('Null files', function (done) {
        lessitizer({
            outputDir: buildDir(),
            files: null
        }, function (err) {
            Lab.expect(err instanceof Error).to.equal(true);
            done();
        });
    });

    Lab.test('No callback throws', function (done) {
        function noOutputDir() {
            lessitizer({
                files: ['app-combined'].map(filePath)
            });
        }

        Lab.expect(noOutputDir).to.throw(Error);
        done();
    });
});

Lab.experiment('Dont write to file', function () {
    Lab.test('No outputDir', function (done) {
        lessitizer({
            files: ['app-combined'].map(filePath)
        }, function (err, css) {
            Lab.expect(err).to.equal(null);
            Lab.expect(Array.isArray(css)).to.equal(true);
            Lab.expect(css.length).to.equal(1);
            Lab.expect(typeof css[0]).to.equal('string');
            Lab.expect(css[0].indexOf('body {')).to.equal(0);
            done();
        });
    });

    Lab.test('multiple files', function (done) {
        lessitizer({
            files: ['app-combined', 'app-combined2'].map(filePath)
        }, function (err, css) {
            Lab.expect(err).to.equal(null);
            Lab.expect(Array.isArray(css)).to.equal(true);
            Lab.expect(css.length).to.equal(2);
            Lab.expect(typeof css[0]).to.equal('string');
            Lab.expect(typeof css[1]).to.equal('string');
            Lab.expect(css[0] === css[1]).to.equal(true);
            done();
        });
    });
});

Lab.experiment('Pass in less strings', function () {
    Lab.test('with dir property', function (done) {
        lessitizer({
            files: {
                less: fileAsContents(filePath('app-combined')),
                dir: path.dirname(filePath('app-combined'))
            }
        }, function (err, css) {
            Lab.expect(err).to.equal(null);
            Lab.expect(typeof css[0]).to.equal('string');
            done();
        });
    });

    Lab.test('with filename property', function (done) {
        lessitizer({
            files: {
                less: fileAsContents(filePath('app-combined')),
                filename: filePath('app-combined')
            }
        }, function (err, css) {
            Lab.expect(err).to.equal(null);
            Lab.expect(typeof css[0]).to.equal('string');
            done();
        });
    });

    Lab.test('with filename property and outputDir', function (done) {
        lessitizer({
            files: {
                less: fileAsContents(filePath('app-combined')),
                filename: filePath('app-combined')
            },
            outputDir: buildDir()
        }, function (err, css) {
            Lab.expect(err).to.equal(null);
            Lab.expect(typeof css[0]).to.equal('string');
            done();
        });
    });


    Lab.test('written to output dir w/ no filename', function (done) {
        lessitizer({
            files: {
                less: fileAsContents(filePath('app-combined')),
                dir: path.dirname(filePath('app-combined'))
            },
            outputDir: buildDir()
        }, function (err, css) {
            Lab.expect(err).to.equal(null);
            Lab.expect(typeof css[0]).to.equal('string');
            Lab.expect(css[0].indexOf('lessitizier-file-1.css') > -1).to.equal(true);
            Lab.expect(css[0].indexOf('_build/') > -1).to.equal(true);
            done();
        });
    });

    Lab.test('written to output dir w/ filename', function (done) {
        lessitizer({
            files: {
                less: fileAsContents(filePath('app-combined')),
                dir: path.dirname(filePath('app-combined')),
                filename: 'cool-less-file.less'
            },
            outputDir: buildDir()
        }, function (err, css) {
            Lab.expect(err).to.equal(null);
            Lab.expect(typeof css[0]).to.equal('string');
            Lab.expect(css[0].indexOf('cool-less-file.css') > -1).to.equal(true);
            Lab.expect(css[0].indexOf('_build/') > -1).to.equal(true);
            done();
        });
    });

        Lab.test('written to output dir w/ filename w/o less ext', function (done) {
        lessitizer({
            files: {
                less: fileAsContents(filePath('app-combined')),
                dir: path.dirname(filePath('app-combined')),
                filename: 'cool-less-file'
            },
            outputDir: buildDir()
        }, function (err, css) {
            Lab.expect(err).to.equal(null);
            Lab.expect(typeof css[0]).to.equal('string');
            Lab.expect(css[0].indexOf('cool-less-file.css') > -1).to.equal(true);
            Lab.expect(css[0].indexOf('_build/') > -1).to.equal(true);
            done();
        });
    });

    Lab.test('Use less paths', function (done) {
        lessitizer({
            files: {
                less: fileAsContents(filePath('app-combined'))
            },
            // Get paths from less options
            less: {
                paths: [path.dirname(filePath('app-combined'))]
            }
        }, function (err, css) {
            Lab.expect(err).to.equal(null);
            Lab.expect(typeof css[0]).to.equal('string');
            done();
        });
    });

    Lab.test('No filename', function (done) {
        lessitizer({
            files: {
                less: fileAsContents(filePath('app-combined'))
            }
        }, function (err, css) {
            Lab.expect(err instanceof Error).to.equal(true);
            Lab.expect(css[0]).to.equal(undefined);
            done();
        });
    });

    Lab.test('Doesnt need a filename', function (done) {
        lessitizer({
            files: {
                less: fileAsContents(filePath('noimports'))
            }
        }, function (err, css) {
            Lab.expect(err).to.equal(null);
            Lab.expect(typeof css[0]).to.equal('string');
            Lab.expect(css[0].indexOf('body {')).to.equal(0);
            Lab.expect(css[0].indexOf('font-size: 100px;') > -1).to.equal(true);
            Lab.expect(css[0].indexOf('body p {') > -1).to.equal(true);
            done();
        });
    });
});

Lab.experiment('Warns for overwriting props', function () {
    Lab.test('less.outputDir and filename', function (done) {
        lessitizer({
            files: ['app-combined'].map(filePath),
            outputDir: buildDir(),
            less: {
                outputDir: 'here',
                filename: 'thisfilename'
            }
        }, function (err, files) {
            Lab.expect(err).to.equal(null);
            Lab.expect(Array.isArray(files)).to.equal(true);
            Lab.expect(files.length).to.equal(1);
            Lab.expect(typeof files[0]).to.equal('string');
            Lab.expect(files[0].length > 1).to.equal(true);
            done();
        });
    });
});

Lab.experiment('Output dir errors', function () {
    Lab.test('Bad output dir', function (done) {
        lessitizer({
            files: ['app-combined'].map(filePath),
            outputDir: '/this/does/not/exist/',
            developmentMode: true
        }, function (err, files) {
            Lab.expect(err instanceof Error).to.equal(true);
            Lab.expect(err.message.indexOf('ENOENT')).to.equal(0);
            Lab.expect(files[0]).to.equal(undefined);
            done();
        });
    });

    Lab.test('Good output dir', function (done) {
        lessitizer({
            files: ['app-err'].map(filePath),
            outputDir: buildDir(),
            developmentMode: true
        }, function (err, files) {
            Lab.expect(err).to.equal(null);
            Lab.expect(Array.isArray(files)).to.equal(true);
            Lab.expect(files.length).to.equal(1);
            Lab.expect(typeof files[0]).to.equal('string');
            Lab.expect(files[0].length > 1).to.equal(true);
            done();
        });
    });
});

Lab.experiment('CSS errors', function () {
    Lab.test('Dev mode', function (done) {
        var _buildDir = buildDir();
        lessitizer({
            files: ['app-err'].map(filePath),
            outputDir: _buildDir,
            developmentMode: true
        }, function (err, files) {
            Lab.expect(Array.isArray(files)).to.equal(true);
            Lab.expect(files.length).to.equal(1);
            Lab.expect(typeof files[0]).to.equal('string');
            Lab.expect(files[0].length > 1).to.equal(true);
            var writtenFile = fs.readFileSync(_buildDir + '/app-err.css', 'utf8');
            Lab.expect(writtenFile.indexOf('body:before { content:')).to.not.equal(-1);
            done();
        });
    });

    Lab.test('Prod mode', function (done) {
        var _buildDir = buildDir();
        lessitizer({
            files: ['app-err'].map(filePath),
            outputDir: _buildDir
        }, function (err, files) {
            Lab.expect(err instanceof Error).to.equal(true);
            Lab.expect(err.message.indexOf('ParseError')).to.equal(0);
            Lab.expect(files[0]).to.equal(undefined);
            done();
        });
    });
});