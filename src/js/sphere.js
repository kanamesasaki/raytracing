import * as vec3 from '../gl-matrix/vec3.js'

export class Sphere {
    constructor() {
        this.p1 = vec3.create()
        this.p2 = vec3.create()
        this.p3 = vec3.create()
        this.radius = 1.0
        this.startAngle = 0.0
        this.endAngle = 360.0
        this.apexTruncation = 1.0
        this.baseTruncation = 1.0
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

    setRadius(r) {
        this.radius = r
    }

    setAngles(start, end) {
        this.startAngle = start
        this.endAngle = end
    }

    setTruncations(apex, base) {
        this.apexTruncation = apex
        this.baseTruncation = base
    }

    setColor(rgb) {
        this.rgb = rgb
    }

    pushToShader(id, gl, program) {
        let p1Loc = gl.getUniformLocation(program, 'uSpheres[' + String(id) + '].p1');
        let p2Loc = gl.getUniformLocation(program, 'uSpheres[' + String(id) + '].p2');
        let p3Loc = gl.getUniformLocation(program, 'uSpheres[' + String(id) + '].p3');
        let radiusLoc = gl.getUniformLocation(program, 'uSpheres[' + String(id) + '].radius');
        let startAngleLoc = gl.getUniformLocation(program, 'uSpheres[' + String(id) + '].startAngle');
        let endAngleLoc = gl.getUniformLocation(program, 'uSpheres[' + String(id) + '].endAngle');
        let apexTruncationLoc = gl.getUniformLocation(program, 'uSpheres[' + String(id) + '].apexTruncation');
        let baseTruncationLoc = gl.getUniformLocation(program, 'uSpheres[' + String(id) + '].baseTruncation');
        let colorLoc = gl.getUniformLocation(program, 'uSpheres[' + String(id) + '].color');
        gl.uniform3f(p1Loc, this.p1[0], this.p1[1], this.p1[2]);
        gl.uniform3f(p2Loc, this.p2[0], this.p2[1], this.p2[2]);
        gl.uniform3f(p3Loc, this.p3[0], this.p3[1], this.p3[2]);
        gl.uniform1f(radiusLoc, this.radius)
        gl.uniform1f(startAngleLoc, this.startAngle)
        gl.uniform1f(endAngleLoc, this.endAngle)
        gl.uniform1f(apexTruncationLoc, this.apexTruncation)
        gl.uniform1f(baseTruncationLoc, this.baseTruncation)
        gl.uniform3f(colorLoc, this.rgb[0], this.rgb[1], this.rgb[2]);
    }

}