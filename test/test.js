var Code = require('code')
var Lab = require('lab')
var lab = exports.lab = Lab.script()
var lessitizer = require('..')
var path = require('path')
var fs = require('fs')
var rmrf = require('rmrf')
var fileAsContents = function (f) {
  return fs.readFileSync(f, 'utf8')
}
var filePath = function (f) {
  return path.join(__dirname, '..', 'sample', 'less', f + '.less')
}
var lessDir = path.join(__dirname, '..', 'sample', 'less')
var buildDir = function () {
  var _buildDir = path.join(__dirname, '..', '_build')
  var exists = fs.existsSync(_buildDir)
  if (exists) {
    rmrf(_buildDir)
  }
  fs.mkdirSync(_buildDir)
  return _buildDir
}

lab.after((done) => {
  rmrf(path.join(__dirname, '..', '_build'))
  done()
})

lab.experiment('Init', function () {
  lab.test('Builds an array', function (done) {
    lessitizer({
      files: ['app-combined'].map(filePath),
      outputDir: buildDir()
    }, function (err, files) {
      Code.expect(err).to.equal(null)
      Code.expect(Array.isArray(files)).to.equal(true)
      Code.expect(files.length).to.equal(1)
      Code.expect(typeof files[0]).to.equal('string')
      Code.expect(files[0].length > 1).to.equal(true)
      done()
    })
  })

  lab.test('Builds a file string', function (done) {
    lessitizer({
      files: filePath('app-combined'),
      outputDir: buildDir()
    }, function (err, files) {
      Code.expect(err).to.equal(null)
      Code.expect(Array.isArray(files)).to.equal(true)
      Code.expect(files.length).to.equal(1)
      Code.expect(typeof files[0]).to.equal('string')
      Code.expect(files[0].length > 1).to.equal(true)
      done()
    })
  })
})

lab.experiment('Errors', function () {
  lab.test('No files', function (done) {
    lessitizer({
      outputDir: buildDir()
    }, function (err) {
      Code.expect(err instanceof Error).to.equal(true)
      done()
    })
  })

  lab.test('Null files', function (done) {
    lessitizer({
      outputDir: buildDir(),
      files: null
    }, function (err) {
      Code.expect(err instanceof Error).to.equal(true)
      done()
    })
  })

  lab.test('No callback throws', function (done) {
    function noOutputDir () {
      lessitizer({
        files: ['app-combined'].map(filePath)
      })
    }

    Code.expect(noOutputDir).to.throw(Error)
    done()
  })
})

lab.experiment('Dont write to file', function () {
  lab.test('No outputDir', function (done) {
    lessitizer({
      files: ['app-combined'].map(filePath)
    }, function (err, css) {
      Code.expect(err).to.equal(null)
      Code.expect(Array.isArray(css)).to.equal(true)
      Code.expect(css.length).to.equal(1)
      Code.expect(typeof css[0]).to.equal('string')
      Code.expect(css[0].indexOf('body {')).to.equal(0)
      done()
    })
  })

  lab.test('multiple files', function (done) {
    lessitizer({
      files: ['app-combined', 'app-combined2'].map(filePath)
    }, function (err, css) {
      Code.expect(err).to.equal(null)
      Code.expect(Array.isArray(css)).to.equal(true)
      Code.expect(css.length).to.equal(2)
      Code.expect(typeof css[0]).to.equal('string')
      Code.expect(typeof css[1]).to.equal('string')
      Code.expect(css[0] === css[1]).to.equal(true)
      done()
    })
  })
})

lab.experiment('Pass in less strings', function () {
  lab.test('with dir property', function (done) {
    lessitizer({
      files: {
        less: fileAsContents(filePath('app-combined')),
        dir: path.dirname(filePath('app-combined'))
      }
    }, function (err, css) {
      Code.expect(err).to.equal(null)
      Code.expect(typeof css[0]).to.equal('string')
      done()
    })
  })

  lab.test('with filename property', function (done) {
    lessitizer({
      files: {
        less: fileAsContents(filePath('app-combined')),
        filename: filePath('app-combined')
      }
    }, function (err, css) {
      Code.expect(err).to.equal(null)
      Code.expect(typeof css[0]).to.equal('string')
      done()
    })
  })

  lab.test('with filename property and outputDir', function (done) {
    lessitizer({
      files: {
        less: fileAsContents(filePath('app-combined')),
        filename: filePath('app-combined')
      },
      outputDir: buildDir()
    }, function (err, css) {
      Code.expect(err).to.equal(null)
      Code.expect(typeof css[0]).to.equal('string')
      done()
    })
  })

  lab.test('written to output dir w/ no filename', function (done) {
    lessitizer({
      files: {
        less: fileAsContents(filePath('app-combined')),
        dir: path.dirname(filePath('app-combined'))
      },
      outputDir: buildDir()
    }, function (err, css) {
      Code.expect(err).to.equal(null)
      Code.expect(typeof css[0]).to.equal('string')
      Code.expect(css[0].indexOf('lessitizer-file-1.css') > -1).to.equal(true)
      Code.expect(css[0].indexOf('_build/') > -1).to.equal(true)
      done()
    })
  })

  lab.test('written to output dir w/ filename', function (done) {
    lessitizer({
      files: {
        less: fileAsContents(filePath('app-combined')),
        dir: path.dirname(filePath('app-combined')),
        filename: 'cool-less-file.less'
      },
      outputDir: buildDir()
    }, function (err, css) {
      Code.expect(err).to.equal(null)
      Code.expect(typeof css[0]).to.equal('string')
      Code.expect(css[0].indexOf('cool-less-file.css') > -1).to.equal(true)
      Code.expect(css[0].indexOf('_build/') > -1).to.equal(true)
      done()
    })
  })

  lab.test('uses outputDir as an import path', function (done) {
    lessitizer({
      files: {
        less: fileAsContents(filePath('app-combined'))
      },
      outputDir: lessDir
    }, function (err, css) {
      var cssPath = css[0]
      var cssContents = fileAsContents(cssPath)
      Code.expect(err).to.equal(null)
      Code.expect(typeof cssContents).to.equal('string')
      Code.expect(cssContents.indexOf('body {')).to.equal(0)
      Code.expect(cssPath.indexOf('lessitizer-file-1.css') > -1).to.equal(true)
      Code.expect(cssPath.indexOf(lessDir) > -1).to.equal(true)
      fs.unlink(cssPath)
      done()
    })
  })

  lab.test('written to output dir w/ filename w/o less ext', function (done) {
    lessitizer({
      files: {
        less: fileAsContents(filePath('app-combined')),
        dir: path.dirname(filePath('app-combined')),
        filename: 'cool-less-file'
      },
      outputDir: buildDir()
    }, function (err, css) {
      Code.expect(err).to.equal(null)
      Code.expect(typeof css[0]).to.equal('string')
      Code.expect(css[0].indexOf('cool-less-file.css') > -1).to.equal(true)
      Code.expect(css[0].indexOf('_build/') > -1).to.equal(true)
      done()
    })
  })

  lab.test('Use less paths', function (done) {
    lessitizer({
      files: {
        less: fileAsContents(filePath('app-combined'))
      },
      // Get paths from less options
      less: {
        paths: [path.dirname(filePath('app-combined'))]
      }
    }, function (err, css) {
      Code.expect(err).to.equal(null)
      Code.expect(typeof css[0]).to.equal('string')
      done()
    })
  })

  lab.test('No filename', function (done) {
    lessitizer({
      files: {
        less: fileAsContents(filePath('app-combined'))
      }
    }, function (err, css) {
      Code.expect(err instanceof Error).to.equal(true)
      Code.expect(css[0]).to.equal(undefined)
      done()
    })
  })

  lab.test('Doesnt need a filename', function (done) {
    lessitizer({
      files: {
        less: fileAsContents(filePath('noimports'))
      }
    }, function (err, css) {
      Code.expect(err).to.equal(null)
      Code.expect(typeof css[0]).to.equal('string')
      Code.expect(css[0].indexOf('body {')).to.equal(0)
      Code.expect(css[0].indexOf('font-size: 100px;') > -1).to.equal(true)
      Code.expect(css[0].indexOf('body p {') > -1).to.equal(true)
      done()
    })
  })
})

lab.experiment('Warns for overwriting props', function () {
  lab.test('less.outputDir and filename', function (done) {
    lessitizer({
      files: ['app-combined'].map(filePath),
      outputDir: buildDir(),
      less: {
        outputDir: 'here',
        filename: 'thisfilename'
      }
    }, function (err, files) {
      Code.expect(err).to.equal(null)
      Code.expect(Array.isArray(files)).to.equal(true)
      Code.expect(files.length).to.equal(1)
      Code.expect(typeof files[0]).to.equal('string')
      Code.expect(files[0].length > 1).to.equal(true)
      done()
    })
  })
})

lab.experiment('Output dir errors', function () {
  lab.test('Bad output dir', function (done) {
    lessitizer({
      files: ['app-combined'].map(filePath),
      outputDir: '/this/does/not/exist/',
      developmentMode: true
    }, function (err, files) {
      Code.expect(err instanceof Error).to.equal(true)
      Code.expect(err.message.indexOf('ENOENT')).to.equal(0)
      Code.expect(files[0]).to.equal(undefined)
      done()
    })
  })

  lab.test('Good output dir', function (done) {
    lessitizer({
      files: ['app-err'].map(filePath),
      outputDir: buildDir(),
      developmentMode: true
    }, function (err, files) {
      Code.expect(err).to.equal(null)
      Code.expect(Array.isArray(files)).to.equal(true)
      Code.expect(files.length).to.equal(1)
      Code.expect(typeof files[0]).to.equal('string')
      Code.expect(files[0].length > 1).to.equal(true)
      done()
    })
  })
})

lab.experiment('CSS errors', function () {
  lab.test('Dev mode', function (done) {
    var _buildDir = buildDir()
    lessitizer({
      files: ['app-err'].map(filePath),
      outputDir: _buildDir,
      developmentMode: true
    }, function (err, files) {
      Code.expect(err).to.equal(null)
      Code.expect(Array.isArray(files)).to.equal(true)
      Code.expect(files.length).to.equal(1)
      Code.expect(typeof files[0]).to.equal('string')
      Code.expect(files[0].length > 1).to.equal(true)
      var writtenFile = fs.readFileSync(_buildDir + '/app-err.css', 'utf8')
      Code.expect(writtenFile.indexOf('body:before { content:')).to.not.equal(-1)
      done()
    })
  })

  lab.test('Prod mode', function (done) {
    var _buildDir = buildDir()
    lessitizer({
      files: ['app-err'].map(filePath),
      outputDir: _buildDir
    }, function (err, files) {
      Code.expect(err instanceof Error).to.equal(true)
      Code.expect(err.message.indexOf('ParseError')).to.equal(0)
      Code.expect(files[0]).to.equal(undefined)
      done()
    })
  })
})
