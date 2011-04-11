Ratchet.TilesRegistry.register({

    "main": {
        "template": "layouts/main.html",
        "attributes": {
            "head": "common/head.html",
            "footer": "common/footer.html"
        }
    },

    "index": {
        "extends": "main",
        "attributes": {
            "body": "pages/index/body.html"
        }
    },

    "products": {
        "extends": "main",
        "attributes": {
            "body": "pages/products/body.html"
        }
    },

    "services": {
        "extends": "main",
        "attributes": {
            "body": "pages/services/body.html"
        }
    }

});
