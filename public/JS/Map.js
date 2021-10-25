import {
    MeshLambertMaterial
} from 'https://cdn.skypack.dev/three';

import {
    Utils
} from './Utils.js';
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
    Block
} from './Block.js';

export class Map {
    constructor(minRadius, maxRadius) {
        this.blocks = {};
        this.minRadius = minRadius;
        this.maxRadius = maxRadius;
        this.generation = new Utils.RandomGenerator(this.minRadius, this.maxRadius);
        this.generation.setSeed('193823850232448');
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
        let cube, cubeTexture, currentLocation, r, teta, type;
        for (let x = -this.maxRadius; x <= this.maxRadius; x++) {
            for (let y = 0; y <= Config.d3.altitudeMax; y++) {
                for (let z = -this.maxRadius; z <= this.maxRadius; z++) {
                    currentLocation = {
                        x,
                        y,
                        z
                    };

                    type = this.generation.generationFunction(x, y, z);
                    if (type === Type.Air) continue;

                    const block = new Block(x, y, z, new MeshLambertMaterial({
                        map: type.texture
                    }));
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

        // Add the test palmer
        const palmer = Model3D.Palmer.model.scene;
        palmer.position.set(-2, 0.5, this.minRadius);
        palmer.scale.multiplyScalar(Model3D.Palmer.scale);
        scene.add(palmer);

        // Add the test tree
        const tree = Model3D.Tree.model.scene;
        tree.position.set(1, 4.5, 10);
        tree.scale.multiplyScalar(Model3D.Tree.scale);
        scene.add(tree);

        // Add the test rock
        const rock = Model3D.Rock.model.scene;
        rock.position.set(14, 0.5, 16);
        rock.scale.multiplyScalar(Model3D.Rock.scale);
        scene.add(rock);

        // Add the test bush
        const bush = Model3D.Bush.model.scene;
        bush.position.set(3, 2.5, 16);
        bush.scale.multiplyScalar(Model3D.Bush.scale);
        scene.add(bush);
    }
}