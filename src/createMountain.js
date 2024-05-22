export default function createMountain(mountainModel, scene) {
    if (!mountainModel) return;

    const mountainClone = mountainModel.clone(); // Klonujemy załadowany model
    mountainClone.position.x = Math.random() * 20 - 10;
    mountainClone.position.z = -100;
    mountainClone.position.y = Math.random() * 25 - 50;
    mountainClone.rotation.y = 3.14 /2
    scene.add(mountainClone);
    return mountainClone;
};

