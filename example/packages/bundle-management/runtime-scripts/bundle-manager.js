"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BundleManager = void 0;
var BundleManager = /** @class */ (function () {
    function BundleManager(options) {
        this.listeners = options.listeners || [];
        this.adapters = options.adapters;
        this.versions = {};
    }
    BundleManager.getInstance = function (options) {
        if (!BundleManager.instance) {
            BundleManager.instance = new BundleManager(options);
        }
        return BundleManager.instance;
    };
    BundleManager.prototype.getBundleInfo = function (id) {
        var bundleInfos = window.bundleInfos;
        if (!bundleInfos || !bundleInfos[id]) {
            throw new Error("Not found bundle '".concat(id, "'."));
        }
        return bundleInfos && bundleInfos[id];
    };
    BundleManager.prototype.loadBundle = function (bundleId) {
        return __awaiter(this, void 0, void 0, function () {
            var assertManager, _a, name, url, useMd5Cache, bundleUrl;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        assertManager = this.adapters.assetManager();
                        _a = this.getBundleInfo(bundleId), name = _a.name, url = _a.url, useMd5Cache = _a.useMd5Cache;
                        bundleUrl = "".concat(url, "/").concat(name);
                        if (!useMd5Cache) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.compareAndUpdateNewVersion(bundleId)];
                    case 1:
                        _b.sent();
                        _b.label = 2;
                    case 2: return [2 /*return*/, new Promise(function (resolve, reject) {
                            var version = _this.versions[name];
                            assertManager.loadBundle(bundleUrl, { version: version }, function (error, bundle) {
                                error ? reject(error) : resolve(bundle);
                            });
                        })];
                }
            });
        });
    };
    BundleManager.prototype.loadAsset = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var bundleId, path, type, onProgress, bundle;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!options.path || !options.type || !options.bundleId) {
                            throw new Error("Invalid arguments: ".concat(options));
                        }
                        bundleId = options.bundleId, path = options.path, type = options.type, onProgress = options.onProgress;
                        return [4 /*yield*/, this.loadBundle(bundleId)];
                    case 1:
                        bundle = _a.sent();
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                bundle.load(path, type, onProgress, function (error, asset) {
                                    error ? reject(error) : resolve(asset);
                                });
                            })];
                }
            });
        });
    };
    BundleManager.prototype.compareAndUpdateNewVersion = function (bundleId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, name, url, http, versionUrl, versions, oldVersion, currentVersion, difference;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.getBundleInfo(bundleId), name = _a.name, url = _a.url;
                        http = this.adapters.http();
                        versionUrl = "".concat(url, "/versions.json?v=").concat(Date.now());
                        return [4 /*yield*/, http.get(versionUrl)];
                    case 1:
                        versions = _b.sent();
                        oldVersion = this.versions[name];
                        currentVersion = versions[name];
                        difference = currentVersion && currentVersion !== oldVersion;
                        if (difference) {
                            this.versions[name] = currentVersion;
                            this.listeners.forEach(function (listener) { return listener.onVersionChanged(); });
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    return BundleManager;
}());
exports.BundleManager = BundleManager;
