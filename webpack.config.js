const path = require('path');
const glob = require('glob');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    // Dynamically find all JS files in the src/js folder
    entry: glob.sync('./src/js/*.js').reduce((entries, file) => {
        const name = path.basename(file, '.js'); // Use filename as entry key
        entries[name] = file;
        return entries;
    }, {}),
    output: {
        filename: 'js/[name].bundle.js', // Output JS bundles under the `js/` folder in dist
        path: path.resolve(__dirname, 'dist'),
    },
    // plugins: [new CleanWebpackPlugin()],
    mode: 'development', // Change to 'production' for production builds
    devServer: {
      static: {
        directory: path.join(__dirname, 'dist'),
      },
      port: 4000, // The port you want to use
      open: true,
      hot:true,
      liveReload: true
    }
};
