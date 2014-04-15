lessitizer
===============

[![NPM](https://nodei.co/npm/lessitizer.png)](https://nodei.co/npm/lessitizer/)
[![Build Status](https://travis-ci.org/lukekarrys/lessitizer.png?branch=master)](https://travis-ci.org/lukekarrys/lessitizer)

**Easy Less processing for node/moonboots projects.**


## Install

`npm install lessitizer --save`


## Usage

```js
lessitizer({
    files: __dirname + '/styles/less/app.less',
    outputDir: __dirname + '/styles/css',
    // See http://lesscss.org/#using-less-configuration for less/toCSS options
    less: {
        // Less parser options
    },
    toCSS: {
        // toCSS options
    }
}, function (err, files) {
    console.log(err || 'No errors!');
    console.log(files.join('\n'));
});
```


## API

- `files` (`String` or `Array`)

Each of these should be a path to a Less file that will be parsed and written to `outputDir`.

- `outputDir` (`String`)

The path to the directory where all the CSS files will be written.

- `less` (`Object`)

An object that will be passed directly to `new less.Parser()`. See the [Less configuration](http://lesscss.org/#using-less-configuration) docs for available options.

- `toCSS (`Object`)

An object that will be passed directly to `cssTree.toCSS()`. See the [Less configuration](http://lesscss.org/#using-less-configuration) docs for available options.


## Examples

Run `npm start` to see the output from `sample/build.js` and the css written to `sample/css` and `sample/cssErr`. This will also start a server so you can go the to [regular](http://localhost:8000/) and [error](http://localhost:8000/error.html) pages.


## Tests and Code Coverage

Run `npm test`.

### LICENSE

MIT