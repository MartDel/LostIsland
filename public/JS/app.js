import * as THREE from 'https://cdn.skypack.dev/three';
import { OrbitControls } from 'https://cdn.skypack.dev/three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three/examples/jsm/loaders/GLTFLoader.js';

import { Config } from './config.js';
import { Type } from './assets/Type.js';
import { Model3D } from './assets/Model3D.js';
import { Map } from './level_design/Map.js';

let scene, renderer, camera, clock, controls, map;

/* ---------------------------------- Debug --------------------------------- */

// Stats
const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

// Raycaster
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
window.addEventListener('click', event => {
    // Convert coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Interpret raycaster data
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    // Print clicked block position
    if (intersects.length > 0) console.log(intersects[0].object.position);
}, false);

/* -------------------------------- Textures -------------------------------- */

// Textures load manager
const loadManager = new THREE.LoadingManager();
const textureLoader = new THREE.TextureLoader(loadManager);

// Load each texture of 'Type'
for (let typeName in Type) {
    if (!Type.hasOwnProperty(typeName)) continue;
    
    // Skip empty types (like air for example)
    const currentType = Type[typeName];
    if (currentType === null) continue;

    // Add the texture to the loader
    currentType.texture = textureLoader.load(Config.textures.path + currentType.textureName);
    currentType.texture.magFilter = THREE.NearestFilter;
}

/* --------------------------------- Models --------------------------------- */

// Model load manager
const modelLoader = new GLTFLoader();

/**
 * Load an empty model and restart (recursive, start 'init' when it's done)
 */
function loadModels() {
    let loaded = true;

    // Try to find an unloaded model in 'Model3D'
    for (let modelName in Model3D) {
        if (!Model3D.hasOwnProperty(modelName)) continue;

        const currentModel = Model3D[modelName];
        if (currentModel.model === null) {
            // The model is not loaded yet
            loaded = false;

            // Add the model to the load manager
            modelLoader.load(Config.models.path + currentModel.modelName, gltf => {
                currentModel.model = gltf;

                // Load the other models
                loadModels();
            });

            break;
        }
    }

    // Start ThreeJS when it's done
    if (loaded) init();
}

// Load models after textures
loadManager.onLoad = loadModels;


/* -------------------------------------------------------------------------- */
/*                           ThreeJS main functions                           */
/* -------------------------------------------------------------------------- */

/**
 * Init function
 */
function init() {
    // Setting up the scene
    clock = new THREE.Clock();
    scene = new THREE.Scene();

    // Setting up the renderer
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Setting up the camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(30, 15, 30);
    // camera.position.set(0, 50, 0);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    scene.add(camera);

    // Setting up the camera controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.update();

    // Setting up lights
    const ambientLight = new THREE.AmbientLight(0xcccccc, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    // directionalLight.position.set(10, 20, 10);
    // directionalLight.target.position.set(0, 0, 0);
    scene.add(directionalLight);
    // const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1);
    // directionalLight2.position.set(0, -10, 0);
    // directionalLight2.target.position.set(0, 0, 0);
    // scene.add(directionalLight2);

    // Setting up the map
    map = new Map(20, 50);
    map.generate();

    map.update(scene);
    render();
}

/**
 * Main loop function
 */
function render() {
    // DEBUG : Start calcul frame rate
    stats.begin();

    // DEBUG : Update OrbitControl (camera control)
    controls.update();

    // Rendering the 3D scene
    renderer.render(scene, camera);

    // DEBUG : Stop calcul frame rate
    stats.end();

    // Wait before looping
    requestAnimationFrame(render);
}