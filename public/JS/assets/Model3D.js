/* -------------------------------------------------------------------------- */
/*                   List all of 3D models used in the game                   */
/* -------------------------------------------------------------------------- */
export const Model3D = {
    Palmer: {
        modelName: 'palmer.glb',
        model: null,
        scale: 0.7,
        position: [0, -0.5, 0],
        hitbox: [
            [0, 0, 0],
            [0, 0, 1],
            [0, 1, 0],
            [0, 1, 1],
            [0, 2, 1],
            [0, 3, 1],
            [0, 3, 0],
            [0, 4, 1],
            [0, 4, 0],
            [0, 4, -1],
            [1, 4, 0],
            [1, 4, 1],
            [1, 3, 0],
            [1, 3, 1],
            [-1, 4, 0],
            [-1, 4, 1],
            [-1, 3, 0],
            [0, 4, 2],
            [0, 3, 2]
        ]
    },
    Tree: {
        modelName: 'tree.glb',
        model: null,
        scale: 1.3,
        position: [0, 0, 0],
        hitbox: [
            [0, 0, 0]
        ]
    },
    Rock: {
        modelName: 'rock.glb',
        model: null,
        scale: 1,
        position: [0, -0.5, 0],
        hitbox: [
            [0, 0, 0],
            [1, 0, 0],
            [0, 0, -1],
            [1, 0, -1]
        ]
    },
    Bush: {
        modelName: 'bush.glb',
        model: null,
        scale: 1,
        position: [0, -0.5, 0],
        hitbox: [
            [0, 0, 0],
            [1, 0, 0],
            [0, 0, -1],
            [1, 0, -1],
            [0, 1, 0],
            [1, 1, 0],
            [0, 1, -1],
            [1, 1, -1]
        ]
    }
};