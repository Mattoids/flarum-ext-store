<?php

namespace Mattoid\Store\Controller\Concerns;

use Illuminate\Support\Collection;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;

/**
 * 列表分页惯例：skip/take(limit+1) 探针法取页，多取一条判 hasMore 并弹出。
 * 查询的 where/orderBy 由调用点在传入前组装。
 */
trait PaginatesQueries
{
    /**
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $route 分页链接路由名
     */
    protected function paginateList($query, ServerRequestInterface $request, Document $document, string $route): Collection
    {
        $limit = $this->extractLimit($request);
        $offset = $this->extractOffset($request);
        $params = $request->getQueryParams();

        $list = $query->skip($offset)->take($limit + 1)->get();

        $results = $limit > 0 && $list->count() > $limit;
        if ($results) {
            $list->pop();
        }
        $document->addPaginationLinks(
            $this->url->to('api')->route($route),
            $params,
            $offset,
            $limit,
            $results ? null : 0
        );

        return $list;
    }
}
