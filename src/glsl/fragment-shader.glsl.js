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

float sphere(vec3 p1, vec3 p2, vec3 p3, float radius, float start_angle, float end_angle, float apex_truncation, float base_truncation, vec3 ro, vec3 rd) {
    vec3 Rx = normalize(p3 - p1);
    vec3 Rz = normalize(p2 - p1);
    vec3 Ry = cross(Rz, Rx);
    mat3 Rmat = mat3(Rx, Ry, Rz);
    mat3 Rinv = transpose(Rmat);
    vec3 Ro = Rinv * (ro - p1);
    vec3 Rd = Rinv * rd;
    float a = dot(Rd, Rd);
    float b = dot(Rd, Ro);
    float c = dot(Ro, Ro) - radius*radius;
    float d = b*b - a*c;
    if (d < 0.0) {
        return d;
    }
    float tp = (-b+sqrt(d)) / a;
    float tm = (-b-sqrt(d)) / a;
    vec3 pp = Ro + tp * Rd;
    vec3 pm = Ro + tm * Rd;
    float thetap = azimuth(pp[1], pp[0], start_angle);
    float thetam = azimuth(pm[1], pm[0], start_angle);

    if (thetap <= end_angle) {
        if (thetam <= end_angle) {
            // both
            if (tm > 0.0) {
                if (pm[2] <= apex_truncation && pm[2] >= base_truncation) { return tm; }
                else {
                    if (pp[2] <= apex_truncation && pp[2] >= base_truncation) { return tp; }
                    else { return -1.0; }
                }
            }
            else {
                if (tp > 0.0) {
                    if (pp[2] <= apex_truncation && pp[2] >= base_truncation) { return tp; }
                    else { return -1.0; }
                }
                else {
                    return -1.0;
                }
            }
        }
        else {
            // only plus
            if (tp > 0.0 && pp[2] <= apex_truncation && pp[2] >= base_truncation) { return tp; }
            else { return -1.0; }
        }
    }
    else {
        if (thetam <= end_angle) {
            // only minus
            if (tm > 0.0 && pm[2] <= apex_truncation && pm[2] >= base_truncation) { return tm; }
            else { return -1.0; }
        }
        else {
            // no 
            return -1.0;
        }
    }
}

float rectangle(vec3 p1, vec3 p2, vec3 p3, vec3 ro, vec3 rd) {
    vec3 Ry = normalize(p3 - p1);
    vec3 Rx = normalize(p2 - p1);
    vec3 Rz = cross(Rx, Ry);
    if (dot(Rz, rd) == 0.0) {
        return -1.0;
    }
    mat3 Rmat = mat3(Rx, Ry, Rz);
    mat3 Rinv = transpose(Rmat);
    vec3 Ro = Rinv * (ro - p1);
    vec3 Rd = Rinv * rd;
    float t = -Ro[2]/Rd[2];
    if (t <= 0.0) {
        return t;
    }
    vec3 XYZ = Ro + Rd * t;
    if (0.0 <= XYZ[0] && XYZ[0] <= length(p2 - p1) && 0.0 <= XYZ[1] && XYZ[1] <= length(p3 - p1) ) {
        return t;
    }
    else {
        return -1.0;
    }
}

float triangle(vec3 p1, vec3 p2, vec3 p3, vec3 ro, vec3 rd) {
    vec3 Ry = p3 - p1;
    vec3 Rx = p2 - p1;
    vec3 Rz = cross(Rx, Ry);
    if (dot(Rz, rd) == 0.0) {
        return -1.0;
    }
    mat3 Rmat = mat3(Rx, Ry, Rz);
    mat3 Rinv = inverse(Rmat);
    vec3 Ro = Rinv * (ro - p1);
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

float disk(vec3 p1, vec3 p2, vec3 p3, float outer_radius, float inner_radius, float start_angle, float end_angle, vec3 ro, vec3 rd) {
    vec3 Rx = normalize(p3 - p1);
    vec3 Rz = normalize(p2 - p1);
    vec3 Ry = cross(Rz, Rx);
    if (dot(Rz, rd) == 0.0) {
        return -1.0;
    }
    mat3 Rmat = mat3(Rx, Ry, Rz);
    mat3 Rinv = transpose(Rmat);
    vec3 Ro = Rinv * (ro - p1);
    vec3 Rd = Rinv * rd;
    float t = -Ro[2]/Rd[2];
    if (t <= 0.0) {
        return t;
    }
    vec3 XYZ = Ro + Rd * t;
    float dist = XYZ[0]*XYZ[0] + XYZ[1]*XYZ[1];
    float theta = azimuth(XYZ[1], XYZ[0], start_angle);
    if (dist > inner_radius*inner_radius && dist < outer_radius*outer_radius && theta > start_angle && theta < end_angle) {
        return t;
    }
    else {
        return -1.0;
    }
}

float cylinder(vec3 p1, vec3 p2, vec3 p3, float radius, float start_angle, float end_angle, vec3 ro, vec3 rd) {
    vec3 Rx = normalize(p3 - p1);
    vec3 Rz = normalize(p2 - p1);
    vec3 Ry = cross(Rz, Rx);
    if (dot(Rz, rd) == 0.0) {
        return -1.0;
    }
    mat3 Rmat = mat3(Rx, Ry, Rz);
    mat3 Rinv = transpose(Rmat);
    vec3 Ro = Rinv * (ro - p1);
    vec3 Rd = Rinv * rd;
    float a = Rd[0]*Rd[0] + Rd[1]*Rd[1];
    float b = Ro[0]*Rd[0] + Ro[1]*Rd[1];
    float c = Ro[0]*Ro[0] + Ro[1]*Ro[1] - radius*radius;
    float d = b*b - a*c;
    if (d < 0.0) {
        return -1.0;
    }
    float tp = (-b+sqrt(d)) / a;
    float tm = (-b-sqrt(d)) / a;
    vec3 pp = Ro + tp * Rd;
    vec3 pm = Ro + tm * Rd;
    float thetap = azimuth(pp[1], pp[0], start_angle);
    float thetam = azimuth(pm[1], pm[0], start_angle);
    float height = length(p2 - p1);

    if (thetap <= end_angle) {
        if (thetam <= end_angle) {
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
        if (thetam <= end_angle) {
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

float cone(vec3 p1, vec3 p2, vec3 p3, float radius1, float radius2, float start_angle, float end_angle, vec3 ro, vec3 rd) {
    vec3 Rx = normalize(p3 - p1);
    vec3 Rz = normalize(p2 - p1);
    vec3 Ry = cross(Rz, Rx);
    mat3 Rmat = mat3(Rx, Ry, Rz);
    mat3 Rinv = transpose(Rmat);
    float ang = length(p2 - p1) / (radius1 - radius2);
    float ang2 = 1.0 / (ang * ang);
    vec3 p0 = radius1 / (radius1 - radius2) * (p2 - p1) + p1;
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
    float thetap = azimuth(pp[1], pp[0], start_angle);
    float thetam = azimuth(pm[1], pm[0], start_angle);
    float min_height = - radius1 * ang;
    float max_height = - radius2 * ang;

    if (thetap <= end_angle) {
        if (thetam <= end_angle) {
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
        if (thetam <= end_angle) {
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

float paraboloid(vec3 p1, vec3 p2, vec3 p3, float radius, float start_angle, float end_angle, vec3 ro, vec3 rd) {
    vec3 Rx = normalize(p3 - p1);
    vec3 Rz = normalize(p2 - p1);
    vec3 Ry = cross(Rz, Rx);
    mat3 Rmat = mat3(Rx, Ry, Rz);
    mat3 Rinv = transpose(Rmat);
    float height = length(p2 - p1);
    float ang = radius*radius / height;
    vec3 Ro = Rinv * (ro - p1);
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
    float thetap = azimuth(pp[1], pp[0], start_angle);
    float thetam = azimuth(pm[1], pm[0], start_angle);

    if (thetap <= end_angle) {
        if (thetam <= end_angle) {
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
        if (thetam <= end_angle) {
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
    vec3 p1 = vec3(0.0, 0.0, 0.0);
    vec3 p2 = vec3(0.0, 1.0, 0.0);
    vec3 p3 = vec3(1.0, 0.0, 0.0);
    vec3 q1 = vec3(0.0, 0.0, 0.0);
    vec3 q2 = vec3(0.0, 2.5, 0.0);
    vec3 q3 = vec3(2.5, 0.0, 0.0);
    vec3 r1 = vec3(0.0, 0.0, 0.0);
    vec3 r2 = vec3(0.0, 3.5, 0.0);
    vec3 r3 = vec3(3.5, 0.0, 0.0);
    float radius = 2.0;
    float outer_radius = 3.0;
    float inner_radius = 1.0;
    float start_angle = -2.0/4.0 * PI;
    float end_angle = 3.0/4.0 * PI;
    float apex_truncation = 2.0;
    float base_truncation = -1.0;
    vec3 sphereColor = vec3(0.9, 0.8, 0.6);
    vec3 rectangleColor = vec3(0.2, 0.3, 0.4);
    vec3 triangleColor = vec3(0.2, 0.9, 0.4);
    vec3 diskColor = vec3(0.9, 0.3, 0.2);
    vec3 cylinderColor = vec3(0.2, 0.3, 0.9);
    vec3 coneColor = vec3(0.2, 0.9, 0.9);
    vec3 paraboloidColor = vec3(0.9, 0.1, 0.9);

    // If we wanted multiple objects in the scene you would loop through them here
    // and return the normal and color with the closest intersection point (lowest distance).
    float intersectionDistance = sphere(p1, p2, p3, radius, start_angle, end_angle, apex_truncation, base_truncation, ro, rd);
    if (intersectionDistance > 0.0 && intersectionDistance < dist) {
        dist = intersectionDistance;
        // Point of intersection
        vec3 pt = ro + dist * rd;
        // Get normal for that point
        norm = sphereNormal(pt, p1, radius, rd);
        // Get color for the sphere
        color = sphereColor;
    }

    float rectangleDistance = rectangle(q1, q2, q3, ro, rd);
    if (rectangleDistance > 0.0 && rectangleDistance < dist) {
        dist = rectangleDistance;
        // Get normal for that point
        norm = rectangleNormal(q1, q2, q3, rd);
        // Get color for the sphere
        color = rectangleColor;
    }

    q1 = vec3(0.0, 0.0, 2.0);
    q2 = vec3(0.0, 2.5, 2.0);
    q3 = vec3(2.5, 0.0, 2.0);

    float triangleDistance = triangle(q1, q2, q3, ro, rd);
    if (triangleDistance > 0.0 && triangleDistance < dist) {
        dist = triangleDistance;
        // Get normal for that point
        norm = triangleNormal(q1, q2, q3, rd);
        // Get color for the sphere
        color = triangleColor;
    }

    float diskDistance = disk(r1, r2, r3, outer_radius, inner_radius, start_angle, end_angle, ro, rd);
    if (diskDistance > 0.0 && diskDistance < dist) {
        dist = diskDistance;
        // Get normal for that point
        norm = diskNormal(r1, r2, r3, rd);
        // Get color for the sphere
        color = diskColor;
    }

    radius = 1.0;
    start_angle = -PI;
    end_angle = PI;
    q1 = vec3(0.0, 0.0, 5.0);
    q2 = vec3(0.0, 2.0, 5.0);
    q3 = vec3(2.0, 0.0, 5.0);

    float cylinderDistance = cylinder(q1, q2, q3, radius, start_angle, end_angle, ro, rd);
    if (cylinderDistance > 0.0 && cylinderDistance < dist) {
        dist = cylinderDistance;
        vec3 pt = ro + dist * rd;
        // Get normal for that point
        norm = cylinderNormal(pt, q1, q2, radius, rd);
        // Get color for the sphere
        color = cylinderColor;
    }

    q1 = vec3(0.0, 0.0, -5.0);
    q2 = vec3(0.0, 1.5, -5.0);
    q3 = vec3(2.5, 0.0, -5.0);
    float radius1 = 1.5;
    float radius2 = 1.0;

    float coneDistance = cone(q1, q2, q3, radius1, radius2, start_angle, end_angle, ro, rd);
    if (coneDistance > 0.0 && coneDistance < dist) {
        dist = coneDistance;
        vec3 pt = ro + dist * rd;
        // Get normal for that point
        norm = coneNormal(pt, q1, q2, radius1, radius2, rd);
        // Get color for the sphere
        color = coneColor;
    }

    radius = 2.0;
    q1 = vec3(0.0, 2.0, -5.0);
    q2 = vec3(0.0, 3.5, -5.0);
    q3 = vec3(2.5, 2.0, -5.0);

    float paraboloidDistance = paraboloid(q1, q2, q3, radius, start_angle, end_angle, ro, rd);
    if (paraboloidDistance > 0.0 && paraboloidDistance < dist) {
        dist = paraboloidDistance;
        vec3 pt = ro + dist * rd;
        // Get normal for that point
        norm = paraboloidNormal(pt, q1, q2, radius, rd);
        // Get color for the sphere
        color = paraboloidColor;
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