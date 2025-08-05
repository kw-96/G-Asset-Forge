export function getCommonConfig(isDevelopment?: boolean): {
    mode: string;
    devtool: string | boolean;
    resolve: {
        extensions: string[];
        alias: {
            '@': string;
            '@main': string;
            '@renderer': string;
            '@shared': string;
            '@assets': string;
        };
    };
    module: {
        rules: {
            test: RegExp;
            use: {
                loader: string;
                options: {
                    transpileOnly: boolean;
                    configFile: string;
                };
            };
            exclude: RegExp;
        }[];
    };
    performance: {
        hints: string | boolean;
        maxAssetSize: number;
        maxEntrypointSize: number;
    };
    stats: string;
};
//# sourceMappingURL=webpack.common.d.ts.map