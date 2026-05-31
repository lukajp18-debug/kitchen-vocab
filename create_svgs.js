const fs = require('fs');
const path = require('path');

const vacationDir = path.join(__dirname, 'public', 'images', 'vacation');
const rewardsDir = path.join(__dirname, 'public', 'images', 'rewards');

if (!fs.existsSync(rewardsDir)) fs.mkdirSync(rewardsDir, { recursive: true });

const createSvg = (emoji, filepath) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <text y=".9em" font-size="85" text-anchor="middle" x="50">${emoji}</text>
</svg>`;
  fs.writeFileSync(filepath, svg);
};

// Words
createSvg('👒', path.join(vacationDir, 'hat.svg'));
createSvg('✈️', path.join(vacationDir, 'vacation.svg'));
createSvg('🧳', path.join(vacationDir, 'suitcase.svg'));
createSvg('🏊‍♂️', path.join(vacationDir, 'pool.svg'));

// Rewards
createSvg('🍦', path.join(rewardsDir, 'icecream.svg'));
createSvg('🍩', path.join(rewardsDir, 'floatie.svg'));
createSvg('🔫', path.join(rewardsDir, 'watergun.svg'));

console.log('SVGs created successfully.');
