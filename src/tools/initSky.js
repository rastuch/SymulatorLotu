import * as THREE from "three";
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

/**
 *
 * Initializes and adds the sky to the scene.
 *
 * @function initSky
 * @param {THREE.WebGLRenderer} renderer - The renderer to use for rendering the sky.
 * @param {THREE.Scene} scene - The scene to add the sky to.
 * @param {THREE.Camera} camera - The camera to use for rendering the sky.
 * @param {Sky} sky - The Sky object to add to the scene.
 * @param {THREE.Vector3} sun - The Vector3 object representing the sun's position.
 * @returns {void}
 */
export default function initSky(renderer, scene, camera, sky, sun) {
    // Add Sky
    sky = new Sky();
    sky.scale.setScalar(450000);
    scene.add(sky);
    sun = new THREE.Vector3();

    // GUI Effect Controller
    const effectController = {
        turbidity: 2.1,
        rayleigh: 3,
        mieCoefficient: 0.005,
        mieDirectionalG: 0.7,
        elevation: 2,
        azimuth: 150,
        exposure: renderer.toneMappingExposure
    };

    /**
     * Handles changes in the GUI and updates the sky parameters.
     */
    function guiChanged() {
        const uniforms = sky.material.uniforms;
        uniforms['turbidity'].value = effectController.turbidity;
        uniforms['rayleigh'].value = effectController.rayleigh;
        uniforms['mieCoefficient'].value = effectController.mieCoefficient;
        uniforms['mieDirectionalG'].value = effectController.mieDirectionalG;

        const phi = THREE.MathUtils.degToRad(90 - effectController.elevation);
        const theta = THREE.MathUtils.degToRad(effectController.azimuth);

        sun.setFromSphericalCoords(1, phi, theta);

        uniforms['sunPosition'].value.copy(sun);

        renderer.toneMappingExposure = effectController.exposure;
        renderer.render(scene, camera);
    }

    // Uncomment the following lines to enable the GUI for tweaking sky parameters
    // const gui = new GUI();
    // gui.add(effectController, 'turbidity', 0.0, 20.0, 0.1).onChange(guiChanged);
    // gui.add(effectController, 'rayleigh', 0.0, 4, 0.001).onChange(guiChanged);
    // gui.add(effectController, 'mieCoefficient', 0.0, 0.1, 0.001).onChange(guiChanged);
    // gui.add(effectController, 'mieDirectionalG', 0.0, 1, 0.001).onChange(guiChanged);
    // gui.add(effectController, 'elevation', 0, 90, 0.1).onChange(guiChanged);
    // gui.add(effectController, 'azimuth', -180, 180, 0.1).onChange(guiChanged);
    // gui.add(effectController, 'exposure', 0, 1, 0.0001).onChange(guiChanged);

    guiChanged();
}
