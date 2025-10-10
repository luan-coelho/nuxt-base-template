// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  // Custom rules configuration
  {
    rules: {
      'vue/max-attributes-per-line': 'off',
      'vue/no-multiple-template-root': 'off'
    }
  }
)
