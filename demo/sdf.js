require('canvas-testbed')(render, start, { context: 'webgl' })

var createText = require('../')
var createTexture = require('gl-texture2d')
var createBackground = require('./gl-checker-background')
var loadImage = require('img')
var fs = require('fs')
var lerp = require('lerp')
var ease = require('eases/quart-in')

var clear = require('gl-clear')({ color: [0.25,0.25,0.25,1] })

var Lato = require('./sdf/DejaVu-sdf.json')
var mat4 = require('gl-mat4')

var copy = fs.readFileSync(__dirname+'/sdf/frag.glsl', 'utf8')

var glslify = require('glslify')
var createShader = glslify({
    vertex: __dirname+'/sdf/vert.glsl',
    fragment: __dirname+'/sdf/frag.glsl'
})

var text, 
    ortho = mat4.create(),
    scale = mat4.create(),
    shader,
    time = 600

var reg = /\/\/(.*)$/gm.exec(copy)

if (!reg)
    reg = { index: 0, '0': '' }

function render(gl, width, height, dt) {
    time += dt/1000
    clear(gl)
    
    if (!text)
        return
    
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

    background.draw()

    mat4.ortho(ortho, 0, width, height, 0, 0, 1)

    var anim = ease(Math.sin(time/2)/2+0.5)
    var s = lerp(0.5, 2.0, anim)
    mat4.identity(scale)
    mat4.scale(scale, scale, [s, s, 0])

    //gl-basic-shader gives us some matrices we can use
    shader.bind()
    shader.uniforms.projection = ortho   
    shader.uniforms.view = scale

    var bounds = text.getBounds()

    var white = [1,1,1,1]
    var x = 20, 
        y = 10+bounds.height

    //NOTE: real syntax highlighting would want to manipulate
    //the underlying batch for vertex coloring
    shader.uniforms.tint = white
    text.draw(shader, x, y, 0, reg.index)

    shader.uniforms.tint = [140/255, 218/255, 115/255, 1.0]
    text.draw(shader, x, y, reg.index, reg.index+reg[0].length)
    
    shader.uniforms.tint = white
    text.draw(shader, x, y, reg.index+reg[0].length)
}

function start(gl, width, height) {
    //generate a basic shader with some custom frag source
    shader = createShader(gl)
    shader.bind()
    shader.uniforms.tint = [1, 1, 1, 1]

    background = createBackground(gl, {
        colors: [
            [0x50,0x50,0x50,0xff],
            [0x46,0x46,0x46,0xff]
        ]
    })

    //load textures, then build our text
    loadImage('sdf/DejaVu-sdf.png', function(err, img) {
        var tex = createTexture(gl, img)
        tex.generateMipmap()

        //smoother filtering
        tex.minFilter = gl.LINEAR_MIPMAP_LINEAR
        tex.magFilter = gl.LINEAR

        text = createText(gl, {
            font: Lato,
            wrapMode: 'pre',
            // wrapWidth: 1200,
            text: copy,
            textures: [ tex ]
        })
    })
}