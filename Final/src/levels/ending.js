// levels/ending.js 현재 레벨은 6
import * as THREE from 'three';

let endingText = null;

export function initLevel(scene, world) {
    // 배경 요소 (선택적)
    const geometry = new THREE.SphereGeometry(30, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide });
    const backgroundSphere = new THREE.Mesh(geometry, material);
    scene.add(backgroundSphere);

    // 엔딩 텍스트 DOM 요소
    endingText = document.createElement('div');
    endingText.id = 'ending-screen';
    endingText.innerHTML = `
        <h1>All Clear!!!</h1>
        <p>Press 'R' to restart</p>
    `;
    endingText.style.position = 'absolute';
    endingText.style.top = '40%';
    endingText.style.left = '50%';
    endingText.style.transform = 'translate(-50%, -50%)';
    endingText.style.color = 'white';
    endingText.style.fontSize = '2rem';
    endingText.style.textAlign = 'center';
    endingText.style.textShadow = '2px 2px 4px black';
    document.body.appendChild(endingText);
}

export function disposeLevel(scene, world) {
    const text = document.getElementById('ending-screen');
    if (text) text.remove();
}