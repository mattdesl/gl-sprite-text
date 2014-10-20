//2x2 white/transparent texture pattern
var create = require('gl-texture2d')
var ndarray = require('ndarray')

var defs = [
    [0xff,0xff,0xff,0xff],
    [0xcc,0xcc,0xcc,0xff]
]

module.exports = function(gl, opt) {
    opt = opt||{}

    opt.colors = opt.colors || defs

    data = [
        opt.colors[0], opt.colors[1],
        opt.colors[1], opt.colors[0]
    ].reduce(function(a, b) {
        return a.concat(b)
    })

    //create a 2D ndarray
    var array = ndarray(new Uint8Array(data), [2, 2, 4])
    return create(gl, array)
}