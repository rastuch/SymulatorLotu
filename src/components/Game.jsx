import React, {useEffect, useRef, useState} from 'react';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {WebGL} from 'three/examples/jsm/Addons.js';
import initSky from '../tools/initSky.js';
import jetControllers from '../tools/jetControllers.js';
import createTower from '../tools/createTower.js';
import initClouds from '../tools/initClouds.js';
import {BoxGeometry, InstancedMesh, MeshPhongMaterial, Object3D, Vector3} from 'three';
import goImg from '../models/gameover.png'
import ButtonFly from "./ButtonFly.jsx";
import logo from "../models/symulatorLogo.png";
import styles from "./styles.js";


/**
 * Component representing the game.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {Function} props.handleStopGame - Function to handle stopping the game.
 * @returns {JSX.Element} The game component.
 */
const Game = ({handleStopGame}) => {
  const [userSpeed, setUserSpeed] = useState(180);
  const [score, setScore] = useState(180);
  const gameStoped = useRef(false);
  const [playerName, setPlayerName] = useState('Player');

  useEffect(() => {
    const timer = setInterval(() => setUserSpeed(prev => prev + 1), 250);
    return () => {clearInterval(timer)};
  },[]);

  useEffect(() => {
    if(gameStoped.current){
      setScore(userSpeed);
    }
  }, [gameStoped.current]);

  const checkScoreShouldBeRegister = React.useMemo(() => {
    const scoreTable = localStorage.getItem('scoreTable');
    if(!scoreTable){
      return true;
    } else {
      const table = JSON.parse(scoreTable);
      if(Array.isArray(table)){
        if(table.length < 10){
          return true;
        }
        return !table.every((row) => row?.score > score);
      } else {
        return true;
      }
    }
  }, [score]);

  /**
   * Button NEXT function
   * @function onPressNext
   *
   * @returns {void}
   */

  const onPressNext = () => {
    if(checkScoreShouldBeRegister){
      // SAVE SCORE AND BACK TO MENU
      const scoreTable = JSON?.parse(localStorage.getItem('scoreTable'));
      let newTable = [];
      if(Array.isArray(scoreTable)) {
        newTable = [...scoreTable];
      }

      newTable.push({
        name: playerName || 'Player',
        score: score,
        date: Date.now()
      });

      newTable = newTable.sort((a, b) => b.score - a.score).slice(0, 10);
      localStorage.setItem('scoreTable', JSON.stringify(newTable));
      location.reload();
    } else {
      // GO TO MAIN (JUST REFRESH PAGE)
      location.reload();
    }
  };

  /**
   * Initialize the game.
   *
   * @function initializeGame
   * @returns {void}.
   */
  const initializeGame = () => {
    const setStoped = () => {
      gameStoped.current = true;
    };

    if (WebGL.isWebGLAvailable()) {
      console.log('dostepny!');
    } else {
      const warning = WebGL.getWebGLErrorMessage();
      document.getElementById('container').appendChild(warning);
      return;
    }

    let jet, sky, sun, mixer, buildMesh, gameOver, tower2, tower3, tower1;
    let speed = 2;
    let isDebug = false;

    const scene = new THREE.Scene();

    /**
     * Initialize the camera.
     * @function initCamera
     * @returns {THREE.PerspectiveCamera} The initialized camera.
     */
    const initCamera = () => {
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 5;
      camera.position.y = 1;
      return camera;
    };

    const camera = initCamera();

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('game-container').appendChild(renderer.domElement);

    const loader = new GLTFLoader();
    const textureLoader = new THREE.TextureLoader();

    /**
     * Add lights to the scene.
     * @function addLightsToScene
     * @param {THREE.Scene} scene - The scene to add lights to.
     * @returns {void}
     */
    const addLightsToScene = (scene) => {
      const light = new THREE.DirectionalLight(0xffffff, 10.0);
      light.position.set(3.14, 1, 1);
      scene.add(light);
      scene.add(new THREE.AmbientLight(0xeef0ff, 0.2));
    };

    addLightsToScene(scene);

    /**
     * Load and set the cloud texture.
     * @function loadAndSetCloudTexture
     * @returns {THREE.Texture} The loaded cloud texture.
     */
    const loadAndSetCloudTexture = () => {
      const cloudTexture = textureLoader.load('src/models/cloudd.png');
      cloudTexture.colorSpace = THREE.SRGBColorSpace;
      cloudTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      cloudTexture.wrapS = cloudTexture.wrapT = THREE.RepeatWrapping;
      return cloudTexture;
    };

    /**
     * Create buildings in the scene.
     * @function createBuildings
     * @param {THREE.Scene} scene - The scene to add buildings to.
     * @returns {void}
     */
    function createBuildings(scene) {
      const buildGeometry = new BoxGeometry(1, 1, 1);
      const buildMaterial = new MeshPhongMaterial({color: 0x888888});
      buildMesh = new InstancedMesh(buildGeometry, buildMaterial, 8000);
      scene.add(buildMesh);

      const dummy = new Object3D();

      for (let i = 0; i < buildMesh.count; i++) {
        const scaleY = Math.random() * 7 + 0.5;

        dummy.position.x = Math.random() * 600 - 300;
        dummy.position.z = Math.random() * 600 - 300;

        dummy.position.y = 0.5 * scaleY;

        dummy.scale.x = dummy.scale.z = Math.random() * 3 + 0.5;
        dummy.scale.y = scaleY;

        dummy.updateMatrix();

        buildMesh.setMatrixAt(i, dummy.matrix);
        buildMesh.position.y = -8;
      }
    }

    /**
     * Create raycasters and add them to the scene.
     * @function createRaycasters
     * @param {THREE.Scene} scene - The scene to add raycasters to.
     * @returns {Object} An object containing the raycasters and arrow helpers.
     */
    const createRaycasters = (scene) => {
      const rayLength = 1;
      const raycasters = [
        new THREE.Raycaster(undefined, undefined, 0, rayLength),
        new THREE.Raycaster(undefined, undefined, 0, rayLength),
        new THREE.Raycaster(undefined, undefined, 0, rayLength)
      ];
      const arrowHelpers = [
        new THREE.ArrowHelper(new THREE.Vector3(0, 0, -1), new THREE.Vector3(), rayLength, 0xff0000),
        new THREE.ArrowHelper(new THREE.Vector3(0, 0, -1), new THREE.Vector3(), rayLength, 0x00ff00),
        new THREE.ArrowHelper(new THREE.Vector3(0, 0, -1), new THREE.Vector3(), rayLength, 0x0000ff)
      ];
      if(isDebug) {
        arrowHelpers.forEach(helper => scene.add(helper));
      }
      return {raycasters, arrowHelpers};
    };

    const cloudTexture = loadAndSetCloudTexture();
    initClouds(scene, cloudTexture);

    loader.load('src/models/tower2.glb', function (gltf) {
      tower2 = gltf.scene;
      tower2.scale.set(0.2, 0.5, 0.2);

      loader.load('src/models/tower3.glb',function (gltf) {
        tower3 = gltf.scene;
        tower3.scale.set(0.2, 0.5, 0.2);

        loader.load('src/models/mig29c.glb', function (gltf) {
          jet = gltf.scene;
          jet.scale.set(0.003, 0.003, 0.003);
          jet.position.z = 0;
          jet.rotation.y = Math.PI;

          if (gltf.animations && gltf.animations.length) {
            mixer = new THREE.AnimationMixer(gltf.scene);
            gltf.animations.forEach((clip) => {
              mixer.clipAction(clip).play();
            });
          } else {
            console.log(gltf);
          }
          scene.add(jet);

          loader.load('src/models/tower1.glb', function (gltf) {
            tower1 = gltf.scene;
            tower1.scale.set(0.2, 0.5, 0.2);

            initSky(renderer, scene, camera, sky, sun);
            initGame();
          }, undefined, function (error) {
            console.error(error);
          });
        }, undefined, function (error) {
          console.error(error);
        });
      }, undefined, function (error) {
        console.error(error);
      });
    }, undefined, function (error) {
      console.error(error);
    });

    /**
     * Initialize the game.
     * @function initGame
     */
    function initGame() {
      const towers = [];

      let targetPosition = new THREE.Vector3();
      let targetQuaternion = new THREE.Quaternion();

      scene.fog = new THREE.FogExp2(0xffffff, 0.01);

      if (jet) {
        targetPosition.copy(jet.position);
        targetQuaternion.copy(jet.quaternion);
      }

      jetControllers(jet, targetPosition, targetQuaternion);

      const clock = new THREE.Clock();
      const {raycasters, arrowHelpers} = createRaycasters(scene);

      createBuildings(scene);

      const animate = () => {
        if(!gameOver) {
          requestAnimationFrame(animate);
        } else {
          document.getElementById('myimg').style.visibility = 'visible';
          document.getElementById('speedvalue').style.visibility = 'hidden';
        }
        if (jet && !gameOver) {
          jet.position.lerp(targetPosition, 0.1);
          jet.quaternion.slerp(targetQuaternion, 0.1);
          const delta = clock.getDelta();

          if (mixer) {
            mixer.update(delta);
          }

          let collisionDetected = false;

          const jetBox = new THREE.Box3().setFromObject(jet);
          const halfWidth = (jetBox.max.x - jetBox.min.x) / 2;
          const center = jet.position.clone();
          const leftWing = new THREE.Vector3(center.x - halfWidth, center.y, center.z);
          const rightWing = new THREE.Vector3(center.x + halfWidth, center.y, center.z);

          const raycastOrigins = [
            center,
            leftWing,
            rightWing
          ];

          const direction = new THREE.Vector3(0, 0, -1);

          for (let i = 0; i < raycasters.length; i++) {
            raycasters[i].set(raycastOrigins[i], direction.clone().applyQuaternion(jet.quaternion));
            const intersects = raycasters[i].intersectObjects(towers, true);

            if(isDebug) {
              arrowHelpers[i].position.copy(raycastOrigins[i]);
              arrowHelpers[i].setDirection(direction.clone().applyQuaternion(jet.quaternion));
            }

            if (intersects.length > 0) {
              collisionDetected = true;
              break;
            }
          }

          if (collisionDetected && !gameOver) {
            gameOver = true;
            setStoped();
          }

          if(!gameOver) {
            towers.forEach((mountain, index) => {
              mountain.position.z += 0.2 * speed;
              if (mountain.position.z > 0.5) {
                scene.remove(mountain);
                towers.splice(index, 1);
              }
            });
          }

          if(!gameOver) {
            cloudTexture.offset.y += 0.01 * speed;
          }

          if (buildMesh && !gameOver) {
            const speedBuildings = 0.2 * speed;
            const buildingsDummy = new Object3D();
            for (let i = 0; i < buildMesh.count; i++) {
              buildMesh.getMatrixAt(i, buildingsDummy.matrix);
              buildingsDummy.matrix.decompose(buildingsDummy.position, buildingsDummy.quaternion, buildingsDummy.scale);
              buildingsDummy.position.z += speedBuildings;
              if (buildingsDummy.position.z > 300) {
                buildingsDummy.position.z = -300;
              }
              buildingsDummy.updateMatrix();
              buildMesh.setMatrixAt(i, buildingsDummy.matrix);
            }
            buildMesh.instanceMatrix.needsUpdate = true;
          }
          if(!gameOver) {
            if (Math.random() < 0.007) {
              const towerModels = [tower1, tower2, tower3];
              const newTower = createTower(towerModels[Math.floor(Math.random() * 3)], scene);
              towers.push(newTower);
            }
            speed += 0.0001;
          }

          renderer.render(scene, camera);
        }
      };

      animate();
    }
  };

  useEffect(() => {
    initializeGame();

    return () => {
      const gameContainer = document.getElementById('game-container');
      while (gameContainer.firstChild) {
        gameContainer.removeChild(gameContainer.firstChild);
      }
    };
  }, []);

  return (
      <>
        <div id="game-container" className="game-container">
          {/* This div will contain the Three.js canvas */}
        </div>
        <div id="speedvalue" className="collision-counter font-verdana">
          Speed: {userSpeed} KM/H
        </div>
        <img src={logo} style={styles.gameLogo}/>
        <div id="myimg" style={styles.containerStyle}>
          <img src={goImg} style={styles.imageStyle}/>
          <div className="font-verdana" style={styles.yourScoreValue}>
            YOUR SCORE: {score} KM/H
            {checkScoreShouldBeRegister &&
                <div style={styles.youAreInTop}>YOU ARE IN TOP 10!</div>}
          </div>
          {checkScoreShouldBeRegister &&
              <div style={styles.inputNameContainer}>
                <div style={styles.inputNameContent}>
                  <div style={styles.inputNameTitle}>TAPE YOUR NAME</div>
                  <input style={styles.inputNameStyle}
                         value={playerName}
                         className="font-verdana"
                         onChange={e => setPlayerName(e.target.value)}/>
                </div>
              </div>
          }
          <ButtonFly text="NEXT" onClick={onPressNext}/>
        </div>
      </>
  );
};

export default Game;
