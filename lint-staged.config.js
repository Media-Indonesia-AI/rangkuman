module.exports = {
  '*.{ts,tsx,js,jsx,mjs,cjs}': ['eslint --fix', 'secretlint'],
  '*.{json,yml,yaml,env,md,html,css}': ['secretlint'],
};