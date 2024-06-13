import * as THREE from "three";
import {cloudsValues2 as cloudsValues} from "../models/cloudsValues.js";

/**
 * Initializes and adds clouds to the scene.
 *
 * @function initClouds
 * @param {THREE.Scene} scene - The scene to add the clouds to.
 * @param {THREE.Texture} cloudTexture - The texture to apply to the clouds.
 * @returns {void}
 */
export default function initClouds(scene, cloudTexture) {
    const cloudGeometry = new THREE.PlaneGeometry(256, 256);

    const {repeate1, repeate2, offset1, offset2, meshPositionX, meshPositionZ} = cloudsValues;

    for (let i = 0; i < 50; i++) { // Creates 50 clouds
        cloudTexture.repeat.set(repeate1[i], repeate2[i]);
        cloudTexture.offset.set(offset1[i], offset2[i]);

        const material = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            map: cloudTexture,
            transparent: true,
        });

        const cloudMesh = new THREE.Mesh(cloudGeometry, material);
        cloudMesh.rotation.x = -Math.PI / 2;
        cloudMesh.position.set(
            meshPositionX[i],
            (-i * 0.05) - 4,
            meshPositionZ[i]
        );

        scene.add(cloudMesh);
    }
}
