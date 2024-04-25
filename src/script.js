import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { WebGL } from "three/examples/jsm/Addons.js";
import initSky from "./initSky.js";
import jetControllers from "./jetControllers.js";

import createMountain from "./createMountain.js";
import initClouds from "./initClouds.js";
var start_time = Date.now();
if ( WebGL.isWebGLAvailable() ) {

console.log('dostepny!')

} else {
  const warning = WebGL.getWebGLErrorMessage();
  document.getElementById('container').appendChild(warning);
}
let jet,position,mountainModel,sky, sun, mixer;

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

scene.add( new THREE.AmbientLight( 0xeef0ff, 0.2) );

// Załaduj teksturę chmury
const cloudTexture = textureLoader.load('src/models/cloudd.png');
cloudTexture.colorSpace = THREE.SRGBColorSpace;
cloudTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
cloudTexture.wrapS = cloudTexture.wrapT = THREE.RepeatWrapping;

initClouds(scene, cloudTexture);

// Ładowanie modelu samolotu
loader.load( 'src/models/mig29c.glb', function ( gltf ) {
  jet = gltf.scene;
  jet.scale.set(0.005, 0.005, 0.005); // Dostosuj skalę modelu do potrzeb sceny
  jet.position.z = 0; // Ustaw początkową pozycję samolotu
   jet.rotation.y = Math.PI
   if (gltf.animations && gltf.animations.length) {
     mixer = new THREE.AnimationMixer(gltf.scene);
     gltf.animations.forEach((clip) => {
       mixer.clipAction(clip).play();
     });
   }else{
     console.log(gltf)
   }
  scene.add(jet);


   // Ładowanie modelu gór
   loader.load('src/models/doublemount.glb', function(gltf) {
     mountainModel = gltf.scene;
     mountainModel.scale.set(1, 1, 1);

         initSky(renderer, scene, camera,sky,sun);
         initGame();

   }, undefined, function(error) {
     console.error(error);
   });

}, undefined, function ( error ) {

  console.error( error );

} );

function initGame() {
  // Generowanie gór
  const mountains = [];

  let targetPosition = new THREE.Vector3();
  let targetQuaternion = new THREE.Quaternion();

  scene.fog = new THREE.FogExp2(0xffffff, 0.01); // Kolor mgły i gęstość

// Inicjalizacja wartości docelowych
  if (jet) {
    targetPosition.copy(jet.position);
    targetQuaternion.copy(jet.quaternion);
  }

  jetControllers(jet,targetPosition,targetQuaternion);
  const clock = new THREE.Clock();

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

    }

    //Przesuwanie gór
    mountains.forEach((mountain, index) => {
      mountain.position.z += 0.2;
      if (mountain.position.z > 10) {
        scene.remove(mountain);
        mountains.splice(index, 1);
      }
    });

     cloudTexture.offset.y += 0.01;

    if (Math.random() < 0.008) {
      mountains.push(createMountain(mountainModel,scene));
    }
    position = ( ( Date.now() - start_time ) * 0.03 ) % 8000;


    renderer.render(scene, camera);
  };

  animate();
}


