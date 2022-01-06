import { Vector3 } from 'https://cdn.skypack.dev/three';

/* -------------------------------------------------------------------------- */
/*            Represent a 3D displayed object which has a location            */
/* -------------------------------------------------------------------------- */
export class Locatable {

    /**
     * Locatable constructor
     * @param {Number} x The x position
     * @param {Number} y The y position
     * @param {Number} z The z position
     */
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    /**
     * Get the locatable position in an array [x, y, z]
     * @return {Array} The array position
     */
    toPositionArray() { return [this.x, this.y, this.z]; }

    /**
     * Get the locatable position in a ThreeJS vector
     * @return {Vector3} The vector position
     */
    toPositionVector() { return new Vector3(this.x, this.y, this.z); }

    /**
     * MUST BE IMPLEMENTED
     * Turn into a ThreeJS element to display it
     */
    toThreeJS() {
        throw "The method must be implemented !";
    }

}