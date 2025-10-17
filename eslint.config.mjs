// @ts-check
import prettier from 'eslint-config-prettier'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  // Custom rules configuration
  {
    extends: [...prettier.configs],
    rules: {
      'vue/max-attributes-per-line': 'off',
      'vue/no-multiple-template-root': 'off',
      'vue/html-closing-bracket-newline': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      '@stylistic/arrow-parens': 'off',
      '@stylistic/member-delimiter-style': 'off'
    }
  }
)
