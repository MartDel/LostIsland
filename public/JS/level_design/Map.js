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
        // Generated stuff (empty for now...)
        this.blocks = {};
        this.models = {};
        this.hitboxes = {};

        // Generation data
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
     * Add a mesh/model to the map and update the hitboxes array
     * @param {Mesh} model The mesh/model to add
     */
    addModel(model) {
        // Add the model to the map
        const modelCoord = model.toPositionArray();
        this.models[modelCoord] = model;

        // Update the hitboxes
        const hitbox = model.hitbox;
        this.hitboxes[modelCoord] = hitbox;
    }

    /**
     * Generate the map array
     * @param {number} minRadius The minimum radius of the map generation
     */
    generate(minRadius) {
        let forestFloor = [];

        // Generate the map structure
        for (let x = -this.maxRadius; x <= this.maxRadius; x++) {
            for (let y = 0; y <= Config.d3.altitudeMax; y++) {
                for (let z = -this.maxRadius; z <= this.maxRadius; z++) {
                    const currentPosition = [x, y, z];

                    // Calcul the block type
                    const type = this.generation.generationFunction(x, y, z);
                    if (type === Type.Air) continue;
                    
                    // Create the bloc with the correct texture
                    const block = new Block(x, y, z, new MeshLambertMaterial({
                        map: type.texture
                    }));
                    this.addBlock(block);
                    
                    // Select the forest area
                    if (type === Type.Grass) forestFloor.push(currentPosition);
                }
            }
        }
        
        // Place forest elements
        // while (forestFloor.length > 0) {
        //     // Choose a random block
        //     const randomBlock = Math.floor(Math.random() * forestFloor.length);
        //     if ()
        // }
        
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

        // Display all models
        for (const coord in this.models) {
            const model = this.models[coord];
            scene.add(model.toThreeJS());
        }

        // Display hitboxes
        for (const coord in this.hitboxes) {
            const hb = this.hitboxes[coord].toThreeJS();
            for (const box of hb) {
                scene.add(box.toThreeJS());
            }
        }
    }
}