import {
    Config
} from './Config.js';
import {
    Type
} from './Type.js';

export const Utils = {
    /**
     * Get the distance between two points
     * @param {Object} p1 The first point
     * @param {Object} p2 The second point
     * @param {Boolean} [is3d=false] Check if we want to work with 2D or 3D
     * @return {number} The distance between the two given points
     */
    distanceTo(p1, p2, is3d = false) {
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + (is3d ? Math.pow(p1.y - p2.y, 2) : 0) + Math.pow(p1.z - p2.z, 2));
    },

    /**
     * Get angle between two points
     * @param {Object} p1 The first point
     * @param {Object} p2 The second point
     * @return {number} The angle between the two given points
     */
    getTeta(p1, p2, verbose = false) {
        if (verbose) console.log(p1, p2);
        const x = p2.x - p1.x;
        const z = p2.z - p1.z;
        let teta = Math.atan(z / x);
        if (x < 0 && z > 0) // ]90; 180[
            teta = Utils.map(teta, -Math.PI / 2, 0, Math.PI / 2, Math.PI);
        else if (x < 0 && z <= 0) // [180; 270[
            teta = Utils.map(teta, 0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2);
        else if (x >= 0 && z < 0) // [270; 360[
            teta = Utils.map(teta, -Math.PI / 2, 0, (3 * Math.PI) / 2, 2 * Math.PI);
        return teta;
    },

    /**
     * Map a value from a start interval to an other interval
     * @param {number} x The value to map
     * @param {number} in_min The start interval minimum
     * @param {number} in_max The start interval maximum
     * @param {number} out_min The final interval minimum
     * @param {number} out_max The final interval maximum
     * @return {number} The mapped value
     */
    map(x, in_min, in_max, out_min, out_max) {
        return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    },

    /**
     * Convert radian angle to degree
     * @param {number} radian Radian value
     * @return {number} Degree value
     */
    toDegree(radian) {
        return radian * (180 / Math.PI)
    },

    RandomGenerator: class {
        constructor(minRadius, maxRadius) {
            const maxAmplitude = maxRadius - minRadius;
            this.minRadius = minRadius;
            this.maxRadius = maxRadius;
            this.amplitude = Math.floor(Math.random() * (maxAmplitude - Config.d2.amplitudeMin)) + Config.d2.amplitudeMin;
            this.interval = Math.random() * (2 * Math.PI);
            this.interval = Math.floor(this.interval * Math.pow(10, 12));
            this.seed = String(this.amplitude) + this.interval;
            this.interval *= Math.pow(10, -12);
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
            return Math.pow(r, 2) / Math.pow(max_r - (this.minRadius - Config.d3.beachMinSize), 2)
        }

        /**
         * Give the block type by its coord
         * @param {number} x The block X
         * @param {number} y The block Y
         * @param {number} z The block Z
         * @return {Type} The block type
         */
        generationFunction(x, y, z) {
            const origin = {
                x: 0,
                y: 0,
                z: 0
            };
            const currentLocation = {
                x,
                y,
                z
            };

            // Polar coord
            const r = Utils.distanceTo(origin, currentLocation);
            let teta = Utils.getTeta(origin, currentLocation);
            teta = this.mapTeta(teta);
            const max_r = this.minRadius + this.periodicFunction(teta);
            let h = this.simplex.noise3D(x / Config.d3.amplitude, z / Config.d3.amplitude, 0.5);
            h = Utils.map(h, -1, 1, Config.d3.altitudeMin, Config.d3.altitudeMax);
            if (r <= max_r && r >= (this.minRadius - Config.d3.beachMinSize)) {
                h *= this.smoothBeach(
                    Utils.map(r, this.minRadius - Config.d3.beachMinSize, max_r, max_r - (this.minRadius - Config.d3.beachMinSize), 0),
                    max_r
                );
            }

            if (r > max_r) return Type.Air;
            if (y <= h) {
                if (max_r - r <= 3) return Type.Sand;
                else {
                    if (y <= h - 1) return Type.Stone;
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
         * DEBUG
         */
        printPeriodicFunction() {
            let value = 'cos(x)';
            for (let i = 2; i < this.amplitude + 1; i++) {
                value += ' + (1 / 2) * cos(' + i + ' * x + ' + i + ' * ln(' + i + '))';
            }
            console.log(value);
        }
    }
};