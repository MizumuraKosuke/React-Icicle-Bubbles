module.exports = {
  webpack: (conf) => {
    conf.module.rules.push({
      test: /\.(glsl|frag|vert)$/,
      exclude: /node_modules/,
      use: [ 'glslify-import-loader', 'raw-loader', 'glslify-loader' ],
    })
    return conf
  },
}
