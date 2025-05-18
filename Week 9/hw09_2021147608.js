import * as THREE from 'three';  
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { initStats, initRenderer, initCamera, initOrbitControls} from './util.js';

const scene = new THREE.Scene();

const renderer = initRenderer();
let camera = initCamera();
const stats = initStats();
let orbitControls = initOrbitControls(camera, renderer);


window.addEventListener('resize', onResize, false);
function onResize() { // resize handler
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// default cubbe, sphere, plane: see util.js
const sun = new THREE.SphereGeometry(10, 32, 32);
const sunMaterial = new THREE.MeshLambertMaterial({
  color: 0xffff00
});
const sunmesh = new THREE.Mesh(sun, sunMaterial);
sunmesh.position.x = 0;
sunmesh.position.y = 0;
sunmesh.position.z = 0;
sunmesh.castShadow = true;
scene.add(sunmesh);

const textureLoader = new THREE.TextureLoader();

const mercury = new THREE.SphereGeometry(1.5, 32, 32);
const mercuryTexture = textureLoader.load('Mercury.jpg');
const mercuryMaterial = new THREE.MeshStandardMaterial({
  map: mercuryTexture,
  roughness: 0.8,
  metalness: 0.2,
  color: 0xa6a6a6
});
const mercurymesh = new THREE.Mesh(mercury, mercuryMaterial);
mercurymesh.position.x = 20;
mercurymesh.position.y = 0;
mercurymesh.position.z = 0;
scene.add(mercurymesh);

const venus = new THREE.SphereGeometry(3, 32, 32);
const venusTexture = textureLoader.load('Venus.jpg');
const venusMaterial = new THREE.MeshStandardMaterial({
  map: venusTexture,
  roughness: 0.8,
  metalness: 0.2,
  color: 0xe39e1c
});
const venusmesh = new THREE.Mesh(venus, venusMaterial);
venusmesh.position.x = 35;
venusmesh.position.y = 0;
venusmesh.position.z = 0;
scene.add(venusmesh);


const earth = new THREE.SphereGeometry(3.5, 32, 32);
const earthTexture = textureLoader.load('Earth.jpg');
const earthMaterial = new THREE.MeshStandardMaterial({
  map: earthTexture,
  roughness: 0.8,
  metalness: 0.2,
  color: 0x3498db
});
const earthmesh = new THREE.Mesh(earth, earthMaterial);
earthmesh.position.x = 50;
earthmesh.position.y = 0;
earthmesh.position.z = 0;
scene.add(earthmesh);

const mars = new THREE.SphereGeometry(2.5, 32, 32);
const marsTexture = textureLoader.load('Mars.jpg');
const marsMaterial = new THREE.MeshStandardMaterial({
  map: marsTexture,
  roughness: 0.8,
  metalness: 0.2,
  color: 0xc0392b
});
const marsmesh = new THREE.Mesh(mars, marsMaterial);
marsmesh.position.x = 65;
marsmesh.position.y = 0;
marsmesh.position.z = 0;
scene.add(marsmesh);

const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.0);
scene.add(ambientLight);


const gui = new GUI();
const folder1 = gui.addFolder('Camera');
const controls = new function () {
    this.perspective = "Perspective";
    this.switchCamera = function () {
        if (camera instanceof THREE.PerspectiveCamera) {
            scene.remove(camera);
            camera = null; // 기존의 camera 제거    
            camera = new THREE.OrthographicCamera(window.innerWidth / -16, 
                window.innerWidth / 16, window.innerHeight / 16, window.innerHeight / -16, -200, 500);
            camera.position.x = 120;
            camera.position.y = 60;
            camera.position.z = 180;
            camera.lookAt(scene.position);
            orbitControls.dispose(); // 기존의 orbitControls 제거
            orbitControls = null;
            orbitControls = new OrbitControls(camera, renderer.domElement);
            orbitControls.enableDamping = true;
            this.perspective = "Orthographic";
        } else {
            scene.remove(camera);
            camera = null; 
            camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.x = 120;
            camera.position.y = 60;
            camera.position.z = 180;
            camera.lookAt(scene.position);
            orbitControls.dispose();
            orbitControls = null;
            orbitControls = new OrbitControls(camera, renderer.domElement);
            orbitControls.enableDamping = true;
            this.perspective = "Perspective";
        }
    };
};

folder1.add(controls, 'switchCamera').name("Switch Camera Type");
folder1.add(controls, 'perspective').name("Camera Type").listen();

const mercuryfolder = gui.addFolder('Mercury');
const mercuryParam = {
    rotationSpeed: 0.02,
    orbitSpeed: 0.02
};
mercuryfolder.add(mercuryParam, 'rotationSpeed', 0, 0.1).name("Rotation Speed");
mercuryfolder.add(mercuryParam, 'orbitSpeed', 0, 0.1).name("Orbit Speed");

const venusfolder = gui.addFolder('Venus');
const venusparam = {
    rotationSpeed: 0.015,
    orbitSpeed: 0.015
};
venusfolder.add(venusparam, 'rotationSpeed', 0, 0.1).name("Rotation Speed");
venusfolder.add(venusparam, 'orbitSpeed', 0, 0.1).name("Orbit Speed");

const earthfolder = gui.addFolder('Earth');
const earthparam = {
    rotationSpeed: 0.01,
    orbitSpeed: 0.01
};
earthfolder.add(earthparam, 'rotationSpeed', 0, 0.1).name("Rotation Speed");
earthfolder.add(earthparam, 'orbitSpeed', 0, 0.1).name("Orbit Speed");

const marsfolder = gui.addFolder('Mars');
const marsparam = {
    rotationSpeed: 0.008,
    orbitSpeed: 0.008
};
marsfolder.add(marsparam, 'rotationSpeed', 0, 0.1).name("Rotation Speed");
marsfolder.add(marsparam, 'orbitSpeed', 0, 0.1).name("Orbit Speed");



let mercury_step = 0;
let venus_step = 0;
let earth_step = 0;
let mars_step = 0;

render();


function render() {
  stats.update();
  orbitControls.update();

  scene.traverse(function (e) {
    if (e instanceof THREE.Mesh && e == mercurymesh) {
      e.rotation.x += mercuryParam.rotationSpeed;
      e.rotation.y += mercuryParam.rotationSpeed;
      e.rotation.z += mercuryParam.rotationSpeed;

      mercury_step += mercuryParam.orbitSpeed;
      e.position.x = 20*Math.cos(mercury_step);
      e.position.y = 20*Math.sin(mercury_step);

    }
    else if (e instanceof THREE.Mesh && e == venusmesh) {
      e.rotation.x += venusparam.rotationSpeed;
      e.rotation.y += venusparam.rotationSpeed;
      e.rotation.z += venusparam.rotationSpeed;

      venus_step += venusparam.orbitSpeed;
      e.position.x = 35*Math.cos(venus_step);
      e.position.y = 35*Math.sin(venus_step);

    }
    else if (e instanceof THREE.Mesh && e == earthmesh) {
      e.rotation.x += earthparam.rotationSpeed;
      e.rotation.y += earthparam.rotationSpeed;
      e.rotation.z += earthparam.rotationSpeed;

      earth_step += earthparam.orbitSpeed;
      e.position.x = 50*Math.cos(earth_step);
      e.position.y = 50*Math.sin(earth_step);

    }
    else if (e instanceof THREE.Mesh && e == marsmesh) {
      e.rotation.x += marsparam.rotationSpeed;
      e.rotation.y += marsparam.rotationSpeed;
      e.rotation.z += marsparam.rotationSpeed;

      mars_step += mercuryParam.orbitSpeed;
      e.position.x = 65*Math.cos(mars_step);
      e.position.y = 65*Math.sin(mars_step);
    }
  });



  // render using requestAnimationFrame
  requestAnimationFrame(render);
  renderer.render(scene, camera);
}
