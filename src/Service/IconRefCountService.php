<?php

namespace Mattoid\Store\Service;

use Illuminate\Contracts\Filesystem\Factory;
use Mattoid\Store\Model\StoreGoodsIconModel;
use Psr\Log\LoggerInterface;

/**
 * 商品图标引用计数管理（与上传接口的 increment('count') 配对）。
 * 计数归零时删除磁盘文件并清理记录；失败仅记日志，不影响调用方主流程。
 */
class IconRefCountService
{
    protected $filesystemFactory;
    protected $logger;

    public function __construct(Factory $filesystemFactory, LoggerInterface $logger)
    {
        $this->filesystemFactory = $filesystemFactory;
        $this->logger = $logger;
    }

    /**
     * 释放一处图标引用；计数归零时删除磁盘文件并清理记录。
     */
    public function release(string $iconUrl): void
    {
        if ($iconUrl === '' || strpos($iconUrl, '/assets/mattoid/store/') !== 0) {
            return;
        }
        $icon = StoreGoodsIconModel::query()->where('url', $iconUrl)->first();
        if (! $icon) {
            return;
        }
        try {
            // decrement 返回库内最新值，避免用内存值计算导致的并发竞态（双删共用图标都算出 remaining=1 → 文件泄漏）
            $remaining = $icon->decrement('count');
            if ($remaining <= 0) {
                $this->filesystemFactory->disk('mattoid-store')->delete(basename($iconUrl));
                $icon->delete();
            }
        } catch (\Exception $e) {
            $this->logger->error('[mattoid-store] 释放图标引用失败', ['url' => $iconUrl, 'exception' => $e]);
        }
    }
}
