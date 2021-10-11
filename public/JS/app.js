import * as THREE from 'https://cdn.skypack.dev/three';
import {
    OrbitControls
} from 'https://cdn.skypack.dev/three/examples/jsm/controls/OrbitControls.js';
import {
    Utils
} from './Utils.js';

/*
 * DEBUG
 */
const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

let scene, renderer, camera, clock, controls, map;

const Type = {
    Air: null,
    Grass: 'grass.jpg',
    Dirt: 'dirt.jpeg'
};

// Import textures
const TEXTURE_PATH = '../textures/';
const loadManager = new THREE.LoadingManager();
const loader = new THREE.TextureLoader(loadManager);
const grassTexture = loader.load(TEXTURE_PATH + Type.Grass);
const dirtTexture = loader.load(TEXTURE_PATH + Type.Dirt);
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
    camera.position.set(0, 50, 0);
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
    map = new Map(20, 50);
    map.generate();

    map.update(scene);
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

const CUBE_GEOMETRY = new THREE.BoxGeometry(1, 1, 1);
class Map {
    constructor(minRadius, maxRadius) {
        this.blocks = [];
        this.minRadius = minRadius;
        this.maxRadius = maxRadius;
        this.generation = new Utils.RandomGenerator(this.maxRadius - this.minRadius);
    }

    /**
     * Add a block to the map
     * @param {THREE.Mesh} block The block to add
     */
    addBlock(block) {
        this.blocks.push(block);
    }

    /**
     * Generate the map array
     * @param {number} minRadius The minimum radius of the map generation
     */
    generate(minRadius) {
        let cube, cubeMaterial, currentLocation, r, teta;
        const origin = {
            x: 0,
            y: 0,
            z: 0
        };
        const y = 0;
        for (let x = -this.maxRadius; x <= this.maxRadius; x++) {
            for (let z = -this.maxRadius; z <= this.maxRadius; z++) {
                currentLocation = {
                    x,
                    y,
                    z
                };
                r = Utils.distanceTo(origin, currentLocation);
                teta = Utils.getTeta(origin, currentLocation);
                teta = this.generation.map(teta);
                if (r > this.minRadius + this.generation.periodicFunction(teta)) continue;
                if (r <= this.minRadius)
                    cubeMaterial = new THREE.MeshLambertMaterial({
                        map: grassTexture
                    });
                else
                    cubeMaterial = new THREE.MeshLambertMaterial({
                        map: dirtTexture
                    });
                cube = new THREE.Mesh(CUBE_GEOMETRY, cubeMaterial);
                cube.position.set(x, y, z);
                this.addBlock(cube);
            }
        }
    }

    /**
     * Update the map to the scene
     * @param {THREE.Scene} scene The game scene
     */
    update(scene) {
        for (let block of this.blocks)
            scene.add(block);
    }
}