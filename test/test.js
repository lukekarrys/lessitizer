var Lab = require('lab');
var lessitizer = require('..');
var path = require('path');
var fs = require('fs');
var rmrf = require('rmrf');
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
            Lab.expect(files.length).to.equal(1);
            done();
        });
    });

    Lab.test('Builds a file string', function (done) {
        lessitizer({
            files: filePath('app-combined'),
            outputDir: buildDir()
        }, function (err, files) {
            Lab.expect(err).to.equal(null);
            Lab.expect(files.length).to.equal(1);
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

    Lab.test('No outputDir', function (done) {
        lessitizer({
            files: ['app-combined'].map(filePath)
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


Lab.experiment('Output dir errors', function () {
    Lab.test('Bad output dir', function (done) {
        lessitizer({
            files: ['app-combined'].map(filePath),
            outputDir: '/this/does/not/exist/',
            developmentMode: true
        }, function (err, files) {
            Lab.expect(err instanceof Error).to.equal(true);
            Lab.expect(err.message.indexOf('ENOENT')).to.equal(0);
            Lab.expect(files.length).to.equal(1);
            done();
        });
    });

    Lab.test('Bad output dir', function (done) {
        lessitizer({
            files: ['app-err'].map(filePath),
            outputDir: buildDir(),
            developmentMode: true
        }, function (err, files) {
            Lab.expect(err.indexOf('ParseError')).to.equal(0);
            Lab.expect(files.length).to.equal(1);
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
            Lab.expect(typeof err).to.equal('string');
            Lab.expect(err.indexOf('ParseError')).to.equal(0);
            Lab.expect(files.length).to.equal(1);
            var writtenFile = fs.readFileSync(_buildDir + '/app-err.css', 'utf8');
            Lab.expect(writtenFile.indexOf('body:before { content:')).to.not.equal(-1);
            done();
        });
    });

    Lab.test('Dev mode', function (done) {
        var _buildDir = buildDir();
        lessitizer({
            files: ['app-err'].map(filePath),
            outputDir: _buildDir
        }, function (err, files) {
            Lab.expect(typeof err).to.equal('string');
            Lab.expect(err.indexOf('ParseError')).to.equal(0);
            Lab.expect(files.length).to.equal(1);
            done();
        });
    });
});