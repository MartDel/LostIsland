import { MeshLambertMaterial } from 'https://cdn.skypack.dev/three';

import { Model3D } from '../assets/Model3D.js';
import { Type } from '../assets/Type.js';
import { Block } from './Block.js';

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
     * DEBUG : Turn into a ThreeJS elements to display them
     * @returns All hitbox blocks (Array)
     */
    toThreeJS() {
        let result = [];

        // Loop through the model hitbox
        for (const box of this.model.hitbox) {
            // Build the real box position
            let boxCoord = [];
            for (let i = 0; i < box.length; i++) {
                boxCoord[i] = this.origin[i] + box[i];
            }

            // Build the box block
            const boxBlock = new Block(boxCoord[0], boxCoord[1], boxCoord[2], new MeshLambertMaterial({
                map: Type.Hitbox.texture, transparent: true, opacity: 0.5, color: 0xFF0000
            }));
            result.push(boxBlock);
        }

        return result;
    }

}