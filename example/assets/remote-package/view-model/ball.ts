const { ccclass, property, requireComponent, executeInEditMode } = cc._decorator;

@ccclass
@requireComponent(cc.Sprite)
@executeInEditMode
export default class Ball extends cc.Component {
  @property([cc.SpriteFrame])
  private colors: cc.SpriteFrame[] = [];

  private currentIndex: number = 0;

  protected onLoad(): void {
    this.changeColor();
  }

  protected changeColor(): void {
    if (this.colors.length > this.currentIndex) {
      const color = this.colors[this.currentIndex];
      const sprite = this.node.getComponent(cc.Sprite);

      if (color && sprite) {
        sprite.spriteFrame = color;
      }

      this.currentIndex++;
    } else if (this.colors.length) {
      this.currentIndex = 0;
      this.changeColor();
    }
  }
}
