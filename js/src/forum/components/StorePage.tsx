import IndexPage from "flarum/forum/components/IndexPage";
import { IPageAttrs } from 'flarum/common/components/Page';
import listItems from 'flarum/common/helpers/listItems';
import Mithril from 'mithril';

export interface IIndexPageAttrs extends IPageAttrs {}

export default class StorePage<CustomAttrs extends IIndexPageAttrs = IIndexPageAttrs> extends IndexPage {

  oncreate(vnode: Mithril.VnodeDOM<CustomAttrs, this>) {
    super.oncreate(vnode);

    app.setTitle(app.forum.attribute("storeName") || app.translator.trans('mattoid-store.forum.tital'));
    app.setTitleCount(0);
  }

  view() {
    return (
      <div className="IndexPage">
        <div className="container">
          <div className="sideNavContainer">
            <nav className="IndexPage-nav sideNav">
              <ul>{listItems(this.sidebarItems().toArray())}</ul>
            </nav>
            <div className="StorePage-results sideNavOffset">
              <h2 class="BadgeOverviewTitle">{app.forum.attribute("storeName") || app.translator.trans('mattoid-store.forum.tital')}</h2>
              <div className="Store-Body">
                111111111111111
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
