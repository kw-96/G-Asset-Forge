export let preset: string;
export let testEnvironment: string;
export let roots: string[];
export let testMatch: string[];
export let transform: {
    '^.+\\.(ts|tsx)$': string;
};
export let collectCoverageFrom: string[];
export let setupFilesAfterEnv: string[];
export let moduleNameMapping: {
    '^@/(.*)$': string;
    '\\.(css|less|scss|sass)$': string;
};
export let testPathIgnorePatterns: string[];
export let coverageDirectory: string;
export let coverageReporters: string[];
//# sourceMappingURL=jest.config.d.ts.map