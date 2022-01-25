import axios from "axios";
const { BundleManager } = require("bundle-manager");
const { ccclass } = cc._decorator;

BundleManager.getInstance({
  adapters: {
    http: () => ({ get: (url: string) => axios.get(url).then((res) => res.data) }),
    assetManager: () => cc.assetManager,
  },
  listeners: [{ onVersionChanged: () => console.log("Version changed") }],
});

@ccclass
export default class Main extends cc.Component {
  onInitializedTheBall(node: cc.Node, data: string) {
    console.log(node.name, data);
  }

  onProgress(finished: number, total: number) {
    console.log(`Loading ${((finished / total) * 100).toFixed(2)}% (Total: ${total}, Finished: ${finished}) `);
  }
}
