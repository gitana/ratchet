var webpack = require('webpack');
var fs = require('fs');
var path = require('path');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
//var UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    "context": process.cwd(),
    //"mode": "development",
    "mode": "production",
    "entry": {
        "actions": "./src/ratchet/actions/actions.js",
        "config": "./src/ratchet/config/config.js",
        "ratchet": "./src/ratchet/core/core.js",
        "gitana": "./src/ratchet/gitana/gitana.js",
        "handlebars": "./src/ratchet/handlebars/handlebars.js",
        "messages": "./src/ratchet/messages/messages.js",
        "web": "./src/ratchet/web/web.js"
    },
    "output": {
        "path": __dirname + "/dist",
        "filename": "ratchet/[name].js",
        "libraryTarget": "umd"
    },
    "externals": {
        "jquery": {
            "commonjs": "jquery",
            "commonjs2": "jquery",
            "amd": "jquery",
            "root": "jQuery"
        },
        "handlebars": {
            "commonjs": "handlebars",
            "commonjs2": "handlebars",
            "amd": "handlebars",
            "root": "Handlebars"
        },
        "gitana": {
            "commonjs": "gitana",
            "commonjs2": "gitana",
            "amd": "gitana",
            "root": "Gitana"
        },
        "alpaca": {
            "commonjs": "alpaca",
            "commonjs2": "alpaca",
            "amd": "alpaca",
            "root": "Alpaca"
        },
        "ratchet/ratchet": {
            "commonjs": "ratchet/ratchet",
            "commonjs2": "ratchet/ratchet",
            "amd": "ratchet/ratchet",
            "root": "Ratchet"
        },
        "ratchet/actions": {
            "commonjs": "ratchet/actions",
            "commonjs2": "ratchet/actions",
            "amd": "ratchet/actions",
            "root": "Ratchet"
        },
        "ratchet/config": {
            "commonjs": "ratchet/config",
            "commonjs2": "ratchet/config",
            "amd": "ratchet/config",
            "root": "Ratchet"
        },
        "ratchet/messages": {
            "commonjs": "ratchet/messages",
            "commonjs2": "ratchet/messages",
            "amd": "ratchet/messages",
            "root": "Ratchet"
        }
    },
    "resolve": {
        "extensions": [".js"],
        "alias": {
            "thirdparty": path.resolve(__dirname, "./thirdparty"),
            "base": path.resolve(__dirname, "./thirdparty/base.js")
        }
    },
    "plugins": [
        new CleanWebpackPlugin(["./dist"]),
        new CopyWebpackPlugin([{
            "from": "./examples",
            "to": "examples",
            "ignore": ["**/.DS_Store/*", "**/.idea/*"]
        }, {
            "from": "./dynamic",
            "to": "ratchet/dynamic",
            "ignore": ["**/.DS_Store/*", "**/.idea/*"]
        }, {
            "from": "./tests",
            "to": "tests",
            "ignore": ["**/.DS_Store/*", "**/.idea/*"]
        }, {
            "from": "./index.html",
            "to": "index.html"
        }]),
        //new webpack.ProvidePlugin({
        //    "Base": "base",
        //    "Handlebars": "Handlebars"
        //}),
        new webpack.BannerPlugin(fs.readFileSync("src/license/license.txt", "utf8"))
    ],

    /*
    "optimization": {
        "minimize": true,
        "minimizer": [new UglifyJSPlugin({
            //"include": /\.min\.js$/
            test: /\.js($|\?)/i
        })]
    }*/

    /** We leave optimization OFF so that we have debugging capabilities available in ui-server **/
    /** This will get uglified laterby ui-server build **/
    "optimization": {
        "minimize": false
    }
};
