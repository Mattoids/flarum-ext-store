import app from 'flarum/common/app';

/**
 * 金额显示工具：商品插件（store-invite / store-decoration 等）统一从这里取单位，
 * 保证所有商品卡片的价格口径与商店插件一致。
 *
 * 货币单位一律以 money 插件（huoxin/money-with-history）的设置为准：
 *  1. huoxin-money-with-history.money_name（money 插件设置，含其默认 '[money]'）
 *  2. antoinefr-money.moneyname（原版货币扩展，兼容旧站）
 *  3. 兜底 '[money]'
 */

export function getMoneyName(): string {
  return String(
    app.forum.attribute('huoxin-money-with-history.money_name') ||
      app.forum.attribute('antoinefr-money.moneyname') ||
      '[money]'
  );
}

/**
 * 按货币单位模板格式化金额。
 * 模板含 '[money]' 占位符时替换；管理员配错（漏写占位符）时退化为 "数值 单位"，保证数字始终可见。
 */
export function formatMoney(value: number | string): string {
  const moneyName = getMoneyName();
  const text = String(value);

  if (value === null || value === undefined || text === '') {
    return text;
  }

  return moneyName.indexOf('[money]') !== -1 ? moneyName.replace('[money]', text) : text + ' ' + moneyName;
}
