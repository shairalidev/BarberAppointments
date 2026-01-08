module.exports = {
  devServer: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: 'all'
  },
  css: {
    extract: {
      ignoreOrder: true
    }
  },
  configureWebpack: {
    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10
          }
        }
      }
    }
  },
  chainWebpack: config => {
    config.plugin('html').tap(args => {
      args[0].title = 'ATES BARBEROS'
      return args
    })
  }
}
