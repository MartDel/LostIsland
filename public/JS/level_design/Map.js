import { MeshLambertMaterial } from 'https://cdn.skypack.dev/three';

import { Utils } from '../utils/utils.js';
import { Config } from '../config.js';
import { Type } from '../assets/Type.js';
import { Model3D } from '../assets/Model3D.js';
import { Block } from './Block.js';
import { RandomGenerator } from './RandomGenerator.js';
import { Mesh } from './Mesh.js';

/* -------------------------------------------------------------------------- */
/*                         Represent the displayed map                        */
/* -------------------------------------------------------------------------- */
export class Map {

    /**
     * Map contructor
     * @param {Number} minRadius The minimum radius of the map
     * @param {Number} maxRadius The maximum radius of the map
     */
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
        const blockCoord = block.toPositionArray();
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
        // Display all visible blocks
        for (const coord in this.blocks) {
            const block = this.blocks[coord];
            if (block.visible)
                scene.add(block.toThreeJS());
        }

        // Add the test palmer
        const palmer = new Mesh(-2, 0.5, this.minRadius, Model3D.Palmer);
        scene.add(palmer.toThreeJS());

        // Add the test tree
        const tree = new Mesh(1, 4.5, 10, Model3D.Tree);
        scene.add(tree.toThreeJS());

        // Add the test rock
        const rock = new Mesh(14, 0.5, 16, Model3D.Rock);
        scene.add(rock.toThreeJS());

        // Add a second test rock
        const rock2 = new Mesh(8, 0.5, 18, Model3D.Rock);
        scene.add(rock2.toThreeJS());

        // Add the test bush
        const bush = new Mesh(3, 2.5, 16, Model3D.Bush);
        scene.add(bush.toThreeJS());

        // Display the rock hitbox
        const rockHitbox = rock.hitbox.toThreeJS();
        for (const box of rockHitbox) {
            scene.add(box.toThreeJS());
        }
    }
}