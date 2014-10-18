var Base = require('fontpath-simple-renderer')
var inherits = require('inherits')
var bmfont2fontpath = require('fontpath-bmfont')
var WhiteTex = require('gl-white-texture')
var texcoord = require('texcoord')

var tmpPos = [0, 0],
    tmpShape = [0, 0],
    tmp1 = [0, 0],
    tmp2 = [0, 0]
var DEFAULT_TEXCOORD = [0, 0, 1, 1]

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

    if (opt.font) 
        opt.font = bmfont2fontpath(opt.font)

    Base.call(this, opt)

    this.textures = opt.textures || []
    this.gl = gl
    if (!gl)
        throw new Error("must specify gl context")

    //used for underlines
    this.whiteTexture = WhiteTex(gl)
}

inherits(TextRenderer, Base)

TextRenderer.Align = Base.Align

TextRenderer.prototype._drawGlyph = function(batch, data) {
    //TODO: we could sort these by texture page to reduce draws
    var glyph = data.glyph
    var img = this.textures[glyph.page]
    tmpPos[0] = data.position[0]+glyph.hbx
    tmpPos[1] = data.position[1]+glyph.hby - this.font.descender
    tmpShape[0] = glyph.width * data.scale[0]
    tmpShape[1] = glyph.height * data.scale[1]
    
    batch.texture = img
    texcoordGlyph(glyph, img.shape, batch.texcoord)
    batch.position = tmpPos
    batch.shape = tmpShape
    batch.push()
}

TextRenderer.prototype.draw = function(batch, x, y, start, end) {
    if (!this.textures || this.textures.length === 0)
        return

    var result = this.render(x, y, start, end)

    var i = 0

    batch.texcoord = DEFAULT_TEXCOORD
    batch.texture = this.whiteTexture

    for (i = 0; i < result.underlines.length; i++) {
        var underline = result.underlines[i]
        batch.position = underline.position
        batch.shape = underline.size
        batch.push()
    }

    for (i = 0; i < result.glyphs.length; i++) {
        var g = result.glyphs[i]
        this._drawGlyph(batch, g)
    }
}

module.exports = TextRenderer