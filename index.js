var Base = require('fontpath-simple-renderer')
var inherits = require('inherits')
var bmfont2fontpath = require('fontpath-bmfont')
var texcoord = require('texcoord')
var xtend = require('xtend')

var Batch = require('gl-sprite-batch')

var tmpPos = [0, 0],
    tmpShape = [0, 0],
    tmp1 = [0, 0],
    tmp2 = [0, 0]
var DEFAULT_TEXCOORD = [0, 0, 1, 1]
var maxInitialCapacity = 500

function texcoordGlyph(glyph, atlas, out) {
    tmp1[0] = glyph.x
    tmp1[1] = glyph.y
    tmp2[0] = glyph.width
    tmp2[1] = glyph.height
    return texcoord(tmp1, tmp2, atlas, out)
}

function TextRenderer(gl, opt) {
    if (!(this instanceof TextRenderer))
        return new TextRenderer(gl, opt)
    opt = opt||{}

    if (!opt.font) 
        throw new Error('must specify bmfont at creation time')
    opt.font = bmfont2fontpath(opt.font)

    Base.call(this, opt)

    this.textures = opt.textures || []
    this.gl = gl
    if (!gl)
        throw new Error("must specify gl context")
    this.batch = opt.batch || null

    if (typeof opt.wrapWidth !== 'number')
        this.layout()
}

inherits(TextRenderer, Base)

TextRenderer.prototype.draw = function(shader, x, y, start, end) {
    if (!this.batch)
        this.batch = Batch(gl, { capacity: Math.min(this.text.length, maxInitialCapacity) })
    
    var batch = this.batch
    batch.clear()
    batch.bind(shader)
    this.build(x, y, start, end)
    batch.draw()
    batch.unbind()
}

TextRenderer.prototype.build = function(x, y, start, end) {
    var result = this.render(x, y, start, end)

    //a user calling push() is probably doing it for a static batch
    //in which case they need the capacity to match exactly
    if (!this.batch)
        this.batch = Batch(gl, { capacity: result.glyphs.length + result.underlines.length })

    var batch = this.batch
    batch.texcoord = DEFAULT_TEXCOORD
    batch.texture = null

    for (i = 0; i < result.underlines.length; i++) {
        var underline = result.underlines[i]
        batch.position = underline.position
        batch.shape = underline.size
        batch.push()
    }

    //now draw our glyphs into the batch...
    for (i = 0; i < result.glyphs.length; i++) {
        var g = result.glyphs[i]
        this._drawGlyph(batch, g)
    }
}

TextRenderer.prototype._drawGlyph = function(batch, data) {
    //TODO: we could sort these by texture page to reduce draws
    var glyph = data.glyph
    var img = this.textures[glyph.page]
    tmpPos[0] = data.position[0]+glyph.hbx
    tmpPos[1] = data.position[1]+glyph.hby - this.font.descender
    tmpShape[0] = glyph.width * data.scale[0]
    tmpShape[1] = glyph.height * data.scale[1]
    
    batch.texture = img
    texcoordGlyph(glyph, img && img.shape, batch.texcoord)
    batch.position = tmpPos
    batch.shape = tmpShape
    batch.push()
}

module.exports = TextRenderer