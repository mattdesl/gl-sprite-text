module.exports = function texcoord(position, shape, texShape, out) {
    if (!out)
        out = [0,0,0,0]

    texShape = texShape || shape

    var invWidth = 1/texShape[0]
    var invHeight = 1/texShape[1]
    var x = position[0],
        y = position[1],
        w = shape[0],
        h = shape[1]

    out[0] = x * invWidth
    out[1] = y * invHeight
    out[2] = (x+w) * invWidth
    out[3] = (y+h) * invHeight
    return out
}

