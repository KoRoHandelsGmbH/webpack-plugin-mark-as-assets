const { toKebabCase, hasProperty } = require('./utils');
const { PLUGIN_NAME, WEBPACK_COPY_AFTER_BUILD_PLUGIN_NAME } = require('./consts');

/**
 * Webpack plugin which allows you to mark your Shopware 6 plugins as assets,
 * so they're excluded from Shopware's all.js. The bundled JavaScript file can be 
 * included in your storefront theme where you want it.
 *
 * @example PascalCase plugin name
 * new MarkPluginsAsAssets({
 *    plugins: ['KoroProductOrigin']
 * }
 *
 * @example Kebab case plugin name
 * new MarkPluginsAsAssets({
 *    plugins: ['koro-product-origin']
 * }
 * @class WebpackMarkPluginsAsAssets
 */
class WebpackMarkPluginsAsAssets {
    
    /**
     * Constructor of the plugin. It validates the necessary plugin options
     *
     * @constructor
     * @param {{plugins: string[]}}} options - Plugin options
     */
    constructor(options) {
        this.options = options;

        if (!hasProperty(this.options, 'plugins')) {
            console.log();
            console.error(
                `[${PLUGIN_NAME}] Missing option "plugins". Please define plugin 
names which should be handled as assets, so they're not getting
merged together in an "all.js" file from Shopware.

The plugin names can either be kebab case or pascal case e.g.:

new MarkPluginsAsAssets({
    plugins: [ 'koro-extension', 'KoroProductOrigin' ]
});`
            );
            process.exit(1);
        }
    }

    /**
     * Applies the plugin to the Webpack building pipeline.
     * It taps into the `afterPlugins` hook and rewrites the paths of the
     * WebpackCopyAfterBuild plugin.
     *
     * @param {Webpack.Compiler} compiler 
     */
    apply(compiler) {
        const pluginsToTransform = this.transformNames(this.options.plugins);

        compiler.hooks.afterPlugins.tap(PLUGIN_NAME, () => {
            compiler.options.plugins.forEach((plugin) => {
                if (plugin.constructor.name !== WEBPACK_COPY_AFTER_BUILD_PLUGIN_NAME) {
                    return;
                }

                const {
                    success: chunkFound,
                    chunkName,
                    destinationPath
                } = pluginsToTransform.reduce((accumulator, name) => {
                    if (accumulator.success) {
                        return accumulator;
                    }

                    if (plugin._filesMap.has(name)) {
                        accumulator = {
                            success: true,
                            chunkName: name,
                            destinationPath: plugin._filesMap.get(name)
                        }
                    }

                    return accumulator;
                }, {  success: false, chunkName: null, destinationPath: null });

                if (!chunkFound) {
                    return;
                }

                const transformedDestinationPath = destinationPath.replace(
                    'app/storefront/dist/storefront/',
                    'public/storefront/'
                );

                plugin._filesMap.set(chunkName, transformedDestinationPath);
            });
        });
    }

    /**
     * Transforms names to kebab case.
     * @param {string[]} names - Names which should be transformed 
     * @returns {string[]}
     */
    transformNames(names) {
        return names.map((name) => {
            return toKebabCase(name);
        });
    }
}

module.exports = WebpackMarkPluginsAsAssets;