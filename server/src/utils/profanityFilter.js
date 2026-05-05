const BLOCKLIST = [
  'damn',
  'hell',
  'idiot',
  'stupid',
  'noob',
  'trash',
  'loser'
];

const containsProfanity = (value = '') => {
  const normalized = value.toLowerCase();
  return BLOCKLIST.some((word) => normalized.includes(word));
};

module.exports = {
  BLOCKLIST,
  containsProfanity
};
