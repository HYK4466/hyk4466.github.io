import * as THREE from 'three';
import * as RAPIER from "@dimforge/rapier3d-compat";

import { SimpleCube, StaticSimpleCube, PhysicalSimpleCube } from '../objects/blocks/cube.js';

import * as sceneHandler from '../handlers/sceneHandler.js';
import * as cameraHandler from '../handlers/cameraHandler.js';
import * as rendererHandler from '../handlers/rendererHandler.js'
import * as worldHandler from '../handlers/worldHandler.js';

import * as WindowController from '../controllers/windowController.js';


import * as TEX from './texture.js'

let startBlock;
let endBlock;
let startPos = [0, 0, 0];
let obstacleBlocks = []; // 장애물 블록

let levelObjects = [];  // 레벨 내 모든 오브젝트 담음

let clock = new THREE.Clock();
let startTime = clock.getElapsedTime();

/**
 * 레벨을 initialize하는 function
 * @param {THREE.Scene} scene 
 * @param {RAPIER.world} world 
 */
export function initLevel(scene, world) {
    const floor = new StaticSimpleCube(scene, world, 20, 1, 20, 0x888888, 0, 0.5, 0);

    const wall1 = new StaticSimpleCube(scene, world, 20, 20, 1, 0x888888, 0, 10, -10);
    const wall2 = new StaticSimpleCube(scene, world, 20, 20, 1, 0x888888, 0, 10, 10);
    const wall3 = new StaticSimpleCube(scene, world, 1, 20, 20, 0x888888, -10, 10, 0);
    const wall4 = new StaticSimpleCube(scene, world, 1, 20, 20, 0x888888, 10, 10, 0);

    const obstacle1 = new StaticSimpleCube(scene, world, 0.5, 20, 20, 0xff0000, -10, 10, 0);

    obstacle1.collider.setSensor(true);  // 충돌 판정만, 물리 반응 없음
    obstacleBlocks = [obstacle1,];    

    startBlock = new StaticSimpleCube(scene, world, 1, 0.5, 1, 0xFFFFFF, 9, 1, -3.5);
    endBlock = new StaticSimpleCube(scene, world, 1, 0.5, 1, 0xFFFFFF, -9, 1, -3.5);
    endBlock.collider.setSensor(true);
    startBlock.collider.setSensor(true);

    TEX.initTexture(wall1, wall2, wall3, wall4, floor, startBlock, endBlock);
    obstacleTexture(obstacle1);

    startPos[0] = 9;
    startPos[1] = 3;
    startPos[2] = -3.5;

    // level 위쪽에 제목 표시
    const levelTitle = document.createElement('div');
    levelTitle.id = 'level-title';
    levelTitle.innerText = 'Level 4. 다가온다!';
    document.body.appendChild(levelTitle);

    levelObjects.push(floor, wall1, wall2, wall3, wall4, startBlock, endBlock);
}

function obstacleTexture(obstacle1) {
    const textureLoader = new THREE.TextureLoader();
    const ao = textureLoader.load('../texture/level4/ao.png');
    ao.wrapS = THREE.RepeatWrapping;
    ao.wrapS = THREE.RepeatWrapping;
    ao.repeat.set(1,1);
    const map  = textureLoader.load('../texture/level4/map.png');
    map.wrapS = THREE.RepeatWrapping; 
    map.wrapT = THREE.RepeatWrapping; 
    map.repeat.set(1, 1);
    const normal = textureLoader.load('../texture/level4/normal.png');
    normal.wrapS = THREE.RepeatWrapping;
    normal.wrapT = THREE.RepeatWrapping;
    normal.repeat.set(1,1);
    const rough = textureLoader.load('../texture/level4/rough.png');
    rough.wrapS = THREE.RepeatWrapping;
    rough.wrapT = THREE.RepeatWrapping;
    rough.repeat.set(1,1);
    const bump = textureLoader.load('../texture/level4/bump.png');
    bump.wrapS = THREE.RepeatWrapping;
    bump.wrapT = THREE.RepeatWrapping;
    bump.repeat.set(1,1);
    const emissive = textureLoader.load('../texture/level4/emissive.png');
    emissive.wrapS = THREE.RepeatWrapping;
    emissive.wrapT = THREE.RepeatWrapping;
    emissive.repeat.set(1,1);

    obstacle1.updateMaterialEmissiveMap(ao, map, normal, rough, bump, emissive);
}


/**
 * 레벨 run loop
 */
export function runLoop() {
    let time = clock.getElapsedTime() - startTime;
    obstacleBlocks[0].updateMeshPosition(-8*Math.sin(time/2));
}

/**
 * Player가 spawn하는 block
 * @returns {StaticSimpleCube} 
 */
export function getStartBlock() { 
    return startBlock;
}

/**
 * Player가 spawn해야하는 좌표
 * @returns 레벨 starting position의 [x,y,z] 
 */
export function getStartPos() {
    return startPos;
}


/**
 * Player가 레벨 클리어 하려면 collide해야하는 cube
 * @returns {StaticSimpleCube} 
 */
export function getEndBlock() {
    return endBlock;
}


/**
 * 충돌 시 GAME OVER 되는 장애물들
 * @returns {StaticSimpleCube[]} 
 */
export function getObstacleBlocks() {
    return obstacleBlocks;
}


// 기존 오브젝트 정리 함수
export function disposeLevel(scene, world) {
    for (let obj of levelObjects) {
        obj.dispose(); // mesh, geometry, collider, rigidbody 등 해제
    }
    levelObjects = [];

    for (let obj of obstacleBlocks) {
        obj.dispose();
    }
    obstacleBlocks = [];

    // 제목 텍스트 제거
    const oldTitle = document.getElementById('level-title');
    if (oldTitle) oldTitle.remove();
}
