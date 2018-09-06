var webpack = require('webpack');
var fs = require('fs');
var path = require('path');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
// var UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    "context": process.cwd(),
    "mode": "development",
    "entry": {
        "ratchet": "./bundles/ratchet.js"
        // "handlebars": "./bundles/handlebars.js",
        // "tmpl": "./bundles/tmpl.js",
        // "web": "./bundles/web.js",
        // "gitana": "./bundles/gitana.js",
        // "actions": "./bundles/actions.js",
        // "config": "./bundles/config.js",
        // "messages": "./bundles/messages.js",
    },
    "output": {
        "path": __dirname + "/dist",
        "filename": "components/ratchet/[name].js",
        "libraryTarget": "umd"
    },

    "externals": {
        "jQuery": {
            "commonjs": "jQuery",
            "commonjs2": "jQuery",
            "amd": "jquery",
            "root": "jQuery"
        },
        "Ratchet": "ratchet/ratchet",
        "Handlebars": "Handlebars",
        "Tmpl": "jquery-tmpl",
        "Messages": "ratchet/messages",
        "Config": "ratchet/config",
        "Actions": "ratchet/actions",
        "Gitana": "Gitana",
        "Alpaca": "Alpaca"
    },

    "resolve": {
        "extensions": [".js"],
        // "modules": ['node_modules', 'thirdparty']
        "alias": {
            "base": path.resolve(__dirname, "./thirdparty/base.js")
        }
    },

    "module": {

    },

    "plugins": [
        new CleanWebpackPlugin(["./dist"]),
        new CopyWebpackPlugin([{
            "from": "./examples",
            "to": "examples",
            "ignore": ["**/.DS_Store/*", "**/.idea/*"]
        }, {
            "from": "./dynamic",
            "to": "components/ratchet/dynamic",
            "ignore": ["**/.DS_Store/*", "**/.idea/*"]
        }, {
            "from": "./components/ratchet/web",
            "to": "components/ratchet/web",
            "ignore": ["**/.DS_Store/*", "**/.idea/*"]
        }]),
        new webpack.ProvidePlugin({
            "Base": "base",
            "Handlebars": "Handlebars",
        }),
        new webpack.BannerPlugin(fs.readFileSync("license.txt", "utf8"))
    ]
    //
    // "optimization": {
    //     "minimize": true,
    //     "minimizer": [new UglifyJSPlugin({
    //         "include": /\.min\.js$/
    //     })]
    // }
};
