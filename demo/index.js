require('canvas-testbed')(render, start, { context: 'webgl' })

var createText = require('../')
var bmfont = require('./fonts.json')[12]
var bmfont2 = require('./fonts.json')[8]
var bmfontSmall = require('./fonts.json')[17]

var Shader = require('gl-basic-shader')
var Batch = require('gl-sprite-batch')
var mat4 = require('gl-mat4')

var loadTextures = require('./gl-load-textures')

var ortho = mat4.create()
var renderer, batch, shader
var staticBatch
var bigText

var transform = mat4.create()
var DPR = (window.devicePixelRatio||1) 
var time = 0

function render(gl, width, height, dt) {
    time += dt
    if (!renderer)
        return

    gl.clearColor(0,0,0,1)
    gl.clear(gl.COLOR_BUFFER_BIT)

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    shader.bind()
    shader.uniforms.texture0 = 0


    //setup projection & camera matrices
    mat4.ortho(ortho, 0, width, height, 0, 0, 1)


    shader.uniforms.projection = ortho    
    shader.uniforms.tint = [1, 1, 1, 1]

    //set some new text 
    renderer.text = 'this field is dynamic '+ (time/1000).toFixed(1)

    //get new bounds
    var bounds = renderer.getBounds()

    //retina scale it and translate it to top left
    mat4.identity(transform)
    mat4.scale(transform, transform, [1/DPR, 1/DPR, 1.0])
    mat4.translate(transform, transform, [0, bounds.height, 0])

    shader.uniforms.model = transform

    //draw the dynamic text
    var anim = Math.round((Math.sin(time/1000)/2+0.5)*renderer.text.length)
    renderer.draw(shader, 20, 20, 0, anim)

    shader.uniforms.tint = [1, 0.5, 0.5, 1.0]
    textSmall.draw(shader, 100, 140)

    /////draw some static text with custom texture
    shader.uniforms.tint = [1, 1, 1, 1]
    gl.enable(gl.SCISSOR_TEST)

    //clip some of our text
    var pad = 250
    gl.scissor(0, pad, width*DPR, height*DPR-pad*2)

    var off = 100,
        yoff = -(Math.sin(time/2000)/2+0.5) * 500
    
    mat4.identity(transform)
    mat4.scale(transform, transform, [1/DPR, 1/DPR, 1.0])
    mat4.translate(transform, transform, [off, yoff + bigText.getBounds().height+off, 0])
    shader.uniforms.model = transform
    
    staticBatch.bind(shader)
    staticBatch.draw()
    staticBatch.unbind()

    gl.disable(gl.SCISSOR_TEST)
}

function start(gl, width) {
    batch = Batch(gl)

    shader = Shader(gl, {
        color: true,
        texcoord: true
    })
    
    //bmfont.pages is an array of image paths for each sheet
    //uses promises to async load and upload some textures
    loadTextures(gl, bmfont.pages).then(function(p) {
        renderer = createText(gl, {
            font: bmfont,
            textures: p
        })

        textSmall = createText(gl, {
            font: bmfontSmall,
            text: [
                'all text rendered in pure WebGL',
                'a 2048x2048 texture holds 25 different font sizes/styles',
                'the text area below is drawn with a static buffer on the GPU'
            ].join('\n'),
            textures: p
        })
        //wrap newlines
        textSmall.layout()

        //We can only create static text once the texture
        //size is known, otherwise the texcoords will be wrong.
        createStaticText(p, width*1.5)
    })
}

function createStaticText(textures, wrapWidth) {
    //if we know that the static text uses a SINGLE
    //texture sheet and no underlines, we can pack it all
    //into the same buffer and keep it static on GPU.
    
    //This is an advanced optimization only worth doing in
    //certain edge cases.
    
    var text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam rutrum sollicitudin nunc pellentesque condimentum. Morbi nec ipsum nec ipsum imperdiet imperdiet non eget mi. Fusce vitae ante et nisl malesuada luctus et et dui. Suspendisse gravida accumsan metus, a vestibulum justo malesuada at. Duis in luctus erat. Cras pellentesque placerat felis eget pretium. Donec lobortis nulla vitae velit congue, id commodo purus venenatis. Phasellus varius, magna ac efficitur tincidunt, turpis ipsum cursus diam, vel cursus nisl lorem eget enim. Aliquam sollicitudin lacinia nunc, eu hendrerit libero consequat nec. Interdum et malesuada fames ac ante ipsum primis in faucibus. Donec varius semper neque, eget rutrum urna egestas et. Proin et lorem feugiat ligula pulvinar porta at semper dolor. Proin efficitur, est et scelerisque tempus, nulla est gravida augue, in commodo ipsum nibh ac ipsum. In odio ex, semper eu felis et, tristique vestibulum metus. Morbi tristique pretium elit, non placerat ipsum sodales a. Integer diam odio, laoreet non venenatis sed, sollicitudin vel turpis. Vivamus pellentesque imperdiet metus. Nullam molestie bibendum tellus vel dignissim. Cras a diam sollicitudin, vehicula mi at, lobortis augue. Morbi vestibulum eget leo eget ultricies. Curabitur pellentesque, nisi a consequat mattis, arcu arcu ullamcorper felis, in finibus diam nulla ac erat. Nulla tempus justo nunc, at rutrum arcu luctus vitae. Nulla sit amet accumsan sem, at vestibulum nunc. Vestibulum dictum ligula ut neque dapibus rutrum. Curabitur ultrices leo egestas, ullamcorper enim eu, scelerisque ligula. Ut sed augue risus. Cras ut enim diam. Quisque id commodo quam, non commodo tortor. Fusce justo risus, scelerisque vel blandit eu, lacinia nec neque. Aenean iaculis porttitor condimentum. Aliquam congue fermentum odio, a molestie sem posuere ac. Nam et diam sit amet leo auctor tempus. Nam eu diam justo. Sed quis cursus risus. Nullam ultricies risus id sapien commodo finibus. Donec quis magna lacinia, feugiat mi quis, dignissim tortor.'
    text = text+text
    bigText = createText(gl, {
        font: bmfont2,
        align: 'left',
        text: text,
        wrapWidth: wrapWidth,
        textures: textures
    })

    //build a SpriteBatch for this text element
    bigText.build()

    //now we can use that sprite batch for rendering
    staticBatch = bigText.batch
}