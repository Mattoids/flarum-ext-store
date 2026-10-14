<?php

namespace Mattoid\Store\Exception;

/**
 * 续费防重锁冲突：不是续费失败，应跳过等下一周期重试，不得触发商品失效
 */
class RenewalLockException extends \RuntimeException
{
}
