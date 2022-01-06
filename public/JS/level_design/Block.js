import { BoxGeometry, Mesh } from 'https://cdn.skypack.dev/three';

import { Utils } from '../utils/utils.js';

// The basic cube geometry
const CUBE_GEOMETRY = new BoxGeometry(1, 1, 1);

/* -------------------------------------------------------------------------- */
/*                         Represent a displayed block                        */
/* -------------------------------------------------------------------------- */
export class Block {
    constructor(x, y, z, material) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.material = material;
        
        this.visible = true;
        this.cube = new Mesh(CUBE_GEOMETRY, material);
        this.cube.position.set(this.x, this.y, this.z);
    }

    /**
     * Get the block position in an array [x, y, z]
     * @return {Array} The array position
     */
    getTuplePosition() { return [this.x, this.y, this.z]; }

    /**
     * Check if a block is surronded by other blocks (so can't be visible)
     * @param {Object} blocks All generated blocks
     * @return {Boolean} If the block is surrounded or not
     */
    isSurrounded(blocks) {
        let surrounded = true;

        // The block pos
        const blockCoord = this.getTuplePosition();
        
        // Near blocks position differences
        const nears = Utils.nearPositions;

        // Check all possible blocks
        let nearCoord = [];
        for (const near of nears) {
            // Build the near block real position
            for (let i = 0; i < near.length; i++) {
                nearCoord[i] = blockCoord[i] + near[i];
            }

            // Check if the near block is not 'Air', and if it's not the underground ;)
            if (!blocks.hasOwnProperty(nearCoord) && nearCoord[1] >= 0)
                surrounded = false;
        }

        return surrounded;
    }
}