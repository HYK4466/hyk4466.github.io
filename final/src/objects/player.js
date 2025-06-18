import * as THREE from 'three';
import * as RAPIER from '@dimforge/rapier3d-compat';

export class Player {
    /**
     * 플레이어 캐릭터를 생성하는 클래스
     * @param {THREE.Scene} scene - THREE.js Scene 객체
     * @param {RAPIER.World} world - Rapier 물리 월드 객체
     * @param {number} x - 초기 x 좌표
     * @param {number} y - 초기 y 좌표
     * @param {number} z - 초기 z 좌표
     */
    constructor(scene, world, x = 0, y = 1, z = 0) {
        this.scene = scene;
        this.world = world;

        // 플레이어 메쉬 생성
        this.object = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        this.mesh = new THREE.Mesh(this.object, material);
        this.mesh.position.set(x, y, z);
        this.scene.add(this.mesh);

        // Rapier 바디 생성
        const bodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(x, y, z);
        this.body = this.world.createRigidBody(bodyDesc);
        const colliderDesc = RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5);
        this.world.createCollider(colliderDesc, this.body);
    }
}