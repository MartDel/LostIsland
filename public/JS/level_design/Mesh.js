import { Model3D } from '../assets/Model3D.js';
import { Hitbox } from './Hitbox.js';
import { Locatable } from './Locatable.js';

/* -------------------------------------------------------------------------- */
/*                       Represent a displayed 3D model                       */
/* -------------------------------------------------------------------------- */
export class Mesh extends Locatable {

    /**
     * Mesh constructor
     * @param {Number} x The x position
     * @param {Number} y The y position
     * @param {Number} z The z position
     * @param {Model3D} model The mesh model
     */
    constructor(x, y, z, model) {
        super(x, y, z);
        this.model = model;
        this.hitbox = new Hitbox(this.toPositionArray(), this.model);
    }

    /**
     * Turn into a ThreeJS element to display it
     * @returns A displayable model
     */
    toThreeJS() {
        // Clone the model
        const mesh = this.model.model.scene.clone();

        // Set the position
        mesh.position.set(this.x, this.y, this.z);

        // Update the size
        mesh.scale.multiplyScalar(this.model.scale);

        return mesh;
    }
}