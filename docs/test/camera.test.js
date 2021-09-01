import { Camera } from '../js/camera'
import * as mat4 from '../gl-matrix/mat4'
import * as vec3 from '../gl-matrix/vec3'

test('camera', () => {
    const a = new Camera()
    expect(a.matrix).toEqual(mat4.create())
})

test('camera', () => {
    const a = new Camera()
    a.setPosition(0,0,5)
    expect(a.world).toEqual(vec3.fromValues(0,0,5))
    expect(a.local).toEqual(vec3.fromValues(0,0,5))
})

test('camera rotateY', () => {
    const a = new Camera()
    a.setPosition(0,0,5)
    a.rotateY(Math.PI/2)
    expect(a.world[0]).toBeCloseTo(5.0, 6)
    expect(a.world[1]).toBeCloseTo(0.0, 6)
    expect(a.world[2]).toBeCloseTo(0.0, 6)
    expect(a.local[0]).toBeCloseTo(0.0, 6)
    expect(a.local[1]).toBeCloseTo(0.0, 6)
    expect(a.local[2]).toBeCloseTo(5.0, 6)
})

test('camera translateY', () => {
    const a = new Camera()
    a.setPosition(0,0,5)
    a.rotateY(Math.PI/2)
    a.translateY(5.0)
    expect(a.world[0]).toBeCloseTo(5.0, 6)
    expect(a.world[1]).toBeCloseTo(5.0, 6)
    expect(a.world[2]).toBeCloseTo(0.0, 6)
    expect(a.local[0]).toBeCloseTo(0.0, 6)
    expect(a.local[1]).toBeCloseTo(5.0, 6)
    expect(a.local[2]).toBeCloseTo(5.0, 6)
})

test('camera rotateY then rotateX', () => {
    const a = new Camera()
    a.setPosition(0,0,5)
    a.rotateY(Math.PI/2)
    a.rotateX(Math.PI/2)
    expect(a.world[0]).toBeCloseTo(0.0, 6)
    expect(a.world[1]).toBeCloseTo(-5.0, 6)
    expect(a.world[2]).toBeCloseTo(0.0, 6)
    expect(a.local[0]).toBeCloseTo(0.0, 6)
    expect(a.local[1]).toBeCloseTo(0.0, 6)
    expect(a.local[2]).toBeCloseTo(5.0, 6)
})
