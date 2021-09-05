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
                    if (pp[2] <= apex_truncation && pm[2] >= base_truncation) { return tp; }
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

vec3 sphereNormaml(vec3 pt, vec3 s, float radius, vec3 rd) {
    vec3 reflect =  (pt - s) / radius;
    if (dot(reflect, rd) <= 0.0) {
        return reflect;
    }
    else {
        return -reflect;
    }
}

float intersect(vec3 ro, vec3 rd, out vec3 norm, out vec3 color) {
    float distance = maxDistance;
    vec3 p1 = vec3(0.0, 0.0, 0.0);
    vec3 p2 = vec3(0.0, 1.0, 0.0);
    vec3 p3 = vec3(1.0, 0.0, 0.0);
    float radius = 2.0;
    float start_angle = -2.0/4.0 * PI;
    float end_angle = 3.0/4.0 * PI;
    float apex_truncation = 2.0;
    float base_truncation = -1.0;
    vec3 sphereColor = vec3(0.9, 0.8, 0.6);

    // If we wanted multiple objects in the scene you would loop through them here
    // and return the normal and color with the closest intersection point (lowest distance).
    float intersectionDistance = sphere(p1, p2, p3, radius, start_angle, end_angle, apex_truncation, base_truncation, ro, rd);

    if (intersectionDistance > 0.0 && intersectionDistance < distance) {
        distance = intersectionDistance;
        // Point of intersection
        vec3 pt = ro + distance * rd;
        // Get normal for that point
        norm = sphereNormaml(pt, p1, radius, rd);
        // Get color for the sphere
        color = sphereColor;
    }
    
    return distance;
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