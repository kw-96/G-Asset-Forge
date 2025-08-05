declare const _exports: {
    resolve: {
        extensions: string[];
        alias: {
            '@': string;
            '@main': string;
            '@renderer': string;
            '@shared': string;
            '@/components': string;
            '@/ui': string;
            '@/canvas': string;
            '@/tools': string;
            '@/panels': string;
            '@/engines': string;
            '@suika': string;
            '@h5-editor': string;
            '@/managers': string;
            '@/canvas-manager': string;
            '@/tools-manager': string;
            '@/history-manager': string;
            '@/assets-manager': string;
            '@/models': string;
            '@/utils': string;
            '@/hooks': string;
            '@/styles': string;
            '@/types': string;
            '@assets': string;
            '@images': string;
            '@fonts': string;
            '@icons': string;
        };
        fallback: {
            events: boolean;
            path: string;
            fs: boolean;
            os: string;
            crypto: boolean;
            stream: string;
            util: string;
            buffer: string;
            assert: string;
            process: string;
            global: string;
            http: boolean;
            https: boolean;
            net: boolean;
            tls: boolean;
            url: string;
            querystring: string;
            child_process: boolean;
            cluster: boolean;
            dgram: boolean;
            dns: boolean;
            module: boolean;
            readline: boolean;
            repl: boolean;
            tty: boolean;
            vm: boolean;
            zlib: boolean;
        };
    };
    module: {
        rules: ({
            test: RegExp;
            use: {
                loader: string;
                options: {
                    transpileOnly: boolean;
                    configFile: string;
                    experimentalWatchApi: boolean;
                    compilerOptions: {
                        isolatedModules: boolean;
                    };
                };
            };
            exclude: RegExp;
            type?: never;
            parser?: never;
        } | {
            test: RegExp;
            use: (string | {
                loader: string;
                options: {
                    modules: {
                        auto: RegExp;
                        localIdentName: string;
                    };
                    lessOptions?: never;
                };
            } | {
                loader: string;
                options: {
                    lessOptions: {
                        javascriptEnabled: boolean;
                        modifyVars: {
                            '@primary-color': string;
                        };
                    };
                    modules?: never;
                };
            })[];
            exclude?: never;
            type?: never;
            parser?: never;
        } | {
            test: RegExp;
            type: string;
            parser: {
                dataUrlCondition: {
                    maxSize: number;
                };
            };
            use?: never;
            exclude?: never;
        } | {
            test: RegExp;
            type: string;
            use?: never;
            exclude?: never;
            parser?: never;
        })[];
    };
    performance: {
        hints: string | boolean;
        maxAssetSize: number;
        maxEntrypointSize: number;
        assetFilter: (assetFilename: any) => boolean;
    };
    optimization: {
        removeAvailableModules: boolean;
        removeEmptyChunks: boolean;
        splitChunks: boolean;
    } | {
        splitChunks: {
            chunks: string;
            cacheGroups: {
                vendor: {
                    test: RegExp;
                    name: string;
                    chunks: string;
                    priority: number;
                };
                engines: {
                    test: RegExp;
                    name: string;
                    chunks: string;
                    priority: number;
                };
                ui: {
                    test: RegExp;
                    name: string;
                    chunks: string;
                    priority: number;
                };
                tools: {
                    test: RegExp;
                    name: string;
                    chunks: string;
                    priority: number;
                };
                managers: {
                    test: RegExp;
                    name: string;
                    chunks: string;
                    priority: number;
                };
            };
        };
    };
};
export = _exports;
//# sourceMappingURL=webpack.renderer.dev.config.d.ts.map