import * as THREE from 'https://cdn.skypack.dev/three';
import {
    OrbitControls
} from 'https://cdn.skypack.dev/three/examples/jsm/controls/OrbitControls.js';
import {
    Utils
} from './Utils.js';
import {
    Config
} from './Config.js';
import {
    Type
} from './Type.js';

/*
 * DEBUG
 */
const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

let scene, renderer, camera, clock, controls, map;

// Import textures;
const loadManager = new THREE.LoadingManager();
const loader = new THREE.TextureLoader(loadManager);
const grassTexture = loader.load(Config.textures.path + Type.Grass);
const dirtTexture = loader.load(Config.textures.path + Type.Dirt);
const sandTexture = loader.load(Config.textures.path + Type.Sand);
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
    camera.position.set(40, 40, 40);
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
        this.blocks = {};
        this.minRadius = minRadius;
        this.maxRadius = maxRadius;
        this.generation = new Utils.RandomGenerator(this.minRadius, this.maxRadius);
        // this.generation.setSeed('28457209759628');
    }

    /**
     * Add a block to the map and optimise nears blocks
     * @param {Block} block The block to add
     */
    addBlock(block, verbose = false) {
        const blockCoord = block.getTuplePosition();
        this.blocks[blockCoord] = block;
        const nears = [
            [1, 0, 0],
            [-1, 0, 0],
            [0, 1, 0],
            [0, -1, 0],
            [0, 0, 1],
            [0, 0, -1],
        ];
        let near, nearBlock, nearCoord = [];
        for (near of nears) {
            for (let i = 0; i < near.length; i++) {
                nearCoord[i] = blockCoord[i] + near[i];
            }
            if (verbose) console.log(nearCoord);
            if (this.blocks.hasOwnProperty(nearCoord)) {
                nearBlock = this.blocks[nearCoord];
                if (nearBlock.isSurrounded(this.blocks))
                    nearBlock.visible = false;
            }
        }
    }

    /**
     * Generate the map array
     * @param {number} minRadius The minimum radius of the map generation
     */
    generate(minRadius) {
        let cube, cubeMaterial, currentLocation, r, teta;


        for (let x = -this.maxRadius; x <= this.maxRadius; x++) {
            for (let y = 0; y <= Config.d3.altitudeMax; y++) {
                for (let z = -this.maxRadius; z <= this.maxRadius; z++) {
                    currentLocation = {
                        x,
                        y,
                        z
                    };

                    const type = this.generation.generationFunction(x, y, z);
                    if (type === Type.Air) continue;
                    switch (type) {
                        case Type.Grass:
                            cubeMaterial = new THREE.MeshLambertMaterial({
                                map: grassTexture
                            });
                            break;
                        case Type.Dirt:
                            cubeMaterial = new THREE.MeshLambertMaterial({
                                map: dirtTexture
                            });
                            break;
                    }

                    const block = new Block(x, y, z, cubeMaterial);
                    this.addBlock(block);
                }
            }
        }
    }

    /**
     * Update the map to the scene
     * @param {THREE.Scene} scene The game scene
     */
    update(scene) {
        let coord, block;
        for (coord in this.blocks) {
            block = this.blocks[coord];
            if (block.visible)
                scene.add(block.cube);
        }
    }
}

class Block {
    constructor(x, y, z, material) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.material = material;
        this.visible = true;
        this.cube = new THREE.Mesh(CUBE_GEOMETRY, material);
        this.cube.position.set(this.x, this.y, this.z);
    }

    /**
     * Get the block position in an array [x, y, z]
     * @return {Array} The array position
     */
    getTuplePosition() {
        return [this.x, this.y, this.z];
    }

    /**
     * Check if a block is surronded by other blocks (so can't be visible)
     * @param {Object} blocks All generated blocks
     * @return {Boolean} If the block is surrounded or not
     */
    isSurrounded(blocks) {
        let surrounded = true;
        const blockCoord = this.getTuplePosition();
        const nears = [
            [1, 0, 0],
            [-1, 0, 0],
            [0, 1, 0],
            [0, -1, 0],
            [0, 0, 1],
            [0, 0, -1],
        ];
        let near, nearCoord = [];
        for (near of nears) {
            for (let i = 0; i < near.length; i++) {
                nearCoord[i] = blockCoord[i] + near[i];
            }
            if (!blocks.hasOwnProperty(nearCoord) && nearCoord[1] >= 0)
                surrounded = false;
        }
        return surrounded;
    }
}