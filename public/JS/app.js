import * as THREE from 'https://cdn.skypack.dev/three';
import {
    OrbitControls
} from 'https://cdn.skypack.dev/three/examples/jsm/controls/OrbitControls.js';
import {
    GLTFLoader
} from 'https://cdn.skypack.dev/three/examples/jsm/loaders/GLTFLoader.js';

import {
    Config
} from './Config.js';
import {
    Type
} from './Type.js';
import {
    Model3D
} from './Model3D.js';
import {
    Map
} from './Map.js';

/*
 * DEBUG
 */
const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

let scene, renderer, camera, clock, controls, map;

// Import textures
const loadManager = new THREE.LoadingManager();
const textureLoader = new THREE.TextureLoader(loadManager);
let currentType;
for (let typeName in Type) {
    if (!Type.hasOwnProperty(typeName)) continue;
    currentType = Type[typeName];
    if (currentType === null) continue;
    currentType.texture = textureLoader.load(Config.textures.path + currentType.textureName);
    currentType.texture.magFilter = THREE.NearestFilter;
}
loadManager.onLoad = loadModels;

// Import 3D models
const modelLoader = new GLTFLoader();
/**
 * Load an empty model and restart
 */
function loadModels() {
    let currentModel, loaded = true;
    for (let modelName in Model3D) {
        if (!Model3D.hasOwnProperty(modelName)) continue;
        currentModel = Model3D[modelName];
        if (currentModel.model === null) {
            loaded = false;
            modelLoader.load(Config.models.path + currentModel.modelName, gltf => {
                currentModel.model = gltf;
                loadModels();
            });
            break;
        }
    }
    if (loaded) init();
}


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
    camera.position.set(30, 30, 30);
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
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight2.position.set(0, -10, 0);
    directionalLight2.target.position.set(0, 0, 0);
    scene.add(directionalLight2);

    // Setting up the floor
    map = new Map(20, 50);
    map.generate();

    map.update(scene);
    render();
}

/**
 * Main loop function
 */
function render() {
    stats.begin();
    controls.update();

    // Rendering the 3D scene
    renderer.render(scene, camera);
    stats.end();
    requestAnimationFrame(render);
}