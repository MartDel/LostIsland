import { Config } from '../config.js';
import { Utils } from '../utils/utils.js';
import { Type } from '../assets/Type.js';

/* -------------------------------------------------------------------------- */
/*                         Represent the map generator                        */
/* -------------------------------------------------------------------------- */
export class RandomGenerator {

    /**
     * RandomGenerator contructor
     * @param {Number} minRadius The minimum radius of the map
     * @param {Number} maxRadius The maximum radius of the map
     */
    constructor(minRadius, maxRadius) {
        const maxAmplitude = maxRadius - minRadius;
        this.minRadius = minRadius;
        this.maxRadius = maxRadius;

        // Calcul the seed
        this.amplitude = Math.floor(Math.random() * (maxAmplitude - Config.d2.amplitudeMin)) + Config.d2.amplitudeMin;
        this.interval = Math.random() * (2 * Math.PI);
        this.interval = Math.floor(this.interval * Math.pow(10, 12));
        this.seed = String(this.amplitude) + this.interval;
        this.interval *= Math.pow(10, -12);
        
        // Init the simple noise
        this.simplex = new SimplexNoise(this.seed);
        console.log('Seed :', this.seed);
    }

    /**
     * A random periodic function (R -> R)
     * @param {number} x The function var
     * @return {number} The function image
     */
    periodicFunction(x) {
        let value = Math.cos(x);
        for (let i = 2; i < this.amplitude + 1; i++) {
            value += (1 / 2) * Math.cos(i * x + i * Math.log(i));
        }
        return Math.abs(value);
    }

    /**
     * Get the height coefficient to smooth the beach
     * @param {number} r The distance between the current point and the origin
     * @param {number} max_r The max distance between the origin and the farest point in the same line
     * @return {number} The height coefficient
     */
    smoothBeach(r, max_r) {
        return Math.pow(r, 2) / Math.pow(max_r - (this.minRadius - Config.d2.beachMinSize), 2)
    }

    /**
     * Give the block type by its coord
     * @param {number} x The block X
     * @param {number} y The block Y
     * @param {number} z The block Z
     * @return {Type} The block type
     */
    generationFunction(x, y, z) {
        const origin = {x: 0, y: 0, z: 0};
        const currentLocation = {x, y, z};

        // Polar coord
        const r = Utils.distanceTo(origin, currentLocation);
        let teta = Utils.getTeta(origin, currentLocation);
        teta = this.mapTeta(teta); // Map teta to a random interval

        // Calcul max radius and height
        const maxR = this.minRadius + this.periodicFunction(teta);
        let maxHeight = this.simplex.noise3D(x / Config.d3.amplitude, z / Config.d3.amplitude, 0.5);
        maxHeight = Utils.map(maxHeight, -1, 1, Config.d3.altitudeMin, Config.d3.altitudeMax);

        // Smooth max height for the beach
        if (r <= maxR && r >= (this.minRadius - Config.d2.beachMinSize)) {
            const toSmooth = Utils.map(r, this.minRadius - Config.d2.beachMinSize, maxR, maxR - (this.minRadius - Config.d2.beachMinSize), 0);
            maxHeight *= this.smoothBeach(toSmooth, maxR);
        }

        // Don't display the block if it's too far from the origin
        if (r > maxR) return Type.Air;
        if (y <= maxHeight) {
            if (maxR - r <= Config.d2.beachMinSize && maxHeight <= Config.d3.beachMaxHeight)
                // The block is near of the sea
                return Type.Sand;
            else {
                // The block is under the first level of grass
                if (y <= maxHeight - 1) return Type.Stone;
                // The block is on the floor
                else return Type.Grass;
            }
        } else return Type.Air;
    }

    /**
     * Map a value with the random interval
     * @param {number} value The value to map
     * @return {number} The mapped value
     */
    mapTeta(value) {
        return Utils.map(value, 0, 2 * Math.PI, -this.interval, 2 * Math.PI - this.interval);
    }

    /**
     * Set a given seed and update amplitude and interval
     * @param {string} s The seed to set
     */
    setSeed(s) {
        this.seed = s;
        this.simplex = new SimplexNoise(this.seed);
        this.amplitude = Number(s.substring(0, 2));
        this.interval = Number(s.substring(2)) * Math.pow(10, -12);
        console.log('New seed :', this.seed);
    }

    /*
     * DEBUG : Print the random periodic function to the console
     */
    printPeriodicFunction() {
        let value = 'cos(x)';
        for (let i = 2; i < this.amplitude + 1; i++) {
            value += ' + (1 / 2) * cos(' + i + ' * x + ' + i + ' * ln(' + i + '))';
        }
        console.log(value);
    }
}