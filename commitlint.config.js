export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 允许更灵活的 scope 和 subject 长度
    'scope-case': [2, 'always', ['lower-case', 'camel-case', 'kebab-case']],
    'subject-case': [0], // 不限制 subject 大小写
  },
};
