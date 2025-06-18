import * as THREE from 'three';

/**
 * Scene을 Initialize하는 function
 * @returns {THREE.Scene} Initialize된 Scene 객체
 */
export function initScene() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb); // 배경색 설정
    return scene;
}