const Redis = require('ioredis');
require('dotenv').config();

const useMock = true; // Use mock without docker

class MockRedis {
  constructor() { this.store = {}; }

  async get(key) {
    const val = this.store[key];
    if (val === undefined) return null;
    // Always return a JSON string (callers always do JSON.parse on the result)
    return typeof val === 'string' ? val : JSON.stringify(val);
  }

  async set(key, val) {
    // Always store the parsed object so we don't double-serialize
    if (typeof val === 'string') {
      try { this.store[key] = JSON.parse(val); }
      catch { this.store[key] = val; }
    } else {
      this.store[key] = val;
    }
  }

  async exists(key) { return this.store[key] !== undefined ? 1 : 0; }
  async del(key) { delete this.store[key]; }
  on() {}
}

const redis = useMock ? new MockRedis() : new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
});

if (!useMock) {
  redis.on('error', (err) => {
    console.error('Redis Client Error', err);
  });
}

module.exports = redis;
