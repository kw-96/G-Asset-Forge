export namespace commonConfig {
    export namespace resolve {
        let extensions: string[];
        let alias: {
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
        namespace fallback {
            let events: boolean;
            let path: string;
            let fs: boolean;
            let os: string;
            let crypto: boolean;
            let stream: string;
            let util: string;
            let buffer: string;
            let assert: string;
            let process: string;
            let global: string;
            let http: boolean;
            let https: boolean;
            let net: boolean;
            let tls: boolean;
            let url: string;
            let querystring: string;
            let child_process: boolean;
            let cluster: boolean;
            let dgram: boolean;
            let dns: boolean;
            let module: boolean;
            let readline: boolean;
            let repl: boolean;
            let tty: boolean;
            let vm: boolean;
            let zlib: boolean;
        }
    }
    export namespace module_1 {
        let rules: ({
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
    }
    export { module_1 as module };
    export namespace performance {
        let hints: string | boolean;
        let maxAssetSize: number;
        let maxEntrypointSize: number;
        function assetFilter(assetFilename: any): boolean;
    }
    export let optimization: {
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
}
import { merge } from "webpack-merge";
export { merge };
//# sourceMappingURL=webpack.config.d.ts.map