import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { WebGL } from 'three/examples/jsm/Addons.js';
import initSky from '../initSky.js';
import initClouds from '../initClouds.js';

const MovingMap = () => {
    const containerRef = useRef(null);

    useEffect(() => {
        let jet, sky, sun, mixer;

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
                const mountainModel = gltf.scene;
                mountainModel.scale.set(1, 1, 1);

                initSky(renderer, scene, camera, sky, sun);
            });
        });

        const animate = () => {
            requestAnimationFrame(animate);
            const delta = new THREE.Clock().getDelta();

            if (mixer) {
                mixer.update(delta);
            }

            cloudTexture.offset.y += 0.01;
            renderer.render(scene, camera);
        };

        animate();

        return () => {
            if (containerRef.current) {
                while (containerRef.current.firstChild) {
                    containerRef.current.removeChild(containerRef.current.firstChild);
                }
            }
        };
    }, []);

    return <div ref={containerRef} className="moving-map-container" />;
};

export default MovingMap;
