
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { WebGL } from 'three/examples/jsm/Addons.js';
import initSky from './initSky.js';
import jetControllers from './jetControllers.js';

import createMountain from './createMountain.js';
import initClouds from './initClouds.js';
import {BoxGeometry, InstancedMesh, MeshPhongMaterial, Object3D, Vector3} from "three";
//TODO: Dodanie innych rodzaji budynków
//TODO: zatrzymanie gry po kolizji
//TODO: przyśpieszanie lotu
//TODO: Pokazywanie postępu gry
//TODO: Zatrzymanie skrecania samolotu
//TODO: Wyodręgnienie możliwego kodu do osobnych plików
//TODO: Zmiana nazw z gór na darpacze chmur

if (WebGL.isWebGLAvailable()) {
  console.log('dostepny!');
} else {
  const warning = WebGL.getWebGLErrorMessage();
  document.getElementById('container').appendChild(warning);
}
let jet, mountainModel, sky, sun, mixer, jetBoxHelper,buildMesh;

const SHOW_BOUNDING_BOX = true; // do developingu

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;
camera.position.y = 1;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const loader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();

const light = new THREE.DirectionalLight(0xffffff, 10.0);
light.position.set(3.14, 1, 1);
scene.add(light);

scene.add(new THREE.AmbientLight(0xeef0ff, 0.2));

// Załaduj teksturę chmury
const cloudTexture = textureLoader.load('src/models/cloudd.png');
cloudTexture.colorSpace = THREE.SRGBColorSpace;
cloudTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
cloudTexture.wrapS = cloudTexture.wrapT = THREE.RepeatWrapping;

function createBuildings(scene) {
  const buildGeometry = new BoxGeometry(1, 1, 1);
  const buildMaterial = new MeshPhongMaterial({ color: 0x888888 });
  buildMesh = new InstancedMesh(buildGeometry, buildMaterial, 4000);
  scene.add(buildMesh);

  const dummy = new Object3D();
  const center = new Vector3();

  for (let i = 0; i < buildMesh.count; i++) {
    const scaleY = Math.random() * 7 + 0.5;

    dummy.position.x = Math.random() * 600 - 300;
    dummy.position.z = Math.random() * 600 - 300;
    const distance = Math.max(dummy.position.distanceTo(center) * 0.012, 1);

    dummy.position.y = 0.5 * scaleY;

    dummy.scale.x = dummy.scale.z = Math.random() * 3 + 0.5;
    dummy.scale.y = scaleY;

    dummy.updateMatrix();

    buildMesh.setMatrixAt(i, dummy.matrix);
    buildMesh.position.y = -8;
  }
}

initClouds(scene, cloudTexture);

// Dodaj element HTML do wyświetlania liczby kolizji
const collisionCounterElement = document.createElement('div');
collisionCounterElement.style.position = 'absolute';
collisionCounterElement.style.top = '10px';
collisionCounterElement.style.left = '10px';
collisionCounterElement.style.color = 'white';
collisionCounterElement.style.fontSize = '24px';
collisionCounterElement.innerHTML = 'Kolizje: 0';
document.body.appendChild(collisionCounterElement);

// Inicjalizacja licznika kolizji
let collisionCount = 0;

// Ładowanie modelu samolotu
loader.load('src/models/mig29c.glb', function (gltf) {
  jet = gltf.scene;
  jet.scale.set(0.003, 0.003, 0.003); // Dostosuj skalę modelu do potrzeb sceny
  jet.position.z = 0; // Ustaw początkową pozycję samolotu
  jet.rotation.y = Math.PI;

  jet.boundingBox = new THREE.Box3().setFromObject(jet);

  jetBoxHelper = new THREE.BoxHelper(jet, SHOW_BOUNDING_BOX ? 0xff0000 : 0x00000000); // Transparentny, gdy SHOW_BOUNDING_BOX jest false
  jetBoxHelper.visible = SHOW_BOUNDING_BOX; // Widoczność BoxHelper zależy od SHOW_BOUNDING_BOX

  scene.add(jetBoxHelper);

  if (gltf.animations && gltf.animations.length) {
    mixer = new THREE.AnimationMixer(gltf.scene);
    gltf.animations.forEach((clip) => {
      mixer.clipAction(clip).play();
    });
  } else {
    console.log(gltf);
  }
  scene.add(jet);

  // Ładowanie modelu gór
  loader.load('src/models/tower1glb.glb', function (gltf) {
    mountainModel = gltf.scene;
    mountainModel.scale.set(0.2, 0.5, 0.2);

    initSky(renderer, scene, camera, sky, sun);
    initGame();
  }, undefined, function (error) {
    console.error(error);
  });
}, undefined, function (error) {
  console.error(error);
});

function initGame() {
  // Generowanie gór
  const mountains = [];
  const mountainHelpers = [];

  let targetPosition = new THREE.Vector3();
  let targetQuaternion = new THREE.Quaternion();

  scene.fog = new THREE.FogExp2(0xffffff, 0.01); // Kolor mgły i gęstość

  // Inicjalizacja wartości docelowych
  if (jet) {
    targetPosition.copy(jet.position);
    targetQuaternion.copy(jet.quaternion);
  }

  jetControllers(jet, targetPosition, targetQuaternion);
  const clock = new THREE.Clock();

  createBuildings(scene); // Dodanie budynków do sceny

  // Funkcja sprawdzająca kolizję między dwoma obiektami
  function checkCollision(obj1, obj2) {
    obj1.boundingBox.setFromObject(obj1);
    obj2.boundingBox.setFromObject(obj2);
    return obj1.boundingBox.intersectsBox(obj2.boundingBox);
  }

  // Animacja
  const animate = () => {
    requestAnimationFrame(animate);
    if (jet) {
      // Płynna zmiana pozycji
      jet.position.lerp(targetPosition, 0.1);

      // Płynna zmiana rotacji
      jet.quaternion.slerpQuaternions(jet.quaternion, targetQuaternion, 0.1);
      const delta = clock.getDelta();

      if (mixer) {
        mixer.update(delta);
      }

      // Aktualizacja BoxHelper dla samolotu
      jetBoxHelper.update();

      // Sprawdzenie kolizji samolotu z każdą górą
      mountains.forEach((mountain, index) => {
        if (checkCollision(jet, mountain)) {
          console.log('Kolizja z górą!');
          // Aktualizacja licznika kolizji
          collisionCount++;
          collisionCounterElement.innerHTML = 'Kolizje: ' + collisionCount;
          // Tu można dodać obsługę zdarzenia kolizji (np. zakończenie gry, resetowanie pozycji, itp.)
        }
        // Aktualizacja BoxHelper dla każdej góry
        mountainHelpers[index].update();
      });
    }

    // Przesuwanie gór
    mountains.forEach((mountain, index) => {
      mountain.position.z += 0.2;
      if (mountain.position.z > 10) {
        scene.remove(mountain);
        scene.remove(mountainHelpers[index]);
        mountains.splice(index, 1);
        mountainHelpers.splice(index, 1);
      }
    });

    cloudTexture.offset.y += 0.01;

    if (buildMesh) {
      const speed = 0.2; // Prędkość przesuwania budynków
      const buildingsDummy = new THREE.Object3D();
      for (let i = 0; i < buildMesh.count; i++) {
        buildMesh.getMatrixAt(i, buildingsDummy.matrix);
        buildingsDummy.matrix.decompose(buildingsDummy.position, buildingsDummy.quaternion, buildingsDummy.scale);
        buildingsDummy.position.z += speed;
        if (buildingsDummy.position.z > 300) {
          buildingsDummy.position.z = -300; // Ponowne pojawienie się budynku po przekroczeniu ekranu
        }
        buildingsDummy.updateMatrix();
        buildMesh.setMatrixAt(i, buildingsDummy.matrix);
      }
      buildMesh.instanceMatrix.needsUpdate = true;
    }

    if (Math.random() < 0.008) {
      const newMountain = createMountain(mountainModel, scene);
      newMountain.boundingBox = new THREE.Box3().setFromObject(newMountain);
      let newMountainHelper;
      newMountainHelper = new THREE.BoxHelper(newMountain, SHOW_BOUNDING_BOX ? 0x00ff00 : 0x00000000); // Transparentny, gdy SHOW_BOUNDING_BOX jest false
      newMountainHelper.visible = SHOW_BOUNDING_BOX; // Widoczność BoxHelper zależy od SHOW_BOUNDING_BOX
      scene.add(newMountainHelper);
      mountains.push(newMountain);
      mountainHelpers.push(newMountainHelper);
    }

    renderer.render(scene, camera);
  };

  animate();
}
