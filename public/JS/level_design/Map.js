import { MeshLambertMaterial } from 'https://cdn.skypack.dev/three';

import { Utils } from '../utils/utils.js';
import { Config } from '../config.js';
import { Type } from '../assets/Type.js';
import { Model3D } from '../assets/Model3D.js';
import { Block } from './Block.js';
import { RandomGenerator } from './RandomGenerator.js';

/* -------------------------------------------------------------------------- */
/*                         Represent the displayed map                        */
/* -------------------------------------------------------------------------- */
export class Map {
    constructor(minRadius, maxRadius) {
        this.blocks = {};
        this.minRadius = minRadius;
        this.maxRadius = maxRadius;
        this.generation = new RandomGenerator(this.minRadius, this.maxRadius);

        // DEBUG : Set a given seed
        this.generation.setSeed('193823850232448');
    }

    /**
     * Add a block to the map and optimise nears blocks
     * @param {Block} block The block to add
     */
    addBlock(block) {
        // Add the block to the map
        const blockCoord = block.getTuplePosition();
        this.blocks[blockCoord] = block;

        // Check near blocks to hide non-visible blocks
        const nears = Utils.nearPositions;
        let nearCoord = [];
        for (const near of nears) {
            // Build the near block real position
            for (let i = 0; i < near.length; i++) {
                nearCoord[i] = blockCoord[i] + near[i];
            }

            // Hide the near block if it exists and is surrounded
            if (this.blocks.hasOwnProperty(nearCoord)) {
                const nearBlock = this.blocks[nearCoord];
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
        for (let x = -this.maxRadius; x <= this.maxRadius; x++) {
            for (let y = 0; y <= Config.d3.altitudeMax; y++) {
                for (let z = -this.maxRadius; z <= this.maxRadius; z++) {
                    const currentLocation = {x, y, z};

                    // Calcul the block type
                    const type = this.generation.generationFunction(x, y, z);
                    if (type === Type.Air) continue;

                    // Create the bloc with the correct texture
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