import * as THREE from "three";

export default function groundTextureGenerator(scene,renderer,groundMesh,groundTexture) {
    const textureLoader = new THREE.TextureLoader();

    scene.background = new THREE.Color( 0xf2f7ff );
    groundTexture = textureLoader.load( 'src/models/cloudd.png' );
    groundTexture.colorSpace = THREE.SRGBColorSpace;
    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    groundTexture.anisotropy = maxAnisotropy;
    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set( 1020, 512 );
    const geometry = new THREE.PlaneGeometry( 10, 10 );
    const material1 = new THREE.MeshPhongMaterial( { color: 0xffffff, map: groundTexture, transparent: true,} );

    groundMesh = new THREE.Mesh( geometry, material1 );
    groundMesh.rotation.x = - Math.PI / 2;
    groundMesh.scale.set( 1000, 1000, 1000 );
    groundMesh.position.y = -4;
    return groundMesh
}
