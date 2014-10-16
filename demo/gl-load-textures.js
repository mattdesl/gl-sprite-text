
var Promise = require('bluebird')
var Texture = require('gl-texture2d')

var imgAsync = Promise.promisify(require('img'))

function texAsync(gl, path) {
    return imgAsync(path).then(function(img) {
        return Texture(gl, img)
    })
}

module.exports = function(gl, paths) {
    return Promise.all(paths.map(function(p) {
        return texAsync(gl, p)
    }))
}