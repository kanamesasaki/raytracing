export default `#version 300 es
precision mediump float;

in vec4 vColor;
uniform vec2 uInverseTextureSize;
uniform mat4 uCameraMatrix;
// Color that is the result of this shader
out vec4 fragColor;

const float PI = 3.141592653589793238462643383;
const float maxDistance = 1024.0;
const vec3 backgroundColor = vec3(0.2);
const vec3 ambient = vec3(0.05, 0.1, 0.1);

uniform struct RectangleData {
    vec3 p1;
    vec3 p2;
    vec3 p3;
    vec3 color;
};

uniform struct TriangleData {
    vec3 p1;
    vec3 p2;
    vec3 p3;
    vec3 color;
};

uniform struct SphereData {
    vec3 p1;
    vec3 p2;
    vec3 p3;
    float radius;
    float startAngle;
    float endAngle;
    float apexTruncation;
    float baseTruncation;
    vec3 color;
};

uniform struct DiskData {
    vec3 p1;
    vec3 p2;
    vec3 p3;
    float outerRadius;
    float innerRadius;
    float startAngle;
    float endAngle;
    vec3 color;
};

uniform struct CylinderData {
    vec3 p1;
    vec3 p2;
    vec3 p3;
    float radius;
    float startAngle;
    float endAngle;
    vec3 color;
};

uniform struct ConeData {
    vec3 p1;
    vec3 p2;
    vec3 p3;
    float radius1;
    float radius2;
    float startAngle;
    float endAngle;
    vec3 color;
};

uniform struct ParaboloidData {
    vec3 p1;
    vec3 p2;
    vec3 p3;
    float radius;
    float apexTruncation;
    float startAngle;
    float endAngle;
    vec3 color;
};

uniform struct Intersection {
    float dist;
    vec3 normal;
};

uniform int numSphere;
uniform SphereData uSpheres[10];

uniform int numRectangle;
uniform RectangleData uRectangles[10];

uniform int numTriangle;
uniform TriangleData uTriangles[10];

uniform int numDisk;
uniform DiskData uDisks[10];

uniform int numCylinder;
uniform CylinderData uCylinders[10];

uniform int numCone;
uniform ConeData uCones[10];

uniform int numParaboloid;
uniform ParaboloidData uParaboloids[10];

vec4 debugColor(bool flag) {
    if (flag == true) {
    return vec4(0.0, 1.0, 0.0, 1.0);
    }
    return vec4(1.0, 0.0, 0.0, 1.0);
}

float azimuth(float y, float x, float min_angle) {
    float theta = atan(y, x);
    while (theta < min_angle) {
        theta += 2.0*PI;
    }
    while (theta >= min_angle + 2.0*PI) {
        theta -= 2.0*PI;
    }
    return theta;
}

float sphere(SphereData s, vec3 ro, vec3 rd) {
    vec3 Rx = normalize(s.p3 - s.p1);
    vec3 Rz = normalize(s.p2 - s.p1);
    vec3 Ry = cross(Rz, Rx);
    mat3 Rmat = mat3(Rx, Ry, Rz);
    mat3 Rinv = transpose(Rmat);
    vec3 Ro = Rinv * (ro - s.p1);
    vec3 Rd = Rinv * rd;
    float a = dot(Rd, Rd);
    float b = dot(Rd, Ro);
    float c = dot(Ro, Ro) - s.radius*s.radius;
    float d = b*b - a*c;
    if (d < 0.0) {
        return d;
    }
    float tp = (-b+sqrt(d)) / a;
    float tm = (-b-sqrt(d)) / a;
    vec3 pp = Ro + tp * Rd;
    vec3 pm = Ro + tm * Rd;
    float thetap = azimuth(pp[1], pp[0], s.startAngle);
    float thetam = azimuth(pm[1], pm[0], s.startAngle);

    if (thetap <= s.endAngle) {
        if (thetam <= s.endAngle) {
            // both
            if (tm > 0.0) {
                if (pm[2] <= s.apexTruncation && pm[2] >= s.baseTruncation) { return tm; }
                else {
                    if (pp[2] <= s.apexTruncation && pp[2] >= s.baseTruncation) { return tp; }
                    else { return -1.0; }
                }
            }
            else {
                if (tp > 0.0) {
                    if (pp[2] <= s.apexTruncation && pp[2] >= s.baseTruncation) { return tp; }
                    else { return -1.0; }
                }
                else {
                    return -1.0;
                }
            }
        }
        else {
            // only plus
            if (tp > 0.0 && pp[2] <= s.apexTruncation && pp[2] >= s.baseTruncation) { return tp; }
            else { return -1.0; }
        }
    }
    else {
        if (thetam <= s.endAngle) {
            // only minus
            if (tm > 0.0 && pm[2] <= s.apexTruncation && pm[2] >= s.baseTruncation) { return tm; }
            else { return -1.0; }
        }
        else {
            // no
            return -1.0;
        }
    }
}

float rectangle(RectangleData s, vec3 ro, vec3 rd) {
    vec3 Ry = normalize(s.p3 - s.p1);
    vec3 Rx = normalize(s.p2 - s.p1);
    vec3 Rz = cross(Rx, Ry);
    if (dot(Rz, rd) == 0.0) {
        return -1.0;
    }
    mat3 Rmat = mat3(Rx, Ry, Rz);
    mat3 Rinv = transpose(Rmat);
    vec3 Ro = Rinv * (ro - s.p1);
    vec3 Rd = Rinv * rd;
    float t = -Ro[2]/Rd[2];
    if (t <= 0.0) {
        return t;
    }
    vec3 XYZ = Ro + Rd * t;
    if (0.0 <= XYZ[0] && XYZ[0] <= length(s.p2 - s.p1) && 0.0 <= XYZ[1] && XYZ[1] <= length(s.p3 - s.p1)) {
        return t;
    }
    else {
        return -1.0;
    }
}

float triangle(TriangleData s, vec3 ro, vec3 rd) {
    vec3 Ry = s.p3 - s.p1;
    vec3 Rx = s.p2 - s.p1;
    vec3 Rz = cross(Rx, Ry);
    if (dot(Rz, rd) == 0.0) {
        return -1.0;
    }
    mat3 Rmat = mat3(Rx, Ry, Rz);
    mat3 Rinv = inverse(Rmat);
    vec3 Ro = Rinv * (ro - s.p1);
    vec3 Rd = Rinv * rd;
    float t = -Ro[2]/Rd[2];
    if (t <= 0.0) {
        return t;
    }
    vec3 XYZ = Ro + Rd * t;
    if (0.0 <= XYZ[0] && XYZ[0] <= 1.0 && 0.0 <= XYZ[1] && XYZ[1] <= 1.0 && XYZ[0] + XYZ[1] <= 1.0) {
        return t;
    }
    else {
        return -1.0;
    }
}

float disk(DiskData s, vec3 ro, vec3 rd) {
    vec3 Rx = normalize(s.p3 - s.p1);
    vec3 Rz = normalize(s.p2 - s.p1);
    vec3 Ry = cross(Rz, Rx);
    if (dot(Rz, rd) == 0.0) {
        return -1.0;
    }
    mat3 Rmat = mat3(Rx, Ry, Rz);
    mat3 Rinv = transpose(Rmat);
    vec3 Ro = Rinv * (ro - s.p1);
    vec3 Rd = Rinv * rd;
    float t = -Ro[2]/Rd[2];
    if (t <= 0.0) {
        return t;
    }
    vec3 XYZ = Ro + Rd * t;
    float dist = XYZ[0]*XYZ[0] + XYZ[1]*XYZ[1];
    float theta = azimuth(XYZ[1], XYZ[0], s.startAngle);
    if (dist > s.innerRadius*s.innerRadius && dist < s.outerRadius*s.outerRadius && theta > s.startAngle && theta < s.endAngle) {
        return t;
    }
    else {
        return -1.0;
    }
}

float cylinder(CylinderData s, vec3 ro, vec3 rd) {
    vec3 Rx = normalize(s.p3 - s.p1);
    vec3 Rz = normalize(s.p2 - s.p1);
    vec3 Ry = cross(Rz, Rx);
    if (dot(Rz, rd) == 0.0) {
        return -1.0;
    }
    mat3 Rmat = mat3(Rx, Ry, Rz);
    mat3 Rinv = transpose(Rmat);
    vec3 Ro = Rinv * (ro - s.p1);
    vec3 Rd = Rinv * rd;
    float a = Rd[0]*Rd[0] + Rd[1]*Rd[1];
    float b = Ro[0]*Rd[0] + Ro[1]*Rd[1];
    float c = Ro[0]*Ro[0] + Ro[1]*Ro[1] - s.radius*s.radius;
    float d = b*b - a*c;
    if (d < 0.0) {
        return -1.0;
    }
    float tp = (-b+sqrt(d)) / a;
    float tm = (-b-sqrt(d)) / a;
    vec3 pp = Ro + tp * Rd;
    vec3 pm = Ro + tm * Rd;
    float thetap = azimuth(pp[1], pp[0], s.startAngle);
    float thetam = azimuth(pm[1], pm[0], s.startAngle);
    float height = length(s.p2 - s.p1);

    if (thetap <= s.endAngle) {
        if (thetam <= s.endAngle) {
            // both
            if (tm > 0.0) {
                if (pm[2] >= 0.0 && pm[2] <= height) { return tm; }
                else {
                    if (pp[2] >= 0.0 && pp[2] <= height) { return tp; }
                    else { return -1.0; }
                }
            }
            else {
                if (tp > 0.0) {
                    if (pp[2] >= 0.0 && pp[2] <= height) { return tp; }
                    else { return -1.0; }
                }
                else {
                    return -1.0;
                }
            }
        }
        else {
            // only plus
            if (tp > 0.0 && pp[2] >= 0.0 && pp[2] <= height) { return tp; }
            else { return -1.0; }
        }
    }
    else {
        if (thetam <= s.endAngle) {
            // only minus
            if (tm > 0.0 && pm[2] >= 0.0 && pm[2] <= height) { return tm; }
            else { return -1.0; }
        }
        else {
            // no 
            return -1.0;
        }
    }
}

float cone(ConeData s, vec3 ro, vec3 rd) {
    vec3 Rx = normalize(s.p3 - s.p1);
    vec3 Rz = normalize(s.p2 - s.p1);
    vec3 Ry = cross(Rz, Rx);
    mat3 Rmat = mat3(Rx, Ry, Rz);
    mat3 Rinv = transpose(Rmat);
    float ang = length(s.p2 - s.p1) / (s.radius1 - s.radius2);
    float ang2 = 1.0 / (ang * ang);
    vec3 p0 = s.radius1 / (s.radius1 - s.radius2) * (s.p2 - s.p1) + s.p1;
    vec3 Ro = Rinv * (ro - p0);
    vec3 Rd = Rinv * rd;
    float a = Rd[0]*Rd[0] + Rd[1]*Rd[1] - ang2*Rd[2]*Rd[2];
    float b = Ro[0]*Rd[0] + Ro[1]*Rd[1] - ang2*Ro[2]*Rd[2];
    float c = Ro[0]*Ro[0] + Ro[1]*Ro[1] - ang2*Ro[2]*Ro[2];
    float d = b*b - a*c;
    if (d < 0.0) {
        return -1.0;
    }
    float tp = (-b+sqrt(d)) / a;
    float tm = (-b-sqrt(d)) / a;
    vec3 pp = Ro + tp * Rd;
    vec3 pm = Ro + tm * Rd;
    float thetap = azimuth(pp[1], pp[0], s.startAngle);
    float thetam = azimuth(pm[1], pm[0], s.startAngle);
    float min_height = - s.radius1 * ang;
    float max_height = - s.radius2 * ang;

    if (thetap <= s.endAngle) {
        if (thetam <= s.endAngle) {
            // both
            if (tm > 0.0) {
                if (pm[2] >= min_height && pm[2] <= max_height) { return tm; }
                else {
                    if (pp[2] >= min_height && pp[2] <= max_height) { return tp; }
                    else { return -1.0; }
                }
            }
            else {
                if (tp > 0.0) {
                    if (pp[2] >= min_height && pp[2] <= max_height) { return tp; }
                    else { return -1.0; }
                }
                else {
                    return -1.0;
                }
            }
        }
        else {
            // only plus
            if (tp > 0.0 && pp[2] >= min_height && pp[2] <= max_height) { return tp; }
            else { return -1.0; }
        }
    }
    else {
        if (thetam <= s.endAngle) {
            // only minus
            if (tm > 0.0 && pm[2] >= min_height && pm[2] <= max_height) { return tm; }
            else { return -1.0; }
        }
        else {
            // no 
            return -1.0;
        }
    }
}

float paraboloid(ParaboloidData s, vec3 ro, vec3 rd) {
    vec3 Rx = normalize(s.p3 - s.p1);
    vec3 Rz = normalize(s.p2 - s.p1);
    vec3 Ry = cross(Rz, Rx);
    mat3 Rmat = mat3(Rx, Ry, Rz);
    mat3 Rinv = transpose(Rmat);
    float height = length(s.p2 - s.p1);
    float ang = s.radius*s.radius / height;
    vec3 Ro = Rinv * (ro - s.p1);
    vec3 Rd = Rinv * rd;
    float a = Rd[0]*Rd[0] + Rd[1]*Rd[1];
    float b = Ro[0]*Rd[0] + Ro[1]*Rd[1] - ang*Rd[2]/2.0;
    float c = Ro[0]*Ro[0] + Ro[1]*Ro[1] - ang*Ro[2];
    float d = b*b - a*c;
    if (d < 0.0) {
        return -1.0;
    }
    float tp = (-b+sqrt(d)) / a;
    float tm = (-b-sqrt(d)) / a;
    vec3 pp = Ro + tp * Rd;
    vec3 pm = Ro + tm * Rd;
    float thetap = azimuth(pp[1], pp[0], s.startAngle);
    float thetam = azimuth(pm[1], pm[0], s.startAngle);

    if (thetap <= s.endAngle) {
        if (thetam <= s.endAngle) {
            // both
            if (tm > 0.0) {
                if (pm[2] >= 0.0 && pm[2] <= height) { return tm; }
                else {
                    if (pp[2] >= 0.0 && pp[2] <= height) { return tp; }
                    else { return -1.0; }
                }
            }
            else {
                if (tp > 0.0) {
                    if (pp[2] >= 0.0 && pp[2] <= height) { return tp; }
                    else { return -1.0; }
                }
                else {
                    return -1.0;
                }
            }
        }
        else {
            // only plus
            if (tp > 0.0 && pp[2] >= 0.0 && pp[2] <= height) { return tp; }
            else { return -1.0; }
        }
    }
    else {
        if (thetam <= s.endAngle) {
            // only minus
            if (tm > 0.0 && pm[2] >= 0.0 && pm[2] <= height) { return tm; }
            else { return -1.0; }
        }
        else {
            // no 
            return -1.0;
        }
    }
}

vec3 sphereNormal(vec3 pt, vec3 s, float radius, vec3 rd) {
    vec3 radial =  (pt - s) / radius;
    if (dot(radial, rd) <= 0.0) {
        return radial;
    }
    else {
        return -radial;
    }
}

vec3 rectangleNormal(vec3 p1, vec3 p2, vec3 p3, vec3 rd) {
    vec3 Ry = normalize(p3 - p1);
    vec3 Rx = normalize(p2 - p1);
    vec3 Rz = cross(Rx, Ry);
    if (dot(Rz, rd) <= 0.0) {
        return Rz;
    }
    else {
        return -Rz;
    }
}

vec3 triangleNormal(vec3 p1, vec3 p2, vec3 p3, vec3 rd) {
    vec3 Ry = normalize(p3 - p1);
    vec3 Rx = normalize(p2 - p1);
    vec3 Rz = cross(Rx, Ry);
    if (dot(Rz, rd) <= 0.0) {
        return Rz;
    }
    else {
        return -Rz;
    }
}

vec3 diskNormal(vec3 p1, vec3 p2, vec3 p3, vec3 rd) {
    vec3 Rz = normalize(p2 - p1);
    if (dot(Rz, rd) <= 0.0) {
        return Rz;
    }
    else {
        return -Rz;
    }
}

vec3 cylinderNormal(vec3 pt, vec3 p1, vec3 p2, float radius, vec3 rd) {
    vec3 axis = normalize(p2 - p1);
    vec3 radial = ((pt - p1) - dot((pt - p1),axis) * axis) / radius;
    if (dot(radial, rd) <= 0.0) {
        return radial;
    }
    else {
        return -radial;
    }
}

vec3 coneNormal(vec3 pt, vec3 p1, vec3 p2, float radius1, float radius2, vec3 rd) {
    vec3 axis = normalize(p2 - p1);
    vec3 radial = normalize((pt - p1) - dot((pt - p1),axis) * axis);
    float ang = (radius1 - radius2) / length(p2 - p1);
    vec3 normal = normalize(radial + ang * axis);
    if (dot(normal, rd) <= 0.0) {
        return normal;
    }
    else {
        return -normal;
    }
}

vec3 paraboloidNormal(vec3 pt, vec3 p1, vec3 p2, float radius, vec3 rd) {
    vec3 axis = normalize(p2 - p1);
    vec3 radial = (pt - p1) - dot((pt - p1),axis) * axis;
    float ang = radius*radius / length(p2 - p1);
    vec3 normal = normalize(normalize(radial) - ang/(2.0*length(radial)) * axis);
    if (dot(normal, rd) <= 0.0) {
        return normal;
    }
    else {
        return -normal;
    }
}

float intersect(vec3 ro, vec3 rd, out vec3 norm, out vec3 color) {
    float dist = maxDistance;

    for (int i=0; i<numSphere; i++) {
        float sphereDistance = sphere(uSpheres[i], ro, rd);
        if (sphereDistance > 0.0 && sphereDistance < dist) {
            dist = sphereDistance;
            // Point of intersection
            vec3 pt = ro + dist * rd;
            // Get normal for that point
            norm = sphereNormal(pt, uSpheres[i].p1, uSpheres[i].radius, rd);
            // Get color for the sphere
            color = uSpheres[i].color;
        }
    }

    for (int i=0; i<numRectangle; i++) {
        float rectangleDistance = rectangle(uRectangles[i], ro, rd);
        if (rectangleDistance > 0.0 && rectangleDistance < dist) {
            dist = rectangleDistance;
            // Get normal for that point
            norm = rectangleNormal(uRectangles[i].p1, uRectangles[i].p2, uRectangles[i].p3, rd);
            // Get color for the sphere
            color = uRectangles[i].color;
        }
    }

    for (int i=0; i<numTriangle; i++) {
        float triangleDistance = triangle(uTriangles[i], ro, rd);
        if (triangleDistance > 0.0 && triangleDistance < dist) {
            dist = triangleDistance;
            // Get normal for that point
            norm = triangleNormal(uTriangles[i].p1, uTriangles[i].p2, uTriangles[i].p3, rd);
            // Get color for the sphere
            color = uTriangles[i].color;
        }
    }

    for (int i=0; i<numDisk; i++) {
        float diskDistance = disk(uDisks[i], ro, rd);
        if (diskDistance > 0.0 && diskDistance < dist) {
            dist = diskDistance;
            // Get normal for that point
            norm = diskNormal(uDisks[i].p1, uDisks[i].p2, uDisks[i].p3, rd);
            // Get color for the sphere
            color = uDisks[i].color;
        }
    }

    for (int i=0; i<numCylinder; i++) {
        float cylinderDistance = cylinder(uCylinders[i], ro, rd);
        if (cylinderDistance > 0.0 && cylinderDistance < dist) {
            dist = cylinderDistance;
            vec3 pt = ro + dist * rd;
            // Get normal for that point
            norm = cylinderNormal(pt, uCylinders[i].p1, uCylinders[i].p2, uCylinders[i].radius, rd);
            // Get color for the sphere
            color = uCylinders[i].color;
        }
    }

    for (int i=0; i<numCone; i++) {
        float coneDistance = cone(uCones[i], ro, rd);
        if (coneDistance > 0.0 && coneDistance < dist) {
            dist = coneDistance;
            vec3 pt = ro + dist * rd;
            // Get normal for that point
            norm = coneNormal(pt, uCones[i].p1, uCones[i].p2, uCones[i].radius1, uCones[i].radius2, rd);
            // Get color for the sphere
            color = uCones[i].color;
        }
    }

    for (int i=0; i<numParaboloid; i++) {
        float paraboloidDistance = paraboloid(uParaboloids[i], ro, rd);
        if (paraboloidDistance > 0.0 && paraboloidDistance < dist) {
            dist = paraboloidDistance;
            vec3 pt = ro + dist * rd;
            // Get normal for that point
            norm = paraboloidNormal(pt, uParaboloids[i].p1, uParaboloids[i].p2, uParaboloids[i].radius, rd);
            // Get color for the sphere
            color = uParaboloids[i].color;
        }
    }
    return dist;
}

void main(void) {
    vec2 uv = gl_FragCoord.xy * uInverseTextureSize;
    float aspectRatio = uInverseTextureSize.y / uInverseTextureSize.x;
    vec3 rd_local = normalize(vec3(-0.5 + uv * vec2(aspectRatio, 1.0), -1.0));
    vec3 ro = vec3(uCameraMatrix[3][0], uCameraMatrix[3][1], uCameraMatrix[3][2]);
    vec3 rx = vec3(uCameraMatrix[0][0], uCameraMatrix[0][1], uCameraMatrix[0][2]);
    vec3 ry = vec3(uCameraMatrix[1][0], uCameraMatrix[1][1], uCameraMatrix[1][2]);
    vec3 rz = vec3(uCameraMatrix[2][0], uCameraMatrix[2][1], uCameraMatrix[2][2]);
    vec3 rd_world = rx * rd_local[0] + ry * rd_local[1] + rz * rd_local[2];
    vec3 objectNormal = vec3(0.0);
    vec3 objectColor = backgroundColor;
    vec3 rayColor = backgroundColor;
    vec3 lightDirection = normalize(vec3(0.5));
    float t = intersect(ro, rd_world, objectNormal, objectColor);

    if (t < maxDistance) {
        // Diffuse factor
        float diffuse = clamp(dot(objectNormal, lightDirection), 0.0, 1.0);
        rayColor = objectColor * diffuse + ambient;
    }
    fragColor = vec4(rayColor, 1.0);
}`