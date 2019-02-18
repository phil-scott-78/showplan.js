module.exports = {
  publicPath: process.env.VUE_APP_EMBED ? '' : './',
  css: {
    extract: process.env.VUE_APP_EMBED ? false : process.env.NODE_ENV === 'production',
  }
}
