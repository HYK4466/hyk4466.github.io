import * as THREE from 'three';
import * as Rapier from '@dimforge/rapier3d-compat';

/**
 * Renderer을 Initialize하는 function
 * @returns {THREE.WebGLRenderer} Initialize된 Renderer 객체
 */
export function initRenderer() {
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    return renderer;
}

/**
 * Renderer의 크기를 조정하는 function
 * @param {THREE.WebGLRenderer} renderer    렌더러 객체
 * @param {number} width                    렌더러의 너비
 * @param {number} height                   렌더러의 높이
 */
export function resizeRenderer(renderer, width = window.innerWidth, height = window.innerHeight) {
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
}