const express = require('express');
const { getDb } = require('../config/db');
const { authMiddleware } = require('../utils/auth');

const router = express.Router();

// Get the shop catalog and user's inventory
router.get('/', authMiddleware, async (req, res) => {
    try {
        const db = await getDb();
        const userUid = req.user.uid;

        const shopItems = await db.all('SELECT * FROM shop_items ORDER BY price ASC');
        const inventory = await db.all('SELECT item_key, acquired_at FROM user_inventory WHERE user_uid = ?', [userUid]);
        
        // Return a map of owned items for easy frontend lookup
        const ownedKeys = inventory.map(item => item.item_key);

        res.json({
            items: shopItems,
            owned: ownedKeys,
            inventory
        });
    } catch (err) {
        console.error('Error fetching shop:', err);
        res.status(500).json({ error: 'Failed to fetch shop data' });
    }
});

// Buy an item
router.post('/buy', authMiddleware, async (req, res) => {
    try {
        const { item_key } = req.body;
        const userUid = req.user.uid;
        const db = await getDb();

        if (!item_key) {
            return res.status(400).json({ error: 'item_key is required' });
        }

        const item = await db.get('SELECT * FROM shop_items WHERE item_key = ?', [item_key]);
        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }

        const user = await db.get('SELECT coins FROM users WHERE uid = ?', [userUid]);
        if (user.coins < item.price) {
            return res.status(400).json({ error: 'Not enough coins' });
        }

        const alreadyOwned = await db.get('SELECT id FROM user_inventory WHERE user_uid = ? AND item_key = ?', [userUid, item_key]);
        if (alreadyOwned) {
            return res.status(400).json({ error: 'Item already owned' });
        }

        // Deduct coins and add to inventory
        await db.run('UPDATE users SET coins = coins - ? WHERE uid = ?', [item.price, userUid]);
        await db.run('INSERT INTO user_inventory (user_uid, item_key) VALUES (?, ?)', [userUid, item_key]);
        await db.run('INSERT INTO coin_transactions (user_uid, amount, reason) VALUES (?, ?, ?)', [userUid, -item.price, `Bought ${item.name}`]);

        const updatedUser = await db.get('SELECT coins FROM users WHERE uid = ?', [userUid]);

        res.json({ success: true, coins: updatedUser.coins, message: `Successfully purchased ${item.name}` });
    } catch (err) {
        console.error('Error buying item:', err);
        res.status(500).json({ error: 'Purchase failed' });
    }
});

module.exports = router;
