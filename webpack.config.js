const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const glob = require('glob');

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
    plugins: [
        new CleanWebpackPlugin(),
        // Dynamically create an HTML file for each .html file in src (including subfolders)
        ...glob.sync('./src/**/*.html').map((htmlFile) => {
          
            const name = path.relative('./src', htmlFile); // Maintain folder structure
            const chunkName = name.replace(/\/?index\.html$/, '') || "index"; // Match the JS entry name
            
            console.log(name, chunkName)
            return new HtmlWebpackPlugin({
                template: htmlFile,
                filename: name, // Output the HTML file with the same folder structure
               
            });
        }),
    ],
    mode: 'development', // Change to 'production' for production builds
    devServer: {
      static: {
        directory: path.join(__dirname, 'dist'),
      },
      port: 3000, // The port you want to use
      open: true,
      hot:true,
      liveReload: true
    }
};
