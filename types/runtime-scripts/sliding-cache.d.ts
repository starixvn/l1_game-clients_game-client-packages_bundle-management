/// <reference types="node" />
export interface CacheRecord {
    data: unknown;
    timeout?: NodeJS.Timeout;
    valid: boolean;
}
export declare class SlidingCache {
    private readonly duration;
    private store;
    constructor(duration: number);
    private get;
    private registerAutoClean;
    execute(key: string, fetchData: () => Promise<unknown>): Promise<unknown>;
}
