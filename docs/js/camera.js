import * as vec3 from '../gl-matrix/vec3.js'
import * as mat3 from '../gl-matrix/mat3.js'
import * as mat4 from '../gl-matrix/mat4.js'

export class Camera {
    constructor(matrix=mat4.create()) {
        this.matrix = matrix
        this.world = vec3.create()
        this.local = vec3.create()
        mat4.getTranslation(this.world, this.matrix)
        this.base = mat3.create()
        this.trans = mat3.create()
        mat3.fromMat4(this.base, this.matrix)
        mat3.transpose(this.trans, this.base)
        vec3.transformMat3(this.local, this.world, this.trans)
    }

    setPosition(x, y, z) {
        this.matrix[12] = x
        this.matrix[13] = y
        this.matrix[14] = z
        mat4.getTranslation(this.world, this.matrix)
        vec3.transformMat3(this.local, this.world, this.trans)
    }

    rotateY(rad) {
        mat4.rotateY(this.matrix, this.matrix, rad)
        vec3.rotateY(this.local, this.local, vec3.create(), rad)
        vec3.transformMat3(this.world, this.local, this.base)
        this.matrix[12] = this.world[0]
        this.matrix[13] = this.world[1]
        this.matrix[14] = this.world[2]
        mat3.fromMat4(this.base, this.matrix)
        mat3.transpose(this.trans, this.base)
        vec3.transformMat3(this.local, this.world, this.trans)
    }

    translateY(y) {
        mat4.translate(this.matrix, this.matrix, vec3.fromValues(0,y,0))
        mat4.getTranslation(this.world, this.matrix)
        vec3.transformMat3(this.local, this.world, this.trans)
    }

    rotateX(rad) {
        mat4.rotateX(this.matrix, this.matrix, rad)
        vec3.rotateX(this.local, this.local, vec3.create(), rad)
        vec3.transformMat3(this.world, this.local, this.base)
        this.matrix[12] = this.world[0]
        this.matrix[13] = this.world[1]
        this.matrix[14] = this.world[2]
        mat3.fromMat4(this.base, this.matrix)
        mat3.transpose(this.trans, this.base)
        vec3.transformMat3(this.local, this.world, this.trans)
    }

    translateX(x) {
        mat4.translate(this.matrix, this.matrix, vec3.fromValues(x,0,0))
        mat4.getTranslation(this.world, this.matrix)
        vec3.transformMat3(this.local, this.world, this.trans)
    }
}