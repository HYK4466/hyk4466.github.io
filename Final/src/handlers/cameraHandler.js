import * as THREE from 'three';
import * as RAPIER from '@dimforge/rapier3d-compat';

/**
 * Camera을 Initialize하는 function
 * @param {number} fov      시야각 (Field of View)
 * @param {number} aspect   종횡비 (Aspect Ratio)
 * @param {number} near     렌더링 할 최소 거리 (Near Clipping Plane)
 * @param {number} far      렌더링 할 최대 거리 (Far Clipping Plane)
 * @returns {THREE.PerspectiveCamera} Initialize된 Camera 객체
 */
export function initCamera(fov = 75, aspect = window.innerWidth / window.innerHeight, near = 0.1, far = 1000) {
    return new THREE.PerspectiveCamera(fov, aspect, near, far);
}