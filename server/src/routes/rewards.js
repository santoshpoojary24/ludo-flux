const express = require('express');
const { getDb } = require('../config/db');
const { authMiddleware } = require('../utils/auth');

const router = express.Router();

// Get daily spin status and quests
router.get('/daily', authMiddleware, async (req, res) => {
    try {
        const db = await getDb();
        const userUid = req.user.uid;
        
        const user = await db.get('SELECT last_spin_at FROM users WHERE uid = ?', [userUid]);
        
        let isSpinAvailable = true;
        if (user.last_spin_at) {
            const lastSpinDate = new Date(user.last_spin_at).toISOString().split('T')[0];
            const today = new Date().toISOString().split('T')[0];
            if (lastSpinDate === today) {
                isSpinAvailable = false;
            }
        }

        // Get daily quests
        const todayStr = new Date().toISOString().split('T')[0];
        const quests = await db.all('SELECT * FROM daily_quests');
        
        // Initialize or fetch user progress
        const progress = [];
        for (const quest of quests) {
            let userProg = await db.get(
                'SELECT current_value, is_claimed FROM user_daily_progress WHERE user_uid = ? AND date = ? AND quest_key = ?',
                [userUid, todayStr, quest.quest_key]
            );
            
            if (!userProg) {
                await db.run(
                    'INSERT INTO user_daily_progress (user_uid, date, quest_key, current_value, is_claimed) VALUES (?, ?, ?, 0, 0)',
                    [userUid, todayStr, quest.quest_key]
                );
                userProg = { current_value: 0, is_claimed: 0 };
            }
            
            progress.push({
                ...quest,
                current_value: userProg.current_value,
                is_claimed: Boolean(userProg.is_claimed)
            });
        }

        res.json({
            spin_available: isSpinAvailable,
            last_spin_at: user.last_spin_at,
            quests: progress
        });
    } catch (err) {
        console.error('Error fetching daily rewards:', err);
        res.status(500).json({ error: 'Failed to fetch rewards data' });
    }
});

// Spin the wheel
router.post('/spin', authMiddleware, async (req, res) => {
    try {
        const db = await getDb();
        const userUid = req.user.uid;
        
        const user = await db.get('SELECT last_spin_at FROM users WHERE uid = ?', [userUid]);
        if (user.last_spin_at) {
            const lastSpinDate = new Date(user.last_spin_at).toISOString().split('T')[0];
            const today = new Date().toISOString().split('T')[0];
            if (lastSpinDate === today) {
                return res.status(400).json({ error: 'Already spun today' });
            }
        }

        // Logic for random reward
        const rewards = [
            { type: 'coins', amount: 50, weight: 50 },
            { type: 'coins', amount: 150, weight: 30 },
            { type: 'coins', amount: 500, weight: 15 },
            { type: 'skin', item_key: 'dice_neon', weight: 5 } // Very low chance
        ];

        // Pick reward based on weight
        const totalWeight = rewards.reduce((sum, r) => sum + r.weight, 0);
        let random = Math.floor(Math.random() * totalWeight);
        let selectedReward = rewards[0];
        
        for (const reward of rewards) {
            random -= reward.weight;
            if (random < 0) {
                selectedReward = reward;
                break;
            }
        }

        let rewardMessage = '';
        if (selectedReward.type === 'coins') {
            await db.run('UPDATE users SET coins = coins + ?, last_spin_at = CURRENT_TIMESTAMP WHERE uid = ?', [selectedReward.amount, userUid]);
            await db.run('INSERT INTO coin_transactions (user_uid, amount, reason) VALUES (?, ?, ?)', [userUid, selectedReward.amount, 'Daily Spin Reward']);
            rewardMessage = `Won ${selectedReward.amount} coins!`;
        } else if (selectedReward.type === 'skin') {
            const alreadyOwned = await db.get('SELECT id FROM user_inventory WHERE user_uid = ? AND item_key = ?', [userUid, selectedReward.item_key]);
            if (alreadyOwned) {
                // Give coins instead if they own the skin
                await db.run('UPDATE users SET coins = coins + 500, last_spin_at = CURRENT_TIMESTAMP WHERE uid = ?', [userUid]);
                await db.run('INSERT INTO coin_transactions (user_uid, amount, reason) VALUES (?, ?, ?)', [userUid, 500, 'Daily Spin Duplicate Skin Conversion']);
                rewardMessage = 'Won Neon Dice (Converted to 500 coins duplicate!)';
                selectedReward = { type: 'coins', amount: 500 };
            } else {
                await db.run('UPDATE users SET last_spin_at = CURRENT_TIMESTAMP WHERE uid = ?', [userUid]);
                await db.run('INSERT INTO user_inventory (user_uid, item_key) VALUES (?, ?)', [userUid, selectedReward.item_key]);
                rewardMessage = 'Won a Rare Neon Dice Skin!';
            }
        }

        const updatedUser = await db.get('SELECT coins FROM users WHERE uid = ?', [userUid]);

        res.json({ success: true, reward: selectedReward, message: rewardMessage, new_balance: updatedUser.coins });
    } catch (err) {
        console.error('Error spinning wheel:', err);
        res.status(500).json({ error: 'Failed to spin the wheel' });
    }
});

// Claim a completed quest
router.post('/claim-quest', authMiddleware, async (req, res) => {
    try {
        const { quest_key } = req.body;
        const userUid = req.user.uid;
        const db = await getDb();
        const todayStr = new Date().toISOString().split('T')[0];

        const quest = await db.get('SELECT * FROM daily_quests WHERE quest_key = ?', [quest_key]);
        if (!quest) return res.status(404).json({ error: 'Quest not found' });

        const progress = await db.get(
            'SELECT * FROM user_daily_progress WHERE user_uid = ? AND date = ? AND quest_key = ?',
            [userUid, todayStr, quest_key]
        );

        if (!progress) return res.status(400).json({ error: 'No progress found for today' });
        if (progress.is_claimed) return res.status(400).json({ error: 'Reward already claimed' });
        if (progress.current_value < quest.target_value) return res.status(400).json({ error: 'Quest not yet completed' });

        // Update to claimed and give coins
        await db.run('UPDATE user_daily_progress SET is_claimed = 1 WHERE id = ?', [progress.id]);
        await db.run('UPDATE users SET coins = coins + ? WHERE uid = ?', [quest.reward_coins, userUid]);
        await db.run('INSERT INTO coin_transactions (user_uid, amount, reason) VALUES (?, ?, ?)', [userUid, quest.reward_coins, `Completed quest: ${quest.description}`]);

        const updatedUser = await db.get('SELECT coins FROM users WHERE uid = ?', [userUid]);

        res.json({ success: true, message: `Claimed ${quest.reward_coins} coins!`, new_balance: updatedUser.coins });
    } catch (err) {
        console.error('Error claiming quest:', err);
        res.status(500).json({ error: 'Failed to claim reward' });
    }
});

module.exports = router;
