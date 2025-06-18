import * as THREE from 'three';
import * as RAPIER from '@dimforge/rapier3d-compat';

import * as rendererHandler from '../handlers/rendererHandler.js';
import * as cameraHandler from '../handlers/cameraHandler.js';

/**
 * window의 크기에 따라 렌더러와 카메라를 자동으로 조정하는 함수
 * @param {THREE.WebGLRenderer} renderer 
 * @param {THREE.PerspectiveCamera} camera 
 */
export function autoResizeWindow(renderer, camera) {
    window.addEventListener('resize', () => {
        rendererHandler.resizeRenderer(renderer, window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });
}