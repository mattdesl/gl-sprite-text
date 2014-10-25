# gl-sprite-text

[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

![text](http://i.imgur.com/P5zUbNo.png)

A solution for bitmap and [SDF](http://www.valvesoftware.com/publications/2007/SIGGRAPH2007_AlphaTestedMagnification.pdf) text rendering in stack.gl. This uses [gl-sprite-batch](https://nodei.co/npm/gl-sprite-batch/) and [fontpath](https://www.npmjs.org/package/fontpath-simple-renderer) under the hood. 

The [BMFont spec](https://www.npmjs.org/package/bmfont2json) is used for glyph and font data. You also need to pass an array of [gl-texture2d](https://www.npmjs.org/package/gl-texture2d) items matching the `paths` specified by the font file. (Multi-page fonts are supported.)

The `font` object can also include an `images` array (ndarray/HTMLImage), which will get piped into `gl-texture2d`.  You can use [bmfont-lato](https://www.npmjs.org/package/bmfont-lato) for testing; it includes Lato Regular in a few sizes and the base64-inlined `images` ndarray.

```js
var createText = require('gl-sprite-text')
var Lato = require('bmfont-lato')

//build the text
text = createText(gl, {
    font: Lato,
    text: 'Hello, World!'
})

//optionally word-wrap it to a specific width
text.layout(500)

function render() { 
    //draws the text with lower-left origin
    text.draw(shader)
}
```

See [demo/simple.js](demo/simple.js) for an example. After `npm install`, you can run it with:

```npm run demo-simple```

## Tools

After you've exported the BMFont with [your favourite tool](https://github.com/libgdx/libgdx/wiki/Hiero), you can run it through [bmfont2json](https://www.npmjs.org/package/bmfont2json) to produce valid output:

```sh
# if you haven't already, install the tool globally
npm install bmfont2json -g

# then you can use it like so..
bmfont2json Lato32.fnt > Lato32.json
```

## Signed Distance Fields

Bitmap fonts are great for fixed-size text, but if you need large fonts, or fonts that scale smoothly (i.e. if it's being 3D transformed), it's better to use alpha testing to avoid aliasing artifacts. To generate SDF font atlases, you can use [Hiero and LibGDX](https://github.com/libgdx/libgdx/wiki/Distance-field-fonts). Then, you need to render it with a signed distance field shader. See the [demo/sdf.js](demo/sdf.js) example:

```npm run demo-sdf```

As you can see from the demo, you can also achieve drop shadows, outlines, glows and other effects with independent colors. 

## Static Text

By default, the text is pushed to dynamic buffers every frame. This allows it to animate (e.g. changing position, start/end indices, text content), and also ensures that underlines and multi-page textures will work. 

Basic static text is supported with the `cache()` method. Static text only supports a single texture page, and no underlines. 

```js
var text = createText(gl, {
    font: myFont,
    textures: textures,
    text: str,

    //hint to buffers that they will be static
    dynamic: false
})

//cache the current text state
text.cache(x, y, start, end)

function render() {
    text.draw(shader)
}
```

## Usage

[![NPM](https://nodei.co/npm/gl-sprite-text.png)](https://nodei.co/npm/gl-sprite-text/)

Inherits from `fontpath-simple-renderer` so the API should work, but this module may diverge from it in the future. Here is the current public API:

#### `text = createText(opts)`

The following options can be provided:

- `font` the bitmap font object, required
- `textures` an array of gl textures to match `font.paths`. If this is not specified, it will look for an `images` array in the `font` object, which can be ndarrays, HTMLImage objects, or anything that gets piped to `createTexture`.
- `text` the string of text we will be rendering, default to empty string
- `align` a string 'left', 'center', 'right', default left
- `underline` boolean, whether to underline the text, default false
- `underlinePosition` the position of underline in pixels, defaults to a fraction of font size
- `underlineThickness` the underline thickness in pixels, defaults to a fraction of font size
- `lineHeight` a line height in pixels, otherwise defaults to an automatic gap
- `letterSpacing` the letter spacing in pixels, default 0
- `wrapMode` can be `normal`, `pre`, or `nowrap`, default `normal`
- `wrapWidth` an initial number in pixels which is passed to `layout()` after the other options have been set. Otherwise, defaults to no layout (a single line, no breaks)
- `capacity` an initial capacity to use for gl-sprite-batch
- `dynamic` whether the WebGL buffers should use `DYNAMIC_DRAW`, default true

All options except for `font`, `wrapMode` and `wrapWidth` are fields which be changed at runtime, before calling `draw()`.

*Note:* Changing the `text` currently calls `clearLayout()`. You will need to call `layout()` again. 

#### `text.draw(shader[, x, y, start, end])`

Draws the text with the given shader, at the specified pixel position (lower-left origin). 

The `start` (inclusive) and `end` (exclusive) indices will draw the laid out glyphs within those bounds. This can be used to style and colour different pieces of text. If not specified, they will default to 0 and the text length, respectively.

If text is cached, the `x, y, start, end` parameters are ignored.

#### `text.layout([wrapWidth])`

Word-wraps the text with the current wrap mode to the optional given width. You can change the wrap mode like so:

```js
text.wordwrap.mode = 'pre'
text.layout(250)
```

If no width is specified, it will only break on explicit newline characters `\n`.

This creates some new objects in memory, so you may not want to do it every frame. 

#### `text.clearLayout()`

Clears the current word-wrapping. This leads to a single line of text, no line-breaks. 

#### `text.getBounds()`

Returns an object with the computed bounds of the text box:

```{ x, y, width height }```

This can be used to draw the text at an upper-left origin instead.

#### `text.cache([x, y, start, end])`

Caches the current text parameters into a static buffer. Underlines are not supported; and this only works with one texture page (e.g. all glyphs in a single sprite sheet).

The parameters replace those in `draw()`. When cached, `draw()` will ignore the `x, y, start, end` parameters.

#### `text.uncache()`

Disables caching, allowing it to be animated dynamically again. 

#### `text.dispose([textures])`

If no `batch` was provided during the constructor, this will dispose of the default (internally created) batch. 

Specifying true for `textures` (default false) will also dispose of the texture array associated with this text object.

## License

MIT, see [LICENSE.md](http://github.com/mattdesl/gl-sprite-text/blob/master/LICENSE.md) for details.