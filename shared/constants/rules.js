// shared/constants/rules.js
// Ludo game logic: valid moves, capture detection, win condition, safe zones.

const TURN_ORDER = ['red', 'green', 'yellow', 'blue'];

// Starting positions on the board (0‑based index on the 52‑cell main path)
const START_OFFSETS = {
    red: 0,
    green: 13,
    yellow: 26,
    blue: 39
};

// Safe tile indices (★) – positions where a token cannot be captured
const SAFE_ZONES = [0, 8, 13, 21, 26, 34, 39, 47];

// Home stretch length for each colour (after completing the 52 main cells)
const HOME_STRETCH_LENGTH = 6; // positions 51‑56 represent home

/**
 * Checks if a token can move by the given dice roll.
 * @param {Object} token - { position: number } (‑1 = in yard, 0‑56 on board)
 * @param {number} roll - 1‑6
 * @returns {boolean}
 */
function isValidMove(token, roll) {
    if (token.position === -1) {
        return roll === 6; // can only exit yard on a six
    }
    const newPos = token.position + roll;
    return newPos <= 56; // cannot go beyond home
}

/**
 * Checks if moving a token to a position captures an opponent token.
 * @param {string} color - moving player's color
 * @param {number} newPosition - position after move (0‑56)
 * @param {Object} allTokens - { red: [], green: [], yellow: [], blue: [] }
 * @returns {Object | null} - { color, index } of captured token, or null
 */
function isCapture(color, newPosition, allTokens) {
    if (newPosition === 56) return null; // home is safe
    if (newPosition === -1) return null; // cannot capture in yard

    // Determine absolute tile index (0‑51) on the main board
    const startOffset = START_OFFSETS[color];
    const absolutePos = (startOffset + newPosition) % 52;

    // Check SAFE_ZONES – no capture on safe tiles
    if (SAFE_ZONES.includes(absolutePos)) return null;

    // Loop through all opponent colours
    for (const oppColor of TURN_ORDER) {
        if (oppColor === color) continue;
        for (let idx = 0; idx < allTokens[oppColor].length; idx++) {
            const token = allTokens[oppColor][idx];
            if (token.position === -1) continue; // token in yard – cannot be captured
            const oppStart = START_OFFSETS[oppColor];
            const oppAbsolute = (oppStart + token.position) % 52;
            if (oppAbsolute === absolutePos && token.position !== 56) {
                return { color: oppColor, index: idx };
            }
        }
    }
    return null;
}

/**
 * Checks if a player has won (all four tokens at home, position 56).
 * @param {Array} tokens - array of token objects for one colour
 * @returns {boolean}
 */
function checkWinCondition(tokens) {
    return tokens.every(token => token.position === 56);
}

module.exports = {
    TURN_ORDER,
    START_OFFSETS,
    SAFE_ZONES,
    HOME_STRETCH_LENGTH,
    isValidMove,
    isCapture,
    checkWinCondition
};