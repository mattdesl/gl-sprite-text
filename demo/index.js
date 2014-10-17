require('canvas-testbed')(render, start, { context: 'webgl' })

var createText = require('../')
var bmfont = require('./fonts.json')[12]

var Shader = require('gl-basic-shader')
var Batch = require('gl-sprite-batch')
var mat4 = require('gl-mat4')

var loadTextures = require('./gl-load-textures')

var ortho = mat4.create()
var renderer, batch, shader

var scale = mat4.create()
var s = 1/(window.devicePixelRatio||1) 
mat4.scale(scale, scale, [s, s, 1.0])

function render(gl, width, height) {
    gl.clearColor(0,0,0,1)
    gl.clear(gl.COLOR_BUFFER_BIT)

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    shader.bind()
    shader.uniforms.texture0 = 0

    //setup ortho projection
    mat4.ortho(ortho, 0, width, height, 0, 0, 1)
    shader.uniforms.projection = ortho    
    shader.uniforms.model = scale 

    var bounds = renderer.getBounds()

    batch.bind(shader)
    batch.color = [1, 1, 1, 1]
    renderer.draw(batch, 0, bounds.height)
    
    batch.unbind()
}

function start(gl) {
    batch = Batch(gl)

    shader = Shader(gl, {
        color: true,
        texcoord: true
    })

    renderer = createText(gl, {
        font: bmfont,
        text: 'This is a test of bitmap fonts!',
        underline: true
    })
    
    //bmfont.pages is an array of image paths for each sheet
    //uses promises to async load and upload some textures
    loadTextures(gl, bmfont.pages).then(function(p) {
        renderer.textures = p
        update()
    })
}

function update() {
    renderer.layout(window.innerWidth)    
}
