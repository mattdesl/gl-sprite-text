var createTexture = require('./gl-checker-texture')
var Batch = require('gl-sprite-batch')
var DefaultShader = require('gl-basic-shader')
var xtend = require('xtend')

//photoshop colors :)
var defaultColors = [
    [0xff, 0xff, 0xff, 0xff],
    [0xcc, 0xcc, 0xcc, 0xff]
]

function Background(gl, opt) {
    if (!(this instanceof Background))
        return new Background(gl, opt)
    opt = opt||{}
    this.gl = gl
    this.texture = createTexture(gl, xtend({
        colors: defaultColors
    }, opt))
    var DPR = (window.devicePixelRatio||1)
    this.size = typeof opt.size === 'number' ? opt.size : (32*DPR)

    this.texture.wrap = gl.REPEAT
    this.texture.minFilter = this.texture.magFilter = gl.NEAREST

    this.shader = opt.shader || DefaultShader(gl, { texcoord: true, color: true })
    this.batch = opt.batch || Batch(gl, { capacity: 1 })
    this.sprite = {
        texture: this.texture,
        position: [-1, -1],
        shape: [2, 2],
        texcoord: [0, 0, 2.0, 2.0]
    }
}

Background.prototype.draw = function(width, height) {
    width = typeof width === 'number' ? width : this.gl.canvas.width
    height = typeof height === 'number' ? height : this.gl.canvas.height
    var checkSize = this.size
    
    this.batch.clear()
    this.batch.bind(this.shader)
    this.sprite.texcoord[2] = width/checkSize
    this.sprite.texcoord[3] = height/checkSize
    this.batch.push(this.sprite)
    this.batch.draw()
    this.batch.unbind()
}      

module.exports = Background