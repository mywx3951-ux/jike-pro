import { http } from '@/utils/request'
import type { ArticleListParams, ArticleListResponse, Channel, PublishArticleParams } from '@/interface'

// 频道列表
// 响应拦截器已经把 axios 外层剥掉了，所以调用处直接 res.data.channels
export const getChannels = () => {
    return http.get<{ channels: Channel[] }>('/channels')
}

// 发布文章
// draft=false 直接发布；改成 true 就是存草稿
export const publishArticle = (data: PublishArticleParams) => {
    return http.post('/mp/articles?draft=false', data)
}

// 文章列表（带分页和筛选，条件都放在 query 参数里）
export const getArticleList = (params: ArticleListParams) => {
    return http.get<ArticleListResponse>('/mp/articles', { params })
}

// 删除文章
export const deleteArticle = (id: string) => {
    return http.delete(`/mp/articles/${id}`)
}
