const BOARD_SIZE = 52;

// Absolute indices on the board ring that are safe
const SAFE_ZONES = [0, 8, 13, 21, 26, 34, 39, 47];

// Where each color enters the board (index 0 for their path, mapped to absolute board index)
const START_POSITIONS = {
    red: 0,
    green: 13,
    yellow: 26,
    blue: 39
};

// The last square before entering the home stretch
const HOME_STRETCH_START = {
    red: 50,
    green: 11,
    yellow: 24,
    blue: 37
};

module.exports = {
    BOARD_SIZE,
    SAFE_ZONES,
    START_POSITIONS,
    HOME_STRETCH_START
};
