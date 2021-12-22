function get(url, callback) {
  const xhr = new XMLHttpRequest();

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status >= 200 && xhr.status < 300) {
      const response = xhr.responseText;

      callback(response);
    }
  };

  xhr.onerror = function () {
    callback();
  };

  xhr.onloadend = function () {
    xhr.status === 404 && callback();
  };

  xhr.timeout = 10000;

  xhr.open("GET", url, true);

  xhr.send();
}

/**
 * @type {Record<string, string>}
 */
const versions = {};

/**
 * @param {string} bundleName
 * @returns
 */
function getVersionFromCache(bundleName) {
  return versions[bundleName];
}

/**
 * @param {string} bundleName
 * @param {string} version
 */
function setVersionToCache(bundleName, version) {
  versions[bundleName] = version;
}

/**
 * @param {string} url
 * @param {string} bundleName
 * @param {(version: string, difference: boolean) => void} callback
 */
function compareAndUpdateNewVersion(url, bundleName, callback) {
  const oldVersion = getVersionFromCache(bundleName);
  const versionUrl = `${url}/versions.json?v=${Date.now()}`;

  get(versionUrl, (text) => {
    const loadedVersions = JSON.parse(text || "{}");
    const version = loadedVersions[bundleName];
    const difference = version && version !== oldVersion;

    if (difference) {
      setVersionToCache(bundleName, version);
    }

    callback(difference ? version : oldVersion, difference);
  });
}

/**
 * @param {string} url
 * @param {string} bundleName
 * @param {string} version
 * @param {(error: Error, bundle: Bundle) => void} callback
 * @template Bundle
 */
function loadBundleWithVersion(url, bundleName, version, callback) {
  const bundleUrl = `${url}/${bundleName}`;

  cc.assetManager.loadBundle(bundleUrl, { version }, callback);
}

/**
 * @param {string} url
 * @param {string} bundleName
 * @param {(error: Error, bundle: Bundle) => void} callback
 * @template Bundle
 */
function loadBundle(url, bundleName, callback, useMd5Cache = true) {
  if (useMd5Cache) {
    compareAndUpdateNewVersion(url, bundleName, (version) => {
      loadBundleWithVersion(url, bundleName, version, callback);
    });
  } else {
    loadBundleWithVersion(url, bundleName, null, callback);
  }
}

/**
 * @param {string} url
 * @param {string} bundleName
 * @param {string} assetPath
 * @param {cc.Asset} assetType
 * @param {(asset: AssetType) => void} callback
 * @template AssetType
 */
function loadRemoteAsset(
  url,
  bundleName,
  assetPath,
  assetType,
  callback,
  useMd5Cache = true
) {
  const onLoadedBundle = (error, bundle) => {
    error
      ? callback(error)
      : bundle && bundle.load(assetPath, assetType, callback);
  };

  loadBundle(url, bundleName, onLoadedBundle, useMd5Cache);
}

/**
 * @param {string} id
 * @returns {{url: string, name: string, useMd5Cache: boolean}}
 */
function getBundleInfo(id) {
  const bundleInfos = window.bundleInfos;

  return bundleInfos && bundleInfos[id];
}

/**
 * @returns {{url: string, name: string, useMd5Cache: boolean}[]}
 */
function getAllBundleInfos() {
  const bundleInfos = window.bundleInfos || {};

  return Object.values(bundleInfos);
}

function init() {
  const bundleInfos = getAllBundleInfos();

  bundleInfos.forEach((info) =>
    loadBundle(info.url, info.name, null, info.useMd5Cache)
  );
}

module.exports = {
  getBundleInfo,
  loadRemoteAsset,
  init,
};
