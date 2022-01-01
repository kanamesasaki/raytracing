import * as vec3 from '../gl-matrix/vec3.js'

export class Cone {
    constructor() {
        this.p1 = vec3.create()
        this.p2 = vec3.create()
        this.p3 = vec3.create()
        this.radius1 = 1.0
        this.radius2 = 0.5
        this.startAngle = 0.0
        this.endAngle = 360.0
        this.rgb = [0.1, 0.1, 0.1]
    }

    setP1(x, y, z) {
        this.p1[0] = x
        this.p1[1] = y
        this.p1[2] = z
    }

    setP2(x, y, z) {
        this.p2[0] = x
        this.p2[1] = y
        this.p2[2] = z
    }

    setP3(x, y, z) {
        this.p3[0] = x
        this.p3[1] = y
        this.p3[2] = z
    }

    setRadius(r1, r2) {
        this.radius1 = r1
        this.radius2 = r2
    }

    setAngles(start, end) {
        this.startAngle = start
        this.endAngle = end
    }

    setColor(rgb) {
        this.rgb = rgb
    }

    pushToShader(id, gl, program) {
        let p1Loc = gl.getUniformLocation(program, 'uCones[' + String(id) + '].p1');
        let p2Loc = gl.getUniformLocation(program, 'uCones[' + String(id) + '].p2');
        let p3Loc = gl.getUniformLocation(program, 'uCones[' + String(id) + '].p3');
        let radius1Loc = gl.getUniformLocation(program, 'uCones[' + String(id) + '].radius1');
        let radius2Loc = gl.getUniformLocation(program, 'uCones[' + String(id) + '].radius2');
        let startAngleLoc = gl.getUniformLocation(program, 'uCones[' + String(id) + '].startAngle');
        let endAngleLoc = gl.getUniformLocation(program, 'uCones[' + String(id) + '].endAngle');
        let colorLoc = gl.getUniformLocation(program, 'uCones[' + String(id) + '].color');
        gl.uniform3f(p1Loc, this.p1[0], this.p1[1], this.p1[2]);
        gl.uniform3f(p2Loc, this.p2[0], this.p2[1], this.p2[2]);
        gl.uniform3f(p3Loc, this.p3[0], this.p3[1], this.p3[2]);
        gl.uniform1f(radius1Loc, this.radius1)
        gl.uniform1f(radius2Loc, this.radius2)
        gl.uniform1f(startAngleLoc, this.startAngle)
        gl.uniform1f(endAngleLoc, this.endAngle)
        gl.uniform3f(colorLoc, this.rgb[0], this.rgb[1], this.rgb[2]);
    }
}