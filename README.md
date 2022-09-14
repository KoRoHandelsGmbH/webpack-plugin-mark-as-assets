# Webpack Plugin - Mark plugin as assets

Webpack plugin which allows you to mark your Shopware 6 plugins as assets, so they're excluded from Shopware's all.js. The bundled JavaScript file can be included in your storefront theme where you want it.

## Usage

Install the plugin as one of your NPM dev dependencies:

```bash
npm installl --save-dev @korodrogerie/webpack-plugin-mark-as-assets
```

Now create a new file called `storefront/build/webpack.config.js` to extend Shopware's Webpack building pipeline. Next up, extend the default Webpack configuration and add the plugin to it:

```js
module.exports = ({ config }) => {
    config.plugins.push(new MarkPluginsAsAssets({
        plugins: ['KoroProductOrigin']
    }));
}
```

The plugin requires an array of plugins which should be transformed. After the next `./psh.phar storefront:build` / `bin/build-storefront.sh` you're finding a new folder `storefront` inside the `public` folder of your Shopware 6 plugin.

### Usage in theme / template file

After copying the assets using the command `bin/console assets:install` you can use the Twig function `{{ assets() }}` to include your bundled JavaScript wherever you want to:

```twig
{{ asset('bundles/yourpluginname/yourpluginname.js') }}
```

## How it works

Shopware uses their own Webpack plugin called `WebpackCopyAfterBuild` which copies bundled JavaScript files from the `storefront` module to your Shopware 6 plugin. Afterwards Shopware collects all bundled JavaScript plugins inside a plugin when it's located inside a `dist` folder and compresses all found Shopware 6 plugins together into an `all.js` file.

This Webpack plugin allows you to intercept this behavior of Shopware. The plugin hooks into the step `afterPlugins` hook from Webpack which allows to modify Webpack plugin configurations.

Internally the plugin `WebpackCopyAfterBuild` contains a map containing chunk names and the corresponding destination path of the plugin.

This plugin alters the destination path and prevents Shopware's theme compiliation step to collect the bundled JavaScript files.

## License

Licensed under MIT

Copyright (c) 2020-present [Koro Handels GmbH](https://github.com/KoRoHandelsGmbH/)