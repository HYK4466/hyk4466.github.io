import * as THREE from 'three';
import * as RAPIER from '@dimforge/rapier3d-compat';


/**
 * 렌더링 되지 않는 추상적인 Cube Class
 * @abstract
 */
export class AbstractSimpleCube{

    /**
     * @type {THREE.Scene}
     * @default undefined
     * @description `Scene` 객체
     */
    scene = undefined;

    /**
     * @type {number}
     * @default 1
     * @description `Cube`의 너비
     */
    width = 1;

    /**
     * @type {number}
     * @default 1
     * @description `Cube`의 높이
     */
    height = 1;

    /**
     * @type {number}
     * @default 1
     * @description `Cube`의 깊이
     */
    depth = 1;

    /**
     * @type {number}
     * @default 0x888888
     * @description `Cube`의 색상
     */
    color = 0x888888;

    /**
     * @type {number}
     * @default -0.5
     * @description `Cube` 중심점의 x 좌표
     */
    x = -0.5;

    /**
     * @type {number}
     * @default -0.5
     * @description `Cube` 중심점의 y 좌표
     */
    y = -0.5;

    /**
     * @type {number}
     * @default -0.5
     * @description `Cube` 중심점의 z 좌표
     */
    z = -0.5;

    /**
     * @type {number}
     * @default 0.5
     * @description `Cube`의 거칠기
     */
    roughness = 0.5;

    /**
     * @type {number}
     * @default 0.1
     * @description `Cube`의 금속성
     */
    metalness = 0.1;

    /**
     * @type {number}
     * @default 1
     * @description `Cube`의 너비 세그먼트 수
     */
    widthSegments = 1;

    /**
     * @type {number}
     * @default 1
     * @description `Cube`의 높이 세그먼트 수
     */
    heightSegments = 1;

    /**
     * @type {number}
     * @default 1
     * @description `Cube`의 깊이 세그먼트 수
     */
    depthSegments = 1;

    /**
     * @type {THREE.BoxGeometry}
     * @default undefined
     * @description `Cube`의 기하학적 정보
     */
    geometry = undefined;

    /**
     * @type {THREE.Mesh}
     * @default undefined
     * @description Cube의 메쉬 객체
     */
    mesh = undefined;

    /**
     * @type {THREE.MeshStandardMaterial}
     * @default undefined
     * @description `Cube`의 Material
     */
    material = undefined;

    /**
     * @type {number}
     * @default 0
     * @description `Cube`의 부피
     */
    volume = 0;

    /**
     * Cube Graphic Class
     * @param {THREE.Scene} scene 
     * @param {number} width 
     * @param {number} height 
     * @param {number} depth 
     * @param {number} color 
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     * @param {number} roughness 
     * @param {number} metalness 
     * @param {number} widthSegments 
     * @param {number} heightSegments 
     * @param {number} depthSegments 
     */
    constructor(
        scene,
        width = 1,
        height = 1,
        depth = 1,
        color = 0x888888,
        x = 0,
        y = 0,
        z = 0,
        roughness = 0.5,
        metalness = 0.1,
        widthSegments = 1,
        heightSegments = 1,
        depthSegments = 1,
    ) {
        if (new.target === AbstractSimpleCube) {
            throw new TypeError("Cannot construct AbstractSimpleCube instances directly");
        }
        this.scene = scene;
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.color = color;
        this.x = x;
        this.y = y;
        this.z = z;
        this.roughness = roughness;
        this.metalness = metalness;
        this.widthSegments = widthSegments;
        this.heightSegments = heightSegments;
        this.depthSegments = depthSegments;
        this.volume = width * height * depth;
    }

    /**
     * Shape의 기하적 정보를 저장하는 Instance를 Initialize하는 Method
     * @protected
     */
    _initGeometry() {
        if (this.geometry) {
            console.warn("Geometry is already initialized.");
            return;
        }

        this.geometry = new THREE.BoxGeometry(
            this.width,
            this.height,
            this.depth,
            this.widthSegments,
            this.heightSegments,
            this.depthSegments
        );
    }

    /**
     * Material을 초기화하는 Method
     * @param {number} color - `Cube`의 색상
     * @param {number} roughness - `Cube`의 거칠기
     * @param {number} metalness - `Cube`의 금속성
     * @protected
     */
    _initMaterial(color = this.color, roughness = this.roughness, metalness = this.metalness) {
        if (this.material) {
            console.warn("Material is already initialized.");
            return;
        }

        this.material = new THREE.MeshStandardMaterial(
            {
                color: color,
                roughness: roughness,
                metalness: metalness
            }
        );
    }

    /**
     * Material의 색상을 update하는 Method
     * @param {number} color - 새로운 색상
     */
    updateMaterialColor(color = this.color) {
        if (this.material) {
            this.material.color.set(color);
        } else {
            console.warn("Material is not initialized. Call initMaterial() first.");
        }
    }

    updateMaterialMap(map) {
        if (this.material) {
            this.material.map = map;
        }
    }

    updateMaterialEmissiveMap(ao, map, normal, rough, bump, emissive) {
        if (this.material) {
            this.material.aoMap = ao;
            this.material.aoMapIntensity = 1.0;
            this.material.map = map;
            this.material.normalMap = normal;
            this.material.roughnessMap = rough;
            this.material.bumpMap = bump;
            this.material.bumpScale = 2.0;  
            this.material.emissiveMap = emissive;
            this.material.emissiveIntensity = 1.0;          
        }
    }

    updateMaterialBMap(ao, map, normal, rough, bump) {
        if (this.material) {
            this.material.aoMap = ao;
            this.material.aoMapIntensity = 1.0;
            this.material.map = map;
            this.material.normalMap = normal;
            this.material.roughnessMap = rough;
            this.material.bumpMap = bump;
            this.material.bumpScale = 2.0;
        }
    }

    updateMaterialOMap(ao, map, normal, rough, bump, metal) {
        if (this.material) {
            this.material.aoMap = ao;
            this.material.aoMapIntensity = 1.0;
            this.material.map = map;
            this.material.normalMap = normal;
            this.material.roughnessMap = rough;
            this.material.bumpMap = bump;
            this.material.bumpScale = 2.0;
            this.material.metalnessMap = metal;
        }
    }

    updateMaterialAllMap(ao, map, normal, rough, metal) {
        if (this.material) {
            this.material.aoMap = ao;
            this.material.aoMapIntensity = 1.0;
            this.material.map = map;
            this.material.normalMap = normal;
            this.material.roughnessMap = rough;
            this.material.metalnessMap = metal;
        }
    }

    updateMaterialBumpScale(scale) {
        if (this.material) {
            this.material.bumpScale = scale;
        }
    }

    /**
     * Material의 거칠기를 update하는 Method
     * @param {number} roughness - 새로운 거칠기 값
     */
    updateMaterialRoughness(roughness = this.roughness) {
        if (this.material) {
            this.material.roughness = roughness;
        } else {
            console.warn("Material is not initialized. Call initMaterial() first.");
        }
    }

    /**
     * Material의 금속성을 update하는 Method
     * @param {number} metalness - 새로운 금속성 값
     */
    updateMaterialMetalness(metalness = this.metalness) {
        if (this.material) {
            this.material.metalness = metalness;
        } else {
            console.warn("Material is not initialized. Call initMaterial() first.");
        }
    }

    /**
     * Mesh를 초기화하는 Method
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     * @protected
     */
    _initMesh(x = this.x, y = this.y, z = this.z) {
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.updateMeshPosition(x, y, z);
    }

    /**
     * Mesh의 위치를 업데이트하는 Method
     * @param {number} x - 새로운 x 좌표
     * @param {number} y - 새로운 y 좌표
     * @param {number} z - 새로운 z 좌표
     */
    updateMeshPosition(x = this.x, y = this.y, z = this.z) {
        if (this.mesh) {
            this.mesh.position.set(x, y, z);
            if (this.rigidBody) {
                this.rigidBody.setTranslation({x,y,z}, true);
            }
        } else {
            console.warn("Mesh is not initialized. Call initMesh() first.");
        }
    }

    /**
     * Shape를 초기화하는 Method
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     * @protected
     */
    _initShape(x = this.x, y = this.y, z = this.z) {
        this._initGeometry();
        this._initMaterial();
        this._initMesh(x, y, z);
        this._renderShape();
    }

    /**
     * Shape를 Scene에 추가하는 Method
     * @protected
     */
    _renderShape() {
        if (this.mesh) {
            this.scene.add(this.mesh);
        } else {
            console.warn("Mesh is not initialized. Call initShape() first.");
        }
    }

    /**
     * Shape를 Scene에서 제거하는 Method
     * @protected
     */
    _unrenderShape() {
        if (this.mesh) {
            this.scene.remove(this.mesh);
        } else {
            console.warn("Mesh is not initialized. Call initShape() first.");
        }
    }

    /**
     * Shape를 해제하는 Method
     * @description Three.js의 메모리 누수를 방지하기 위해 Mesh, Geometry, Material을 해제
     */
    dispose() {
        // Three.js mesh/geometry/material 해제
        if (this.mesh) {
            if (this.scene) this._unrenderShape();
            if (this.mesh.geometry) this.mesh.geometry.dispose();
            if (this.mesh.material) this.mesh.material.dispose();
            this.mesh = undefined;
        }
        if (this.geometry) this.geometry = undefined;
        if (this.material) this.material = undefined;
    }

    /**
     * @returns {number}
     * @description `Cube`의 부피를 계산하는 Method
     * @protected
     */
    _getVolume() {
        return this.volume;
    }
}

/**
 * 렌더링 되지 않는 추상적인 Static Cube Class
 * @abstract
 * @extends AbstractSimpleCube
 * @description 물리적 상호작용이 가능하나 중력의 영향을 받지 않는 단순한 Cube Class
 */
export class AbstractStaticSimpleCube extends AbstractSimpleCube{

    /**
     * @type {RAPIER.World}
     * @default undefined
     * @description `RAPIER.World` 객체
     */
    world = undefined;

    /**
     * @type {RAPIER.RigidBodyDesc}
     * @default undefined
     * @description 강체의 속성을 정의하는 객체
     */
    rigidBodyDesc = undefined

    /**
     * @type {RAPIER.RigidBody}
     * @default undefined
     * @description 강체 객체
     */
    rigidBody = undefined;

    /**
     * @type {RAPIER.ColliderDesc}
     * @default undefined
     * @description Collider의 속성을 정의하는 객체
     */
    colliderDesc = undefined;

    /**
     * @type {RAPIER.Collider}
     * @default undefined
     * @description Collider 객체
     */
    collider = undefined;

    /**
     * @type {number}
     * @default 0.2
     * @description 마찰 계수
    */
    friction = 0.2

    /**
     * @type {number}
     * @default 0.0
     * @description 반발 계수
     */
    restitution = 0.0

    /**
     * @type {number}
     * @default 1.0
     * @description 밀도
     */
    density = 1.0

    constructor(
        scene,
        world,
        width = 1,
        height = 1,
        depth = 1,
        color = 0x888888,
        x = 0,
        y = 0,
        z = 0,
        friction = 0.2,
        restitution = 0.0,
        density = 1.0,
        roughness = 0.5,
        metalness = 0.1,
        widthSegments = 1,
        heightSegments = 1,
        depthSegments = 1
    ) {
        if (new.target === AbstractStaticSimpleCube) {
            throw new TypeError("Cannot instantiate AbstractStaticSimpleCube directly");
        }
        super(
            scene,
            width,
            height,
            depth,
            color,
            x,
            y,
            z,
            roughness,
            metalness,
            widthSegments,
            heightSegments,
            depthSegments
        );

        this.world = world;

        this.friction = friction;
        this.restitution = restitution;
        this.density = density;

    }

    /**
     * 강체의 속성을 Initialize하는 Method
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     * @protected
     */
    _initRigidBodyDescription(x = this.x, y = this.y, z = this.z) {
        this.rigidBodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(x, y, z);
    }

    /**
     * 강체를 초기화하는 Method
     * @protected
     */
    _initRigidBody() {
        this.rigidBody = this.world.createRigidBody(this.rigidBodyDesc);
    }

    /**
     * Collider의 속성을 초기화하는 Method
     * @protected
     */
    _initColliderDescription(friction = this.friction, restitution = this.restitution, density = this.density) {
        this.colliderDesc = RAPIER.ColliderDesc.cuboid(
            this.width / 2,
            this.height / 2,
            this.depth / 2
        );
        this.colliderDesc.setFriction(friction);
        this.colliderDesc.setRestitution(restitution);
        this.colliderDesc.setDensity(density);
    }

    /**
     * Collider를 초기화하는 Method
     * @protected
     */
    _initCollider() {
        this.collider = this.world.createCollider(this.colliderDesc, this.rigidBody);
    }

    /**
     * 플랫폼을 초기화하는 Method
     * @param {number} x - 플랫폼의 x 좌표
     * @param {number} y - 플랫폼의 y 좌표
     * @param {number} z - 플랫폼의 z 좌표
     * @protected
     */
    _initBlock(x = this.x, y = this.y, z = this.z) {
        this._initShape(x, y, z);
        this._initRigidBodyDescription(x, y, z);
        this._initRigidBody();
        this._initColliderDescription();
        this._initCollider();

    }

    /**
     * RigidBody의 위치와 Mesh의 위치를 동기화하는 Method
     * @protected
     * @description RigidBody의 위치를 Mesh의 위치로 업데이트합니다.
     *              이 Method는 매 프레임마다 호출되어야 합니다.
     *              예를 들어, 애니메이션 루프나 업데이트 함수에서 호출할 수 있습니다.
     * @example
     * function animate() {
     *     requestAnimationFrame(animate);
     *     cube.syncMeshWithPhysics();
     *     renderer.render(scene, camera);
     * }
     */
    syncMeshWithPhysics() {
        if (this.rigidBody && this.mesh) {
            const pos = this.rigidBody.translation();
            this.updateMeshPosition(pos.x, pos.y, pos.z);
        } else {
            console.warn("RigidBody or Mesh is not initialized. Call initPlatform() first.");
        }
    }

    dispose() {
        super.dispose();

        if (this.world && this.rigidBody) {
            this.world.removeRigidBody(this.rigidBody);
            this.rigidBody = undefined;
        }

        if (this.world && this.collider) {
            this.world.removeCollider(this.collider);
            this.collider = undefined;
        }

        this.rigidBodyDesc = undefined;
        this.colliderDesc = undefined;
    }
}

/**
 * 렌더링 되지 않는 추상적인 물리적 Cube Class
 */
export class AbstractPhysicalSimpleCube extends AbstractStaticSimpleCube{
    _initRigidBodyDescription(x = this.x, y = this.y, z = this.z) {
        // 중력의 영향을 받는 강체로 설정
        this.rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(x, y, z);
    }
}

/**
 * 물리적인 상호작용이 불가능한 단순한 Cube Class
 * @extends AbstractSimpleCube
 */
export class SimpleCube extends AbstractSimpleCube {
    /**
     * Cube Graphic Class
     * @param {THREE.Scene} scene 
     * @param {number} width 
     * @param {number} height 
     * @param {number} depth 
     * @param {number} color 
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     * @param {number} roughness 
     * @param {number} metalness 
     * @param {number} widthSegments 
     * @param {number} heightSegments 
     * @param {number} depthSegments 
     */
    constructor(scene,
        width = 1,
        height = 1,
        depth = 1,
        color = 0x888888,
        x = 0,
        y = 0,
        z = 0,
        roughness = 0.5,
        metalness = 0.1,
        widthSegments = 1,
        heightSegments = 1,
        depthSegments = 1,) {
        super(
            scene,
            width,
            height,
            depth,
            color,
            x,
            y,
            z,
            roughness,
            metalness,
            widthSegments,
            heightSegments,
            depthSegments
        );
        this._initShape();
    }
}

/**
 * 물리적인 상호작용은 가능하나 중력의 영향을 받지 않는 단순한 Cube Class
 * @extends AbstractStaticSimpleCube
 */
export class StaticSimpleCube extends AbstractStaticSimpleCube{
    constructor(scene,
        world,
        width = 1,
        height = 1,
        depth = 1,
        color = 0x888888,
        x = 0,
        y = 0,
        z = 0,
        friction = 0.2,
        restitution = 0.0,
        density = 1.0,
        roughness = 0.5,
        metalness = 0.1,
        widthSegments = 1,
        heightSegments = 1,
        depthSegments = 1) {
        super(
            scene,
            world,
            width,
            height,
            depth,
            color,
            x,
            y,
            z,
            friction,
            restitution,
            density,
            roughness,
            metalness,
            widthSegments,
            heightSegments,
            depthSegments
        );
        this._initBlock();
    }
}

export class PhysicalSimpleCube extends AbstractPhysicalSimpleCube{
    constructor(scene,
        world,
        width = 1,
        height = 1,
        depth = 1,
        color = 0x888888,
        x = 0,
        y = 0,
        z = 0,
        friction = 0.2,
        restitution = 0.0,
        density = 1.0,
        roughness = 0.5,
        metalness = 0.1,
        widthSegments = 1,
        heightSegments = 1,
        depthSegments = 1
    ) {
        super(
            scene,
            world,
            width,
            height,
            depth,
            color,
            x,
            y,
            z,
            friction,
            restitution,
            density,
            roughness,
            metalness,
            widthSegments,
            heightSegments,
            depthSegments
        );
        this._initBlock();
    }
}

