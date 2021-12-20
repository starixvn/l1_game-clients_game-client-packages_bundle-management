const { ccclass } = cc._decorator;

@ccclass
export default class Main extends cc.Component {
  onInitializedTheBall(node: cc.Node, data: string) {
    console.log(node.name, data);
  }
}
