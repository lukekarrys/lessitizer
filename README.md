lessitizer
===============

[![Greenkeeper badge](https://badges.greenkeeper.io/lukekarrys/lessitizer.svg)](https://greenkeeper.io/)

[![NPM](https://nodei.co/npm/lessitizer.png)](https://nodei.co/npm/lessitizer/)
[![Build Status](https://travis-ci.org/lukekarrys/lessitizer.png?branch=master)](https://travis-ci.org/lukekarrys/lessitizer)

**Easy Less processing for node/moonboots projects.**


## Install

`npm install lessitizer --save`


## Usage

```js
// Parse `styles/less/theme.less` and `styles/less/app.less`
// and write them to `styles/css/theme.css` and `styles/css/app.css`
lessitizer({
    files: [
        __dirname + '/styles/less/theme.less',
        __dirname + '/styles/less/app.less'
    ]
    outputDir: __dirname + '/styles/css',
}, function (err, cssPaths) {
    console.log(err || 'No errors!');
    // An array of generated css paths
    console.log(cssFiles);
});
```

```js
// Parse the Less strings and pass it to the callback
lessitizer({
    files: [{
        less: 'body { p { color: red; } }'
    }, {
        less: 'body { a { color: blue; } }'
    }]
}, function (err, css) {
    console.log(err || 'No errors!');
    // An array of generated css:
    console.log(css.join('\n'));
    // body p {
    //   color: red;
    // }
    //
    // body a {
    //   color: blue;
    // }
});
```


## API

- `files` (`String` or `Array`, required)

Each `files` can be one of two things:
  - a path to a less file
  - an object with a `less` property that is a string of Less

In the case where you are passing an object, you can also include a `dir` property. This is the path to where the directory where Less file *should* be, if it were actually written to disk. This will allow you to use Less's `@import` syntax relative to the `dir` you pass in.

You can also pass in a `filename` option to specify the name of the file when/if it gets written to disk.

It should look like this:

```js
{
  less: '@import...',
  dir: '/path/to/less/styles',
  filename: 'cool-file'
}
```

- `outputDir` (`String`, optional)

The path to the directory where all the CSS files will be written. If this is omitted, then the generated CSS will be passed to the callback.

- `less` (`Object`, see below for defaults)

An object that will be passed directly to `new less.Parser()`. See the [Less configuration](http://lesscss.org/#using-less-configuration) docs for available options. There are a few default values:

```json
{
    "optimization": 1,
    "relativeUrls": true,
    "paths": [DIR_OF_LESS_FILE],
    "filename": "NAME_OF_LESS_FILE.less"
}
```

- `developmentMode` (`Boolean`, default `false`)

If `developmentMode` is `true`, any errors will be written to the CSS file and displayed instead of the `body`.


## Examples

Run `npm start` to see the output from `sample/build.js` and the css written to `sample/css` and `sample/cssErr`. This will also start a server so you can go the to [regular](http://localhost:8000/) and [error](http://localhost:8000/error.html) pages.


## Tests and Code Coverage

Run `npm test`.


### LICENSE

MIT