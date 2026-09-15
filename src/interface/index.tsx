import type { Dayjs } from 'dayjs'

export interface FieldType {
    mobile: string
    code: string
}

// 用户信息（GET /user/profile）
export interface UserInfo {
    // 用户 id
    id: string
    // 用户名字
    name: string
    // 用户头像地址
    photo: string
    // 用户手机号
    mobile: string
    // 用户性别：0 男，1 女（字面量联合类型，只能取这两个值）
    gender: 0 | 1
    // 用户生日，格式：年-月-日
    birthday: string
    // 用户介绍，没有则为 null
    intro: string | null
}

// 首页统计数据（对应接口 GET /statistics）
export interface StatisticsData {
    // 四项基础统计
    number: {
        // 总文章数
        article: number
        // 总粉丝数
        fans: number
        // 总获赞数
        like: number
        // 总关注数
        follow: number
    }
    // 折线图 x 轴：日期标签（格式：月-日）
    date: string[]
    // 折线图 y 轴：每天的发布数量，下标与 date 一一对应
    datacount: number[]
}

// 文章频道（GET /channels）
export interface Channel {
    id: number
    name: string
}

// 封面类型：0 无图 / 1 单图 / 3 三图
// 用字面量联合类型，写错数字编译期就会报错
export type CoverType = 0 | 1 | 3

// 发布文章的表单值（也就是 Form 收集到的数据）
export interface PublishFormValue {
    title: string
    channel_id: number
    content: string
    type: CoverType
}

// 发布文章接口的入参（POST /mp/articles?draft=false）
export interface PublishArticleParams {
    title: string
    channel_id: number
    content: string
    type: CoverType
    // 封面单独嵌套一层，images 是无图时为空数组
    cover: {
        type: CoverType
        images: string[]
    }
}

// 图片上传接口的响应体（POST /upload）
export interface UploadResponse {
    message: string
    data: {
        // 图片访问地址
        url: string
    }
}

// 文章列表里的一篇文章（GET /mp/articles 返回的 results 元素）
export interface Article {
    id: string
    // 文章标题
    title: string
    // 状态：0 草稿 / 1 审核中 / 2 审核通过
    status: number
    // 发布时间，格式：年-月-日 时:分:秒
    pubdate: string
    // 封面：images 是封面图地址，无图时为空数组
    cover: {
        type: CoverType
        images: string[]
    }
    // 阅读数
    read_count: number
    // 评论数
    comment_count: number
    // 点赞数
    like_count: number
}

// 文章列表的查询参数
export interface ArticleListParams {
    page: number
    per_page: number
    // 下面这些不传就表示该条件不参与筛选（axios 会自动忽略值为 undefined 的参数）
    status?: number
    channel_id?: number
    // 发布日期范围，格式：年-月-日
    begin_pubdate?: string
    end_pubdate?: string
}

// 文章列表接口的返回体
export interface ArticleListResponse {
    results: Article[]
    total_count: number
    page: number
    per_page: number
}

// 文章列表筛选表单的值
export interface ArticleFilterForm {
    // 状态，空字符串表示「全部」
    status: number | ''
    channel_id?: number
    // 日期区间：RangePicker 的值是「开始、结束」两个 dayjs 对象，
    // 只在选完两端后才会有值，所以可能为 null
    date?: [Dayjs | null, Dayjs | null] | null
}

// 文章详情（GET /mp/articles/:id 返回的 data）
export interface ArticleDetail {
    id: string
    title: string
    channel_id: number
    content: string
    cover: {
        type: CoverType
        images: string[]
    }
    // 发布时间，详情接口的字段名带下划线，和列表的 pubdate 不同
    pub_date: string
}
