import * as THREE from 'three';
import * as RAPIER from "@dimforge/rapier3d-compat";

import { SimpleCube, StaticSimpleCube, PhysicalSimpleCube } from './objects/blocks/cube.js';

import * as sceneHandler from './handlers/sceneHandler.js';
import * as cameraHandler from './handlers/cameraHandler.js';
import * as rendererHandler from './handlers/rendererHandler.js';
import * as worldHandler from './handlers/worldHandler.js';

import * as WindowController from './controllers/windowController.js';

// 각 레벨 별 초기화
// import * as levelController from './levels/level1.js';
import * as title from './levels/title.js';
import * as level1 from './levels/level1.js';
import * as level2 from './levels/level2.js';
import * as level3 from './levels/level3.js';
import * as level4 from './levels/level4.js';
import * as level5 from './levels/level5.js';
import * as ending from './levels/ending.js';

const teleportSoundSet = new Audio('./sounds/Blop.mp3');
const teleportSoundJump = new Audio('./sounds/Blop.mp3');
const gameOverSound = new Audio('./sounds/Collision.mp3');
gameOverSound.volume = 0.3; // 소리 좀 줄임
const jumpSound = new Audio('./sounds/Jump.mp3');
const clearSound = new Audio('./sounds/Clear.mp3');

let currentLevel = 0; // 바꾸면서 레벨 테스트 가능, 타이틀은 0, 현재 엔딩 레벨 = 6
let isLevelClear = false; // 레벨 1 -> 3 처럼 한번에 넘어감 방지
let endBlock = null;
let startPos = null;

// 플레이어 관련 전역 변수
let player;
let playerBody;
let playercollider;

let gameMenu = true;

// 게임 오버 판정
let isGameOver = false;
let gameOverTriggered = false; // (게임 오버를 한 번만 실행했는지 여부)
let obstacleBlocks = [];
let posy;

// Three.js 초기화
const scene = sceneHandler.initScene();
const camera = cameraHandler.initCamera();
const renderer = rendererHandler.initRenderer();

// Rapier 초기화
const world = await worldHandler.initWorld();


// 윈도우 크기 자동 조정
WindowController.autoResizeWindow(renderer, camera);

const ambientLight = new THREE.AmbientLight(0xffffff, 1); // 부드러운 조명
scene.add(ambientLight);

// 순간이동 정보 초기화
const clock = new THREE.Clock();

const keys = {};
let teleportTarget = null;       // 순간이동 위치
let teleportMarker = null;       // 시각적 표시 구

let cooltimeBar;
let cooltimeText;

let lastTeleportTime = -Infinity;
const TELEPORT_COOLTIME = 0.5; // 텔포 쿨타임

function createTeleportMarker(position) {
    const geometry = new THREE.SphereGeometry(0.3, 32, 32);
    const material = new THREE.MeshStandardMaterial({ color: 0x000000, transparent: true, opacity: 0.8 });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.copy(position);
    scene.add(sphere);
    return sphere;
}

// 현재(다음) 레벨 로드
function loadLevel(levelNum) {
    const overlay = document.getElementById('game-cleared-overlay');
    if (overlay) {
        overlay.style.opacity = 0;
    }

    // 기존 레벨 제거
    if (currentLevel === 0) {
        title.disposeLevel(scene, world);
    } else if (currentLevel === 1) {
        level1.disposeLevel(scene, world);
    } else if (currentLevel === 2) {
        level2.disposeLevel(scene, world);
    } else if (currentLevel === 3) {
        level3.disposeLevel(scene, world);
    } else if (currentLevel === 4) {
        level4.disposeLevel(scene, world);
    } else if (currentLevel === 5) {
        level5.disposeLevel(scene, world);
    } else if (currentLevel === 6) {
        ending.disposeLevel(scene, world);
    }

    // 다음 레벨 불러오기
    currentLevel = levelNum;

    // 레벨 별 초기 세팅
    if (levelNum === 0) {
        title.initLevel(scene, world);

    } else if (levelNum === 1) {
        level1.initLevel(scene, world);
        endBlock = level1.getEndBlock();
        startPos = level1.getStartPos();
        obstacleBlocks = []; // 장애물 정보, 1렙은 장애물 없다고 생각

    } else if (levelNum === 2) {
        level2.initLevel(scene, world);
        endBlock = level2.getEndBlock();
        startPos = level2.getStartPos();
        obstacleBlocks = level2.getObstacleBlocks(); // 장애물 정보

    } else if (levelNum === 3) {
        level3.initLevel(scene, world);
        endBlock = level3.getEndBlock();
        startPos = level3.getStartPos();
        obstacleBlocks = level3.getObstacleBlocks(); // 장애물 정보

    } else if (levelNum === 4) {
        level4.initLevel(scene, world);
        endBlock = level4.getEndBlock();
        startPos = level4.getStartPos();
        obstacleBlocks = level4.getObstacleBlocks(); // 장애물 정보

    } else if (levelNum === 5) {
        level5.initLevel(scene, world);
        endBlock = level5.getEndBlock();
        startPos = level5.getStartPos();
        obstacleBlocks = level5.getObstacleBlocks(); // 장애물 정보

    } else if (levelNum === 6) {
        ending.initLevel(scene, world);
    }




    // title, ending에서는 플레이어 생성 안함
    if (currentLevel !== 0 && currentLevel !== 6) {
        // 플레이어가 없으면 생성, 있으면 위치 초기화, 
        if (!player) {
            const playerGeometry = new THREE.BoxGeometry(1, 1, 1);
            const playerMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
            player = new THREE.Mesh(playerGeometry, playerMaterial);
            scene.add(player);

            // Rapier 플레이어 바디 생성
            const playerBodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(...startPos);
            playerBody = world.createRigidBody(playerBodyDesc);
            const playerColliderDesc = RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5);
            playercollider = world.createCollider(playerColliderDesc, playerBody);
        }

    // 한 프레임 뒤에 플레이어 상태 초기화 (재시작 후 바닥 뚫음 방지)
        setTimeout(() => {
            player.position.set(...startPos);
            playerBody.setTranslation({ x: startPos[0], y: startPos[1], z: startPos[2] }, true);
            playerBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
        }, 0);
    }
    

    // 레벨 클리어 플래그 초기화
    isLevelClear = false;
}

/*
// 레벨 생성
level1.initLevel(scene, world);
let endBlock = level1.getEndBlock();
let startBlock = level1.getStartBlock();
let startPos = level1.getStartPos();
// 플랫폼 생성
// const floor = new StaticSimpleCube(scene, world, 20, 1, 20, 0x888888, 0, 0.5, 0);
// const wall1 = new StaticSimpleCube(scene, world, 20, 10, 1, 0x888888, 0, 5, -10);
// const wall2 = new StaticSimpleCube(scene, world, 20, 10, 1, 0x888888, 0, 5, 10);
// const wall3 = new StaticSimpleCube(scene, world, 1, 10, 20, 0x888888, -10, 5, 0);
// const wall4 = new StaticSimpleCube(scene, world, 1, 10, 20, 0x888888, 10, 5, 0);

//const box = new PhysicalSimpleCube(scene, world, 1, 1, 1, 0x00ff00, 3, 3, 3);
*/

/*
// 캐릭터(큐브) 생성
const playerGeometry = new THREE.BoxGeometry(1, 1, 1);
const playerMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const player = new THREE.Mesh(playerGeometry, playerMaterial);
player.position.x = startPos[0];
player.position.y = startPos[1];
player.position.z = startPos[2];
scene.add(player);
*/

/*
// Rapier 플레이어 바디
const playerBodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(player.position.x, player.position.y, player.position.z);
const playerBody = world.createRigidBody(playerBodyDesc);
const playerColliderDesc = RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5);
let playercollider = world.createCollider(playerColliderDesc, playerBody);
*/

// 조명 추가
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7.5);
scene.add(light);

// 입력 처리 (e 키는 텔레포트)
window.addEventListener('keydown', e => {
    if (isGameOver && e.code !== 'KeyR') return; // 게임 오버 시 'R' 외 모든 키 무시

    if (e.code === 'Enter' && currentLevel === 0) {
        loadLevel(1);
    }

    if (!keys[e.code]) {
        keys[e.code] = true;

        if (e.code === 'KeyE') {
            const now = clock.getElapsedTime();
            if (now - lastTeleportTime < TELEPORT_COOLTIME) return;
            lastTeleportTime = now;

            const pos = playerBody.translation();

            if (teleportTarget === null) {
                // 순간이동 대상 위치 저장 + 구 표시
                teleportTarget = { x: pos.x, y: pos.y, z: pos.z };
                teleportMarker = createTeleportMarker(new THREE.Vector3(pos.x, pos.y, pos.z));
                
                teleportSoundSet.currentTime = 0;
                teleportSoundSet.play();
            } else {
                // 순간이동 실행
                const velocity = playerBody.linvel();

                playerBody.setTranslation(teleportTarget, true);

                playerBody.setLinvel(velocity, true);

                teleportSoundJump.currentTime = 0;
                teleportSoundJump.play();

                // 구 제거 및 상태 초기화
                if (teleportMarker) {
                    scene.remove(teleportMarker);
                    teleportMarker.geometry.dispose();
                    teleportMarker.material.dispose();
                    teleportMarker = null;
                }
                teleportTarget = null;
            }
        }

    if (e.code === 'KeyR') {
        // 게임 오버 화면 숨기기
        const overlay = document.getElementById('game-over-overlay');
        if (overlay) {
            overlay.style.opacity = 0;
        }

        // 게임 오버 상태 초기화
        isGameOver = false;
        gameOverTriggered = false;

        // 순간이동 상태 초기화
        teleportTarget = null;

        if (teleportMarker) {
            scene.remove(teleportMarker);
            teleportMarker.geometry.dispose();
            teleportMarker.material.dispose();
            teleportMarker = null;
        }

        // 쿨타임 UI 초기화
        if (cooltimeBar) {
            cooltimeBar.style.width = '100%';
            cooltimeBar.style.backgroundColor = 'blue';
        }

        if (cooltimeText) {
            cooltimeText.textContent = 'READY';
        }

        // 엔딩에서 R 누르면 타이틀로
        if (currentLevel === 6) {
            loadLevel(0);
        }

        // 현재 레벨 다시 로딩
        loadLevel(currentLevel);
    }
/*
    if (e.code === 'KeyP' && (currentLevel == 6 || gameMenu == true)) {
        // 게임 오버 화면 숨기기
        const overlay = document.getElementById('game-over-overlay');
        if (overlay) {
            overlay.style.opacity = 0;
        }
        const cleared = document.getElementById('game-cleared-overlay');
        if (cleared) {
            cleared.style.opacity = 0;
        }
        const menu = document.getElementById('game-menu-overlay');
        if (menu) {
            menu.style.opacity = 0;
        }

        currentLevel = 1;
        // 게임 오버 상태 초기화
        isGameOver = false;
        gameOverTriggered = false;

        // 순간이동 상태 초기화
        teleportTarget = null;

        if (teleportMarker) {
            scene.remove(teleportMarker);
            teleportMarker.geometry.dispose();
            teleportMarker.material.dispose();
            teleportMarker = null;
        }

        // 쿨타임 UI 초기화
        if (cooltimeBar) {
            cooltimeBar.style.width = '100%';
            cooltimeBar.style.backgroundColor = 'blue';
        }

        if (cooltimeText) {
            cooltimeText.textContent = 'READY';
        }

        // 현재 레벨 다시 로딩
        loadLevel(currentLevel);
        }
        */

    }
});

window.addEventListener('keyup', e => {
    keys[e.code] = false;
});


function handleInput() {
    if (isGameOver || !playerBody) return; // 타이틀 or 게임 오버 상태면 입력 무시

    const speed = 6; // 최대 목표 속도
    const accel = 20; // 가속도
    let moveX = 0, moveZ = 0;

    if (keys['KeyW']) moveZ += 1;
    if (keys['KeyS']) moveZ -= 1;
    if (keys['KeyA']) moveX += 1;
    if (keys['KeyD']) moveX -= 1;

    // yaw에 따라 이동 방향 회전 (부호 반전)
    const sin = Math.sin(yaw);
    const cos = Math.cos(yaw);
    const dirX = (moveX * cos + moveZ * sin)
    const dirZ = (moveZ * cos - moveX * sin)

    // 현재 속도
    const vel = playerBody.linvel();

    // 목표 속도
    const targetX = dirX * speed;
    const targetZ = dirZ * speed;

    // 속도 조정 (linear interpolation)
    const newVelX = vel.x + (targetX - vel.x) / accel;
    const newVelZ = vel.z + (targetZ - vel.z) / accel;

    playerBody.setLinvel({ x: newVelX, y: vel.y, z: newVelZ }, true);

    // 점프 (스페이스바)
    if (keys['Space']) {
        const vel = playerBody.linvel();


        if (Math.abs(vel.y) < 0.05 && posy <= 1.5) {
            playerBody.applyImpulse({ x: 0, y: 8, z: 0 }, true);
            jumpSound.currentTime = 0;
            jumpSound.play();
        }
    }

    // 수평 이동 - 너무 빨리 움직여서 지움
    // playerBody.applyImpulse({ x: impulseX, y: 0, z: impulseZ }, true);
}

// 카메라 위치
camera.position.set(0, 5, 10);
camera.lookAt(0, 1, 0);

// 시점 회전 변수
let yaw = 0;    // 좌우 회전 (Y축)
let pitch = 0;  // 상하 회전 (X축)

// Pointer Lock 활성화
renderer.domElement.addEventListener('click', () => {
    renderer.domElement.requestPointerLock();
});

// 마우스 움직임 처리
document.addEventListener('mousemove', (event) => {
    if (document.pointerLockElement === renderer.domElement) {
        const sensitivity = 0.002;
        yaw   -= event.movementX * sensitivity;
        pitch -= event.movementY * sensitivity;
        // pitch 제한 (상하 90도)
        pitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, pitch));
    }
});

// 애니메이션 루프
function animate() {
    requestAnimationFrame(animate);

    //box.syncMeshWithPhysics();

    if (player) {
        posy = player.position.y;
    }
    

    if (currentLevel === 3) {
        level3.runLoop();
    } else if (currentLevel === 4) {
        level4.runLoop();
    } else if (currentLevel === 5) {
        level5.runLoop();
    }

    if (player && playerBody) {
        // Rapier 위치를 Three.js에 반영
        const pos = playerBody.translation();
        player.position.set(pos.x, pos.y, pos.z);

        // 1인칭 카메라 위치 및 방향 계산
        const cameraOffsetY = 0.5;
        camera.position.set(pos.x, pos.y + cameraOffsetY, pos.z);

        // 방향 벡터 계산 (yaw, pitch 적용)
        const dir = new THREE.Vector3(
            Math.sin(yaw) * Math.cos(pitch),
            Math.sin(pitch),
            Math.cos(yaw) * Math.cos(pitch)
        );
        camera.lookAt(
            pos.x + dir.x,
            pos.y + cameraOffsetY + dir.y,
            pos.z + dir.z
        );
    }
    
    
    // 쿨타임 바 UI
    if (cooltimeBar && cooltimeText) {
    const now = clock.getElapsedTime();
    const elapsed = now - lastTeleportTime;
    const ratio = Math.min(elapsed / TELEPORT_COOLTIME, 1.0);

    // 쿨타임 바 움직임
    cooltimeBar.style.width = `${ratio * 100}%`;

    cooltimeText.textContent = (ratio < 1.0)
        ? `Cooling... ${(TELEPORT_COOLTIME - elapsed).toFixed(1)}s`
        : 'READY';
    }

    // 쿨타임 바 색상: 텔포 위치 저장 여부 따라 나눔
    if (teleportTarget === null) {
        cooltimeBar.style.backgroundColor = 'blue';  // 키를 누르면 텔포 위치 저장
    } else {
        cooltimeBar.style.backgroundColor = 'red';   // 키를 누르면 텔포
    }


    // Player과 endBlock collision detection
    if (endBlock && endBlock.collider && !isLevelClear) {
        world.intersectionPairsWith(endBlock.collider, (collider2) => {
            if (collider2 == playercollider) {
                console.log("LEVEL CLEAR!");

                // 효과음
                clearSound.currentTime = 0;
                clearSound.play();

                isLevelClear = true; // 한 번만 트리거
                
                // 다음 레벨 로딩
                setTimeout(() => {
                    loadLevel(currentLevel + 1);
                }, 50);
            }
        });
    }

    // 게임오버 시 화면 표시
    if (obstacleBlocks.length > 0 && !isGameOver) {
        for (const block of obstacleBlocks) {
            if (block.collider) {
                world.intersectionPairsWith(block.collider, (collider2) => {
                    if (collider2 === playercollider) {
                        isGameOver = true; // 게임 오버 상태로 전환
                    }
                });
            }
        }
    }
    triggerGameOver();

    handleInput();
    world.step();

    renderer.render(scene, camera);
}

async function startGame() {
  cooltimeBar = document.getElementById('cooldown-bar');
  cooltimeText = document.getElementById('cooldown-text');

  // const world = await worldHandler.initWorld();
  loadLevel(currentLevel);

  animate();
}

function triggerGameOver() {
    if (currentLevel == 6) {
        const cleared = document.getElementById('game-cleared-overlay');
        if (cleared) {
            cleared.style.transition = 'opacity 0.3s ease-in-out';
            cleared.style.opacity = 1;
        }
        return;
    }
    if (!isGameOver || gameOverTriggered) return; // 중복 실행 방지

    gameOverTriggered = true; // 한 번만 실행되게 설정

    // 게임 오버 시 멀리 이동
    player.position.set(9999, 9999, 9999);
    playerBody.setTranslation({ x: 9999, y: 9999, z: 9999 }, true);
    playerBody.setLinvel({ x: 0, y: 0, z: 0 }, true);

    // 효과음
    gameOverSound.currentTime = 0;
    gameOverSound.play();

    // 플레이어 속도 정지 (중복 트리거 방지용)
    playerBody.setLinvel({ x: 0, y: 0, z: 0 }, true);

    // 게임 오버 화면 표시
    const overlay = document.getElementById('game-over-overlay');
    if (overlay) {
        overlay.style.transition = 'opacity 0.3s ease-in-out';
        overlay.style.opacity = 1;
    }
    
    // 텔레포트 상태 초기화
    teleportTarget = null;
    if (teleportMarker) {
        scene.remove(teleportMarker);
        teleportMarker.geometry.dispose();
        teleportMarker.material.dispose();
        teleportMarker = null;
    }
}

startGame();
