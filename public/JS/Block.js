import {
    BoxGeometry,
    Mesh
} from 'https://cdn.skypack.dev/three';

const CUBE_GEOMETRY = new BoxGeometry(1, 1, 1);

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