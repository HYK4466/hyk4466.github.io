import * as THREE from 'three';
import * as RAPIER from "@dimforge/rapier3d-compat";

import { SimpleCube, StaticSimpleCube, PhysicalSimpleCube } from '../objects/blocks/cube.js';

import * as sceneHandler from '../handlers/sceneHandler.js';
import * as cameraHandler from '../handlers/cameraHandler.js';
import * as rendererHandler from '../handlers/rendererHandler.js'
import * as worldHandler from '../handlers/worldHandler.js';

import * as WindowController from '../controllers/windowController.js';


export function initTexture(wall1, wall2, wall3, wall4, floor, startBlock, endBlock) {
    const textureLoader = new THREE.TextureLoader();
    const ao = textureLoader.load('../texture/wall/ao.jpg');
    ao.wrapS = THREE.RepeatWrapping;
    ao.wrapT = THREE.RepeatWrapping;
    ao.repeat.set(4,4);
    const map  = textureLoader.load('../texture/wall/map.jpg');
    map.wrapS = THREE.RepeatWrapping; 
    map.wrapT = THREE.RepeatWrapping; 
    map.repeat.set(4,4);
    const normal = textureLoader.load('../texture/wall/normal.jpg');
    normal.wrapS = THREE.RepeatWrapping;
    normal.wrapT = THREE.RepeatWrapping;
    normal.repeat.set(4,4);
    const rough = textureLoader.load('../texture/wall/rough.jpg');
    rough.wrapS = THREE.RepeatWrapping;
    rough.wrapT = THREE.RepeatWrapping;
    rough.repeat.set(4,4);
    const bump = textureLoader.load('../texture/wall/bump.jpg');
    bump.wrapS = THREE.RepeatWrapping;
    bump.wrapT = THREE.RepeatWrapping;
    bump.repeat.set(4,4);
    const metal = textureLoader.load('../texture/wall/metal.jpg');
    metal.wrapS = THREE.RepeatWrapping;
    metal.wrapT = THREE.RepeatWrapping;
    metal.repeat.set(4,4);

    wall1.updateMaterialOMap(ao, map, normal, rough, bump, metal);
    wall2.updateMaterialOMap(ao, map, normal, rough, bump, metal);
    wall3.updateMaterialOMap(ao, map, normal, rough, bump, metal);
    wall4.updateMaterialOMap(ao, map, normal, rough, bump, metal);

    const floorao = textureLoader.load('../texture/floor/ao.png');
    floorao.wrapS = THREE.RepeatWrapping;
    floorao.wrapT = THREE.RepeatWrapping;
    floorao.repeat.set(2,2);
    const floormap  = textureLoader.load('../texture/floor/map.png');
    floormap.wrapS = THREE.RepeatWrapping; 
    floormap.wrapT = THREE.RepeatWrapping; 
    floormap.repeat.set(2, 2);
    const floornormal = textureLoader.load('../texture/floor/normal.png');
    floornormal.wrapS = THREE.RepeatWrapping;
    floornormal.wrapT = THREE.RepeatWrapping;
    floornormal.repeat.set(2,2);
    const floorrough = textureLoader.load('../texture/floor/rough.png');
    floorrough.wrapS = THREE.RepeatWrapping;
    floorrough.wrapT = THREE.RepeatWrapping;
    floorrough.repeat.set(2,2);
    const floorbump = textureLoader.load('../texture/floor/bump.png');
    floorbump.wrapS = THREE.RepeatWrapping;
    floorbump.wrapT = THREE.RepeatWrapping;
    floorbump.repeat.set(2,2);
    
    floor.updateMaterialBMap(floorao, floormap, floornormal, floorrough, floorbump);


    const sao = textureLoader.load('../texture/spawn/ao.jpg');
    sao.wrapS = THREE.RepeatWrapping;
    sao.wrapT = THREE.RepeatWrapping;
    sao.repeat.set(0.5,0.5);
    const smap  = textureLoader.load('../texture/spawn/map.jpg');
    smap.wrapS = THREE.RepeatWrapping; 
    smap.wrapT = THREE.RepeatWrapping; 
    smap.repeat.set(0.5,0.5);
    const snormal = textureLoader.load('../texture/spawn/normal.jpg');
    snormal.wrapS = THREE.RepeatWrapping;
    snormal.wrapT = THREE.RepeatWrapping;
    snormal.repeat.set(0.5,0.5);
    const srough = textureLoader.load('../texture/spawn/rough.jpg');
    srough.wrapS = THREE.RepeatWrapping;
    srough.wrapT = THREE.RepeatWrapping;
    srough.repeat.set(0.5,0.5);
    const sbump = textureLoader.load('../texture/spawn/bump.jpg');
    sbump.wrapS = THREE.RepeatWrapping;
    sbump.wrapT = THREE.RepeatWrapping;
    sbump.repeat.set(0.5,0.5);
    const smetal = textureLoader.load('../texture/spawn/metal.jpg');
    smetal.wrapS = THREE.RepeatWrapping;
    smetal.wrapT = THREE.RepeatWrapping;
    smetal.repeat.set(0.5,0.5);


    const spawntexture = textureLoader.load('../texture/spawn.png');
    startBlock.updateMaterialOMap(sao, smap, snormal, srough, sbump, smetal);
    endBlock.updateMaterialOMap(sao, smap, snormal, srough, sbump, smetal);
}