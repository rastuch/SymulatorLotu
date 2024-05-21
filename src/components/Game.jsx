import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { WebGL } from 'three/examples/jsm/Addons.js';
import initSky from '../initSky.js';
import jetControllers from '../jetControllers.js';
import createMountain from '../createMountain.js';
import initClouds from '../initClouds.js';

const Game = ({ start }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    let start_time;
    let jet, position, mountainModel, sky, sun, mixer;

    if (WebGL.isWebGLAvailable()) {
      console.log('WebGL is available!');
    } else {
      const warning = WebGL.getWebGLErrorMessage();
      containerRef.current.appendChild(warning);
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    camera.position.y = 1;

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    const loader = new GLTFLoader();
    const textureLoader = new THREE.TextureLoader();

    const light = new THREE.DirectionalLight(0xffffff, 10.0);
    light.position.set(3.14, 1, 1);
    scene.add(light);

    scene.add(new THREE.AmbientLight(0xeef0ff, 0.2));

    const cloudTexture = textureLoader.load('src/models/cloudd.png');
    cloudTexture.colorSpace = THREE.SRGBColorSpace;
    cloudTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    cloudTexture.wrapS = cloudTexture.wrapT = THREE.RepeatWrapping;

    initClouds(scene, cloudTexture);

    loader.load('src/models/mig29c.glb', function (gltf) {
      jet = gltf.scene;
      jet.scale.set(0.005, 0.005, 0.005);
      jet.position.z = 0;
      jet.rotation.y = Math.PI;

      if (gltf.animations && gltf.animations.length) {
        mixer = new THREE.AnimationMixer(gltf.scene);
        gltf.animations.forEach((clip) => {
          mixer.clipAction(clip).play();
        });
      }

      scene.add(jet);

      loader.load('src/models/doublemount.glb', function (gltf) {
        mountainModel = gltf.scene;
        mountainModel.scale.set(1, 1, 1);

        initSky(renderer, scene, camera, sky, sun);
        if (start) {
          initGame();
        }
      });
    });

    function initGame() {
      start_time = Date.now();
      const mountains = [];
      let targetPosition = new THREE.Vector3();
      let targetQuaternion = new THREE.Quaternion();

      scene.fog = new THREE.FogExp2(0xffffff, 0.01);

      if (jet) {
        targetPosition.copy(jet.position);
        targetQuaternion.copy(jet.quaternion);
      }

      jetControllers(jet, targetPosition, targetQuaternion);

      const clock = new THREE.Clock();

      const animate = () => {
        requestAnimationFrame(animate);
        if (jet) {
          jet.position.lerp(targetPosition, 0.1);
          jet.quaternion.slerpQuaternions(jet.quaternion, targetQuaternion, 0.1);
          const delta = clock.getDelta();

          if (mixer) {
            mixer.update(delta);
          }
        }

        mountains.forEach((mountain, index) => {
          mountain.position.z += 0.2;
          if (mountain.position.z > 10) {
            scene.remove(mountain);
            mountains.splice(index, 1);
          }
        });

        cloudTexture.offset.y += 0.01;

        if (Math.random() < 0.008) {
          mountains.push(createMountain(mountainModel, scene));
        }

        position = ((Date.now() - start_time) * 0.03) % 8000;

        renderer.render(scene, camera);
      };

      animate();
    }

    return () => {
      if (containerRef.current) {
        while (containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild);
        }
      }
    };
  }, [start]);

  return <div ref={containerRef} className="game-container" />;
};

export default Game;
