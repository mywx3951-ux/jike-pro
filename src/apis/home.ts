import { http } from '@/utils/request'
import type { StatisticsData } from '@/interface'

// ---------------------------------------------------------------------------
// 首页统计数据
//
// 已对接真实接口 GET /statistics（http 的响应拦截器剥掉了 axios 外层，
// 拿到的就是 { message, data } 这层结构）。
//
// 但演示后端对这个接口固定返回 data: null，真实环境才有数据；
// 所以请求成功但 data 为空时回退到下面的模拟数据，保证演示页面不空白。
// ---------------------------------------------------------------------------

// 近 30 天的每日发布数量（演示后端没有统计数据时的兜底）
const MOCK_DATACOUNT = [
    8, 12, 6, 15, 21, 18, 24, 19, 13, 9,
    16, 22, 27, 20, 14, 11, 17, 25, 31, 28,
    23, 19, 15, 12, 18, 26, 33, 29, 21, 24,
]

/**
 * 生成「以今天为终点、往前数 days 天」的日期标签
 * 这样兜底数据永远贴着当前日期，不会过一段时间就变成一堆历史数据
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
 * 接口请求失败会走页面的 catch 展示空数据；
 * 请求成功但 data 为 null（演示后端不支持）时用模拟数据兜底
 */
export const getStatistics = async (): Promise<StatisticsData> => {
    const res = await http.get<StatisticsData | null>('/statistics')
    return res.data ?? mockStatistics
}
