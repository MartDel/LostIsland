import { BoxGeometry, Mesh } from 'https://cdn.skypack.dev/three';

import { Utils } from '../utils/utils.js';
import { Locatable } from './Locatable.js';

// The basic cube geometry
const CUBE_GEOMETRY = new BoxGeometry(1, 1, 1);

/* -------------------------------------------------------------------------- */
/*                         Represent a displayed block                        */
/* -------------------------------------------------------------------------- */
export class Block extends Locatable {

    /**
     * Block constructor
     * @param {Number} x The x position
     * @param {Number} y The y position
     * @param {Number} z The z position
     * @param {MeshLambertMaterial} material The block material
     */
    constructor(x, y, z, material) {
        super(x, y, z)
        this.material = material;
        this.visible = true;
    }

    /**
     * Check if a block is surronded by other blocks (so can't be visible)
     * @param {Object} blocks All generated blocks
     * @return {Boolean} If the block is surrounded or not
     */
    isSurrounded(blocks) {
        let surrounded = true;

        // The block pos
        const blockCoord = this.toPositionArray();
        
        // Near blocks position differences
        const nears = Utils.nearPositions;

        // Check all possible blocks
        for (const near of nears) {
            // Build the near block real position
            const nearCoord = [];
            for (let i = 0; i < near.length; i++) {
                nearCoord[i] = blockCoord[i] + near[i];
            }

            // Check if the near block is not 'Air', and if it's not the underground ;)
            if (!blocks.hasOwnProperty(nearCoord) && nearCoord[1] >= 0)
                surrounded = false;
        }

        return surrounded;
    }

    /**
     * Turn into a ThreeJS element to display it
     * @returns A displayable cube
     */
    toThreeJS() {
        // Create the cube
        const cube = new Mesh(CUBE_GEOMETRY, this.material);

        // Set the position
        cube.position.set(this.x, this.y, this.z);

        return cube;
    }
}