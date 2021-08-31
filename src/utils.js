import vertex from './vertex-shader.glsl.js'
import fragment from './fragment-shader.glsl.js'

function autoResizeCanvas(canvas) {
    const expandFullScreen = () => {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
    }
    expandFullScreen()
    // resize screen when the browser has triggered the resize event
    window.addEventListener('resize', expandFullScreen)
}

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