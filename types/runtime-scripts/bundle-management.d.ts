interface IAdapter<T> {
    (): T;
}
interface IListener {
    onVersionChanged(oldVersion: string, newVersion: string): void;
}
interface IBundle {
    load<T>(path: string, type: unknown, onProgress: (finish: number, total: number) => void, onComplete: (error: Error, asset: T) => void): void;
}
interface IAssetManager {
    loadBundle(nameOrUrl: string, options: Record<string, any>, onComplete: (err: Error, bundle: IBundle) => void): void;
}
interface IBundleManagerAdapters {
    http?: IAdapter<{
        get: <TResult>(url: string) => Promise<TResult>;
    }>;
    assetManager?: IAdapter<IAssetManager>;
}
interface ILoadAssetOptions {
    bundleId: string;
    path: string;
    type: unknown;
    pathForDevMode?: string;
    onProgress?: (finish: number, total: number) => void;
}
declare global {
    const CC_EDITOR: boolean;
    const Editor: any;
    const cc: any;
    export interface Window {
        bundleManagement: {
            bundles?: Record<string, {
                name: string;
                url: string;
                useMd5Cache: boolean;
                dependencies?: string[];
            }>;
        };
    }
}
interface IBundleManagerOptions {
    adapters: IBundleManagerAdapters;
    listeners?: IListener[];
    cacheDuration?: number;
}
export declare class BundleManager {
    private readonly listeners;
    private readonly adapters;
    private readonly versions;
    private static instance;
    private readonly cache;
    constructor(options: IBundleManagerOptions);
    static initialize(options: IBundleManagerOptions): void;
    static getInstance(options?: IBundleManagerOptions): BundleManager;
    getBundleInfo(id: string): {
        name: string;
        url: string;
        useMd5Cache: boolean;
        dependencies?: string[];
    };
    loadBundle(bundleId: string): Promise<IBundle>;
    loadAsset<T>(options: ILoadAssetOptions): Promise<T>;
    protected compareAndUpdateNewVersion(bundleId: string): Promise<void>;
}
export {};
