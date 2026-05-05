# 🎲 Ludo Flux

**Ludo Flux** is a premium, real-time multiplayer Ludo web application featuring a stunning 3D "claymorphic" aesthetic, a virtual economy, and buttery-smooth physics-based animations.

![Ludo Flux Banner](https://img.shields.io/badge/Status-Complete-success?style=for-the-badge)

## 🌟 Key Features

### 1. 🎨 Claymorphism Aesthetic
Ludo Flux abandons the traditional flat 2D board for a modern, tactile interface:
- **3D Soft UI**: Custom CSS drop-shadows and inner-shadows create a pillowy, extruded plastic feel.
- **Dynamic Tokens**: Game pieces are rendered with internal layering and Framer Motion physics, reacting satisfyingly to hover and click events.
- **Physics Dice**: The 3D animated dice dynamically rolls and bounces using spring physics.

### 2. ⚔️ Fully Realized Game Engine
The backend operates a mathematically rigorous Ludo rule engine:
- **Accurate Geometry**: Tokens navigate a precise 52-tile main path before seamlessly merging into their specific 5-tile colored home stretches.
- **Combat Mechanics**: Landing on opponents captures their token, sending them back to base while granting you a bonus roll.
- **Safe Zones**: Standard Ludo Star tiles (★) protect tokens from being captured.
- **Auto-Pass Logic**: The server detects if you are mathematically blocked from moving and instantly passes your turn to maintain game momentum.

### 3. 🌐 Real-Time Multiplayer
Powered by Node.js, Socket.io, and Redis (mocked via SQLite for local dev):
- **Rooms & Lobbies**: Create private, secure 4-letter room codes or join the public 'GLOBAL' matchmaking queue.
- **Instant Synchronization**: Game state is synchronized across all clients with sub-100ms latency.
- **Quick Chat**: A slide-out ephemeral chat drawer allows players to communicate via text or fast-action emojis without cluttering the board.

### 4. 🪙 Virtual Economy
- **Daily Spin Wheel**: A conic-gradient animated reward wheel allows players to earn daily 🪙 Coins.
- **Buy-ins**: Joining a Global Match costs 100 🪙 Coins, introducing stakes to the gameplay.

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- npm or yarn

### Installation
1. Navigate to the server and install dependencies:
   ```bash
   cd server
   npm install
   ```
2. Navigate to the client and install dependencies:
   ```bash
   cd ../client
   npm install
   ```

### Running the Application (Development)
You will need two terminal windows:

**Terminal 1 (Backend Server):**
```bash
cd server
npm start
```
*The WebSocket server will start on port 3001 and run necessary SQLite migrations.*

**Terminal 2 (Vite Frontend):**
```bash
cd client
npm run dev
```
*The React application will be available at `http://localhost:5173`.*

## 🏗️ Technology Stack
- **Frontend**: React, Vite, Tailwind CSS, Framer Motion, Zustand.
- **Backend**: Node.js, Express, Socket.io, SQLite (via Better-SQLite3), Argon2.

---
*Built as a next-generation exploration into tactile web interfaces.*
