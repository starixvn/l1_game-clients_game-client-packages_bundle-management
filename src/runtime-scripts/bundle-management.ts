interface IAdapter<T> {
  (): T;
}

interface IListener {
  onVersionChanged(oldVersion: string, newVersion: string): void;
}

interface IBundle {
  load<T>(
    path: string,
    type: unknown,
    onProgress: (finish: number, total: number) => void,
    onComplete: (error: Error, asset: T) => void
  ): void;
}

interface IAssetManager {
  loadBundle(nameOrUrl: string, options: Record<string, any>, onComplete: (err: Error, bundle: IBundle) => void): void;
}

interface IBundleManagerAdapters {
  http?: IAdapter<{ get: <TResult>(url: string) => Promise<TResult> }>;
  assetManager?: IAdapter<IAssetManager>;
}

interface ILoadAssetOptions {
  bundleId: string;
  path: string;
  type: unknown;
  onProgress?: (finish: number, total: number) => void;
}

declare global {
  export interface Window {
    bundleInfos: Record<string, { name: string; url: string; useMd5Cache: boolean }>;
  }
}

interface IBundleManagerOptions {
  adapters: IBundleManagerAdapters;
  listeners: IListener[];
}

export class BundleManager {
  private readonly listeners: IListener[];
  private readonly adapters: IBundleManagerAdapters;
  private readonly versions: Record<string, string>;
  private static instance: BundleManager;

  constructor(options: IBundleManagerOptions) {
    this.listeners = options.listeners || [];
    this.adapters = options.adapters;
    this.versions = {};
  }

  public static initialize(options: IBundleManagerOptions) {
    if (!BundleManager.instance) {
      BundleManager.instance = new BundleManager(options);
    }
  }

  public static getInstance(options?: IBundleManagerOptions) {
    if (!BundleManager.instance) {
      BundleManager.initialize(options);
    }

    return BundleManager.instance;
  }

  public getBundleInfo(id: string) {
    const bundleInfos = window.bundleInfos;

    if (!bundleInfos || !bundleInfos[id]) {
      throw new Error(`Not found bundle '${id}'.`);
    }

    return bundleInfos && bundleInfos[id];
  }

  public async loadBundle(bundleId: string): Promise<IBundle> {
    const assertManager = this.adapters.assetManager();
    const { name, url, useMd5Cache } = this.getBundleInfo(bundleId);
    const bundleUrl = `${url}/${name}`;

    if (useMd5Cache) {
      await this.compareAndUpdateNewVersion(bundleId);
    }

    return new Promise<IBundle>((resolve, reject) => {
      const version = this.versions[name];

      assertManager.loadBundle(bundleUrl, { version }, (error, bundle) => {
        error ? reject(error) : resolve(bundle);
      });
    });
  }

  public async loadAsset<T>(options: ILoadAssetOptions): Promise<T> {
    if (!options.path || !options.type || !options.bundleId) {
      throw new Error(`Invalid arguments: ${options}`);
    }

    const { bundleId, path, type, onProgress } = options;
    const bundle = await this.loadBundle(bundleId);

    return new Promise<T>((resolve, reject) => {
      bundle.load<T>(path, type, onProgress, (error, asset) => {
        error ? reject(error) : resolve(asset);
      });
    });
  }

  protected async compareAndUpdateNewVersion(bundleId: string) {
    const { name, url } = this.getBundleInfo(bundleId);
    const http = this.adapters.http();
    const versionUrl = `${url}/versions.json?v=${Date.now()}`;
    const versions = await http.get<Record<string, string>>(versionUrl);

    const oldVersion = this.versions[name];
    const currentVersion = versions[name];
    const difference = currentVersion && currentVersion !== oldVersion;

    if (difference) {
      this.versions[name] = currentVersion;
      this.listeners.forEach((listener) => listener.onVersionChanged(oldVersion, currentVersion));
    }
  }
}
