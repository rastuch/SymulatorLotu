import * as THREE from "three";

export default function jetControllers (jet,targetPosition,targetQuaternion) {

    window.addEventListener('keydown', (e) => {
        if (!jet) return;
        if (e.key === 'ArrowLeft') {
            targetPosition.x -= 0.9;
            targetQuaternion.setFromEuler(new THREE.Euler(0, Math.PI, -Math.PI / 4));
        }
        if (e.key === 'ArrowRight') {
            targetPosition.x += 0.9;
            targetQuaternion.setFromEuler(new THREE.Euler(0, Math.PI, Math.PI / 4));

        }
    });

    window.addEventListener('keyup', (e) => {
        if (!jet) return;
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            targetQuaternion.setFromEuler(new THREE.Euler(0, Math.PI, 0));
        }
    })
}
