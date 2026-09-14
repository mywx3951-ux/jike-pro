import type { StatisticsData } from '@/interface'

// ---------------------------------------------------------------------------
// 首页统计数据
//
// 目前返回的是本地模拟数据，方便先把页面和图表做完，不依赖后端和网络。
// 等接口联调时，把下面 getStatistics 的函数体换成真实请求即可，页面代码不用改：
//
//   import { http } from '@/utils/request'
//
//   export const getStatistics = (): Promise<StatisticsData> => {
//       return http.get('/statistics')
//   }
//
// （http 的响应拦截器已经剥掉了 axios 的外层，返回的就是 { message, data }，
//   所以调用处以 res.data 取到的正是 StatisticsData 这层结构）
// ---------------------------------------------------------------------------

// 近 30 天的每日发布数量（模拟数据，接口就绪后可整段删除）
const MOCK_DATACOUNT = [
    8, 12, 6, 15, 21, 18, 24, 19, 13, 9,
    16, 22, 27, 20, 14, 11, 17, 25, 31, 28,
    23, 19, 15, 12, 18, 26, 33, 29, 21, 24,
]

/**
 * 生成「以今天为终点、往前数 days 天」的日期标签
 * 这样模拟数据永远贴着当前日期，不会过一段时间就变成一堆历史数据
 */
const buildRecentDates = (days: number): string[] => {
    const today = new Date()
    return Array.from({ length: days }, (_, index) => {
        const date = new Date(today)
        date.setDate(today.getDate() - (days - 1 - index))
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${month}-${day}`
    })
}

const mockStatistics: StatisticsData = {
    number: {
        article: 1024,
        fans: 28640,
        like: 139580,
        follow: 268,
    },
    date: buildRecentDates(MOCK_DATACOUNT.length),
    datacount: MOCK_DATACOUNT,
}

/**
 * 获取首页统计数据
 * 用 Promise + setTimeout 模拟一次网络请求，方便观察 loading 效果
 */
export const getStatistics = (): Promise<StatisticsData> => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(mockStatistics), 300)
    })
}
