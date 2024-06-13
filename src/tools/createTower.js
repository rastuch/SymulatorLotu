/**
 * Creates and adds a tower to the scene.
 * @function createTower
 * @param {THREE.Object3D} towerModel - The model of the tower to clone and add to the scene.
 * @param {THREE.Scene} scene - The scene to add the cloned tower to.
 * @returns {THREE.Object3D|undefined} The cloned tower model added to the scene, or undefined if no model is provided.
 */
export default function createTower(towerModel, scene) {
    if (!towerModel) return;

    const towerClone = towerModel.clone(); // Klonujemy załadowany model
    towerClone.position.x = Math.random() * 20 - 10;
    towerClone.position.z = -100;
    towerClone.position.y = Math.random() * 25 - 50;
    towerClone.rotation.y = 3.14 / 2;
    scene.add(towerClone);
    return towerClone;
};
