import vertex from '../glsl/vertex-shader.glsl.js'
import fragment from '../glsl/fragment-shader.glsl.js'

// Extract the content's of a shader script from the JavaScript file 
// Return the compiled shader
export function getVertexShader(gl) {
    let shader
    shader = gl.createShader(gl.VERTEX_SHADER)
    gl.shaderSource(shader, vertex)
    gl.compileShader(shader)

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader))
        return null
    }
    return shader
}

// Extract the content's of a shader script from the JavaScript file 
// Return the compiled shader
export function getFragmentShader(gl) {
    let shader
    shader = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(shader, fragment)
    gl.compileShader(shader)

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader))
        return null
    }
    return shader
}