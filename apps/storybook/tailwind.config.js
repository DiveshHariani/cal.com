const base = require("@calcom/config/tailwind-preset");
module.exports = {
  ...base,
  content: ["../../packages/ui/**/*.{js,ts,jsx,tsx}"],
};
