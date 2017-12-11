module.exports = {
  type: 'react-component',
  npm: {
    esModules: true,
    umd: {
      global: 'n',
      externals: {
        react: 'React'
      }
    }
  }
}
