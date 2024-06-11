import * as THREE from "three";

/**
 * Controls the jet's movement and rotation based on keyboard input.
 *
 * @param {THREE.Object3D} jet - The jet object to control.
 * @param {THREE.Vector3} targetPosition - The target position of the jet.
 * @param {THREE.Quaternion} targetQuaternion - The target quaternion for the jet's rotation.
 * @param {boolean} gameOver - The game over state.
 */
export default function jetControllers(jet, targetPosition, targetQuaternion, gameOver) {
    const jetMaxMove = 8;

    window.addEventListener('keydown', (e) => {
        if (!jet || gameOver) return;
        if (e.key === 'ArrowLeft') {
            if (targetPosition.x > (-1 * jetMaxMove)) {
                targetPosition.x -= 0.9;
            }
            targetQuaternion.setFromEuler(new THREE.Euler(0, Math.PI, -Math.PI / 4));
        }
        if (e.key === 'ArrowRight') {
            if (targetPosition.x < jetMaxMove) {
                targetPosition.x += 0.9;
            }
            targetQuaternion.setFromEuler(new THREE.Euler(0, Math.PI, Math.PI / 4));
        }
    });

    window.addEventListener('keyup', (e) => {
        if (!jet || gameOver) return;
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            targetQuaternion.setFromEuler(new THREE.Euler(0, Math.PI, 0));
        }
    });
}
