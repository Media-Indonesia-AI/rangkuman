module.exports = {
  '*.{ts,tsx,js,jsx,mjs,cjs}': ['eslint --fix', 'prettier --write', 'secretlint'],
  '*.{json,md,css,html,yml,yaml,env,example}': ['prettier --write', 'secretlint'],
};