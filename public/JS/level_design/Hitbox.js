import { MeshLambertMaterial } from 'https://cdn.skypack.dev/three';

import { Model3D } from '../assets/Model3D.js';
import { Type } from '../assets/Type.js';
import { Block } from './Block.js';
import { Config } from '../config.js';

/* -------------------------------------------------------------------------- */
/*                         Represent a 3D model hitbox                        */
/* -------------------------------------------------------------------------- */
export class Hitbox {

    /**
     * Hitbox constructor
     * @param {Array} origin The mesh position
     * @param {Model3D} model The mesh model
     */
    constructor(origin, model) {
        this.origin = origin;
        this.model = model;
    }

    /**
     * Get the hitbox as an array of positions
     * @returns An array which contains position arrays
     */
    toArray() {
        let result = [];

        // Loop through the model hitbox
        for (const box of this.model.hitbox) {
            let boxCoord = [];
            
            // Build the real box position
            for (let i = 0; i < box.length; i++) {
                boxCoord[i] = this.origin[i] + box[i];
            }
            
            result.push(boxCoord);
        }

        return result;
    }

    /**
     * Check if the given position is contained in the hitbox
     * @param {Array} pos A position array
     * @returns If the position matches with a hitbox or not
     */
    contains(pos) {
        return this.toArray().contains(pos);
    }

    /**
     * DEBUG : Turn into a ThreeJS elements to display them
     * @returns All hitbox blocks (Array)
     */
    toThreeJS() {
        let result = [];

        // Loop through the model hitbox
        for (const box of this.toArray()) {
            // Build the box block
            const boxBlock = new Block(box[0], box[1], box[2], new MeshLambertMaterial({
                map: Type.Hitbox.texture,
                transparent: Config.textures.hitbox.isTransparent,
                opacity: Config.textures.hitbox.opacity,
                color: Config.textures.hitbox.color
            }));

            result.push(boxBlock);
        }

        return result;
    }
}