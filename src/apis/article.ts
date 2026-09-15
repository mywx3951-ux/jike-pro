import { http } from '@/utils/request'
import type {
    ArticleDetail,
    ArticleListParams,
    ArticleListResponse,
    Channel,
    PublishArticleParams,
} from '@/interface'

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

// 文章详情（编辑页回填用）
export const getArticleDetail = (id: string) => {
    return http.get<ArticleDetail>(`/mp/articles/${id}`)
}

// 更新文章
// 和发布一样 draft=false 直接发布修改后的内容
export const updateArticle = (id: string, data: PublishArticleParams) => {
    return http.put(`/mp/articles/${id}?draft=false`, data)
}

// 删除文章
export const deleteArticle = (id: string) => {
    return http.delete(`/mp/articles/${id}`)
}
