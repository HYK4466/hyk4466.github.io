// levels/title.js
import * as THREE from 'three';
import * as RAPIER from '@dimforge/rapier3d-compat';

let titleTextMesh = null;

/**
 * 타이틀 화면 초기화
 * @param {THREE.Scene} scene 
 * @param {RAPIER.World} world 
 */
export function initLevel(scene, world) {
    // 배경 큐브나 로고 등을 넣을 수 있음
    const geometry = new THREE.BoxGeometry(5, 5, 5);
    const material = new THREE.MeshStandardMaterial({ color: 0x3366ff, opacity: 0.7, transparent: true });
    const backgroundCube = new THREE.Mesh(geometry, material);
    backgroundCube.position.set(0, 3, -10);
    scene.add(backgroundCube);

    // 타이틀 텍스트 DOM
    const title = document.createElement('div');
    title.id = 'title-screen';
    title.innerHTML = `
        <h1>My First Quantum Translocator</h1>
        <p>Press Enter to Start</p>
    `;
    title.style.position = 'absolute';
    title.style.top = '40%';
    title.style.left = '50%';
    title.style.transform = 'translate(-50%, -50%)';
    title.style.textAlign = 'center';
    title.style.fontSize = '2rem';
    title.style.color = 'white';
    title.style.textShadow = '2px 2px 4px black';
    document.body.appendChild(title);

    // 빛
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(10, 10, 10);
    scene.add(light);
}

/**
 * 제거 함수
 */
export function disposeLevel(scene, world) {
    const title = document.getElementById('title-screen');
    if (title) title.remove();

    // 필요하면 backgroundCube 제거도 여기서
}
