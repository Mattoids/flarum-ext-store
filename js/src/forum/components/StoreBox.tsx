import Modal, {IInternalModalAttrs} from "flarum/common/components/Modal";
import type Mithril from "mithril";
import Stream from "flarum/common/utils/Stream";

interface IStoreModalAttrs extends IInternalModalAttrs {
  storeData: object
}

export default class StoreBox extends Modal<IStoreModalAttrs> {
  private storeData : object = {}

  static initAttrs(attrs: IStoreModalAttrs) {
    super.initAttrs(attrs);
  }

  oninit(vnode: Mithril.Vnode<IStoreModalAttrs, this>) {
    super.oninit(vnode);

    this.storeData = this.attrs.storeData;
  }

  title() {
    return this.storeData.title;
  }

  className(): string {
    return "";
  }

  content() {
    return (
      <div>77777777777777777777</div>
    )
  }
}
