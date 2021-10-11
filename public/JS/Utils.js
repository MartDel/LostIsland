const AMPLITUDE_MIN = 10;
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
        constructor(maxAmplitude) {
            this.amplitude = Math.floor(Math.random() * (maxAmplitude - AMPLITUDE_MIN)) + AMPLITUDE_MIN;
            this.interval = Math.random() * (2 * Math.PI);
            console.log('Seed', this.amplitude, this.interval);
            let value = 'cos(x)';
            for (let i = 2; i < this.amplitude + 1; i++) {
                value += ' + (1 / 2) * cos(' + i + ' * x + ' + i + ' * ln(' + i + '))';
            }
            console.log(value);
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
         * Map a value with the random interval
         * @param {number} value The value to map
         * @return {number} The mapped value
         */
        map(value) {
            return Utils.map(value, 0, 2 * Math.PI, 0, this.interval);
        }
    }
};