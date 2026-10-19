import Component from 'flarum/common/Component';
import type Mithril from 'mithril';

/**
 * 列表加载中占位指示器（商店/背包/购物车/管理端列表共用）
 */
export default class LoadingBlock extends Component {
  view(): Mithril.Children {
    return (
      <div class="DiscussionList">
        <div class="DiscussionList-loadMore">
          <div
            aria-label="loading…"
            role="status"
            data-size="medium"
            class="LoadingIndicator-container LoadingIndicator-container--block LoadingIndicator-container--medium"
          >
            <div aria-hidden="true" class="LoadingIndicator"></div>
          </div>
        </div>
      </div>
    );
  }
}
