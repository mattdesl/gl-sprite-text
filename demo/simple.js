require('canvas-testbed')(render, start, { context: 'webgl' })

var createText = require('../')
var createShader = require('gl-basic-shader')

var clear = require('gl-clear')({ color: [0,0,0,1] })

var Lato = require('bmfont-lato/32')
var mat4 = require('gl-mat4')

var text, 
    ortho = mat4.create(),
    translate = mat4.create(),
    shader,
    time = 0

function render(gl, width, height, dt) {
    time += dt/1000
    clear(gl)

    //this is necessary since our image is semi-transparent!
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    mat4.ortho(ortho, 0, width, height, 0, 0, 1)

    //gl-basic-shader gives us some matrices we can use
    shader.bind()
    shader.uniforms.projection = ortho    

    //We aren't handling retina here, so it will look pretty
    //bad on high density screens.
    text.letterSpacing = (Math.sin(time)/2+0.5)*20
    text.lineHeight = (Math.sin(time)/2+0.5)*text.fontSize

    //get bounds of text after we've adjusted all its params
    var bounds = text.getBounds()

    //here we're translating the text in a shader
    mat4.identity(translate)
    mat4.translate(translate, translate, [10, 10-bounds.y, 0])
    shader.uniforms.model = translate

    //Draws from upper-left corner of text box.
    text.draw(shader)
}

function start(gl, width, height) {
    //build our text
    text = createText(gl, {
        font: Lato,
        text: 'Hello, World! Some\nmulti-line text for you.',
        //we can word-wrap like so:
        // wrapWidth: 140
    })

    //a shader with vertex colors and uv coords
    shader = createShader(gl, {
        color: true,
        texcoord: true
    })
}