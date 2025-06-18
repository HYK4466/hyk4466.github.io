import * as THREE from 'three';
import * as RAPIER from "@dimforge/rapier3d-compat";

import { SimpleCube, StaticSimpleCube, PhysicalSimpleCube } from '../objects/blocks/cube.js';

import * as TEX from './texture.js'

import * as sceneHandler from '../handlers/sceneHandler.js';
import * as cameraHandler from '../handlers/cameraHandler.js';
import * as rendererHandler from '../handlers/rendererHandler.js'
import * as worldHandler from '../handlers/worldHandler.js';

import * as WindowController from '../controllers/windowController.js';

let startBlock;
let endBlock;
let startPos = [0,0,0];
let obstacleBlocks = []; // 장애물 블록
let levelObjects = [];  // 레벨 내 모든 오브젝트 담음


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

    const ground = new StaticSimpleCube(scene, world, 10, 5, 20, 0x88888, 0, 2.3, 0);

    startBlock = new StaticSimpleCube(scene, world, 1, 0.5, 1, 0xFFFFFF, 9, 1, -3.5);
    endBlock = new StaticSimpleCube(scene, world, 1, 0.5, 1, 0xFFFFFF, -9, 1, -3.5);
    endBlock.collider.setSensor(true);
    startBlock.collider.setSensor(true);


    TEX.initTexture(wall1, wall2, wall3, wall4, floor, startBlock, endBlock);
    obstacleTexture(ground);

    startPos[0] = 9;
    startPos[1] = 3; // 1.0보다 크게 해서 바닥 뚫림 방지
    startPos[2] = -3.5;

    obstacleBlocks = [];

    // level 위쪽에 제목 표시
    const levelTitle = document.createElement('div');
    levelTitle.id = 'level-title';
    levelTitle.innerText = 'Level 1. 점프를 높게!';
    document.body.appendChild(levelTitle);

    levelObjects.push(floor, wall1, wall2, wall3, wall4, ground, startBlock, endBlock);

}



function obstacleTexture(ground) {
    const textureLoader = new THREE.TextureLoader();
    const ao = textureLoader.load('../../texture/level1/ao.png');
    const map  = textureLoader.load('../../texture/level1/map.png');
    const normal = textureLoader.load('../../texture/level1/normal.png');
    const rough = textureLoader.load('../../texture/level1/rough.png');
    const metal = textureLoader.load('../../texture/level1/metallic.png');

    ground.updateMaterialAllMap(ao, map, normal, rough, metal);
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


// 기존 오브젝트 정리 함수
export function disposeLevel(scene, world) {
    for (let obj of levelObjects) {
        obj.dispose(); // mesh, geometry, collider, rigidbody 등 해제
    }
    levelObjects = [];

    // 제목 텍스트 제거
    const oldTitle = document.getElementById('level-title');
    if (oldTitle) oldTitle.remove();
}
