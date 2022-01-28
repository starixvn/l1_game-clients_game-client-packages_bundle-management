# Bundle Management for Cocos Creator

`Bundle Management` is a library for remote package management - solving resource downloading and versioning.

The logic of downloading resources is as follows:

1. Determine the bundle by id which is defined in [Bundle Information Configuration](#bundle-information-configuration).

2. Fetch the version information and compare the change, if so, emit an event to the listener.

3. Download the latest version of the bundle from remote.

## Installation

- Using npm

```bash
npm install bundle-management --dev
```

- Using yarn

```bash
yarn add bundle-management --dev
```

## Initialization

At the application starting point, add the following code

- Using `Typescript` or `ES Module`

```typescript
input { BundleManager } from "bundle-management";

BundleManager.initialize({
  adapters: <passing the adapters>,
  listeners: [<some listeners>],
});
```

- Using `CommonJS`

```javascript
const { BundleManager } = require("bundle-management");

BundleManager.initialize({
  adapters: <passing the adapters>,
  listeners: [<some listeners>],
});
```

## Bundle Information Configuration

After installing the extension, it will create the file `<cocos project>/assets/resources/bundle-information.js` with content:

```javascript
window.bundleInfos = {
  [bundle id]: {
    url: "the bundle url",
    name: "the bundle name",
  },
};
```

Example:

```javascript
window.bundleInfos = {
  package: {
    url: "http://example.com/bundle",
    name: "package",
  },
};
```

---

**NOTE**

Because we use a global variable (`window.bundleInfos`) to store bundle information so that all configurations should place in the **main project**. And in the **remote project** only use for development and testing.

---

## Components

### 1. Remote Prefab Loader

Load and instantiate prefab from the remote bundle.

![Remote Prefab Loader](docs/remote-prefab-loader.png)

**Properties**

- `Bundle Id`: Defined in file `<cocos project>/assets/resources/bundle-information.js`.

- `Prefab Path`: The relative path to this prefab in a bundle. For example, the bundle has two folders _views_ and _view-models_, in _views_ has a file named _ball.prefab_. The path to the _ball.prefab_ is `views/ball` (without file extension).

- `Initialization Event Handler`: The callback methods will be called after the prefab is created.

- `On Progress Handlers`: The callback methods will be called when the resource loads

### 2. Remote Sprite Frame Loader

Load sprite frame from the remote bundle and assign to Sprite Component.

![Remote Sprite Frame Loader](docs/remote-sprite-frame-loader.png)

**Properties**

- `Bundle Id`: The bundle id.
- `Sprite Frame Path`: The relative path to this sprite frame in a bundle.
- `On Progress Handlers`: The callback methods will be called when the resource loads
