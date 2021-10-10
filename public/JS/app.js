import * as THREE from 'https://cdn.skypack.dev/three';
import {
    OrbitControls
} from 'https://cdn.skypack.dev/three/examples/jsm/controls/OrbitControls.js';

/*
 * DEBUG
 */
const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

let scene, renderer, camera, clock, controls, floor;

// Import textures
const TEXTURE_PATH = '../textures/';
const loadManager = new THREE.LoadingManager();
const loader = new THREE.TextureLoader(loadManager);
const grassTexture = loader.load(TEXTURE_PATH + 'grass.jpg');
loadManager.onLoad = init;

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
    camera.position.set(-5, 4, -5);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    scene.add(camera);

    // Setting up the camera controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.update();

    // Setting up lights
    const ambientLight = new THREE.AmbientLight(0xcccccc, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    scene.add(directionalLight);

    // Setting up the floor
    floor = [];
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshLambertMaterial({
        map: grassTexture
    });
    for (let i = 0; i < 2; i++) {
        floor[i] = new THREE.Mesh(cubeGeometry, cubeMaterial);
        floor[i].position.set(0, 0, i);
        scene.add(floor[i]);
    }

    render();
}

let elapsed;

function render() {
    stats.begin();
    controls.update();

    // Rendering the 3D scene
    renderer.render(scene, camera);
    stats.end();
    requestAnimationFrame(render);
}