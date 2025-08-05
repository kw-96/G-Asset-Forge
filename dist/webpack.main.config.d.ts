declare function _exports(env: any, argv: any): {
    devtool: string;
    optimization: {
        minimize: boolean;
    };
    mode: string;
    target: string;
    entry: {
        main: string;
        preload: string;
    };
    output: {
        path: string;
        filename: string;
    };
    resolve: {
        extensions: string[];
        alias: {
            '@': string;
        };
        fallback: {
            global: string;
        };
    };
    plugins: webpack.ProvidePlugin[];
    module: {
        rules: {
            test: RegExp;
            use: string;
            exclude: RegExp;
        }[];
    };
    node: {
        __dirname: boolean;
        __filename: boolean;
    };
    externals: {
        sharp: string;
        'fs-extra': string;
    };
} | {
    devtool: boolean;
    optimization: {
        minimize: boolean;
    };
    mode: string;
    target: string;
    entry: {
        main: string;
        preload: string;
    };
    output: {
        path: string;
        filename: string;
    };
    resolve: {
        extensions: string[];
        alias: {
            '@': string;
        };
        fallback: {
            global: string;
        };
    };
    plugins: webpack.ProvidePlugin[];
    module: {
        rules: {
            test: RegExp;
            use: string;
            exclude: RegExp;
        }[];
    };
    node: {
        __dirname: boolean;
        __filename: boolean;
    };
    externals: {
        sharp: string;
        'fs-extra': string;
    };
};
export = _exports;
import webpack = require("webpack");
//# sourceMappingURL=webpack.main.config.d.ts.map