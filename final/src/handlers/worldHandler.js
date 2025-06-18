import * as THREE from 'three';
import * as RAPIER from '@dimforge/rapier3d-compat';

/**
 * 월드를 초기화하는 함수
 * @param {number} gravityX - X축 중력
 * @param {number} gravityY - Y축 중력
 * @param {number} gravityZ - Z축 중력
 * @returns {Promise<RAPIER.World>} world - Rapier 월드 객체
 */
export async function initWorld(gravityX = 0.0, gravityY = -9.81, gravityZ = 0.0) {
    // Initialize Rapier physics engine
    await RAPIER.init();
    const gravity = { x: gravityX, y: gravityY, z: gravityZ };
    const world = new RAPIER.World(gravity);
    return world;
}