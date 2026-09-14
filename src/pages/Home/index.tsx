import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Card, Col, Row, Spin, Statistic } from 'antd'
import {
    FileTextOutlined,
    LikeOutlined,
    StarOutlined,
    TeamOutlined,
} from '@ant-design/icons'
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { EChartsOption } from 'echarts'
import { getStatistics } from '@/apis/home'
import type { StatisticsData } from '@/interface'
import { useECharts } from '@/hooks/useECharts'
import './index.scss'

// 按需注册用到的图表和组件。
// echarts/core 是"空壳"，不注册就直接画不出来 —— 这是按需引入最容易踩的坑。
// 好处是打包体积只包含用到的部分，比整包 import * as echarts from 'echarts' 小得多。
echarts.use([LineChart, GridComponent, TooltipComponent, CanvasRenderer])

// 四个统计卡片的配置：key 对应接口 number 里的字段名
type StatCardConfig = {
    key: keyof StatisticsData['number']
    title: string
    icon: ReactNode
    // 图标底色
    color: string
}

const statCards: StatCardConfig[] = [
    { key: 'article', title: '总文章数', icon: <FileTextOutlined />, color: '#1677ff' },
    { key: 'fans', title: '总粉丝数', icon: <TeamOutlined />, color: '#52c41a' },
    { key: 'like', title: '总获赞数', icon: <LikeOutlined />, color: '#fa8c16' },
    { key: 'follow', title: '总关注数', icon: <StarOutlined />, color: '#722ed1' },
]

// 数据概览（对应路由 index: true，即 /）
const Home = () => {
    // statistics 初始为 undefined：表示数据还没回来，页面先渲染空图表
    const [statistics, setStatistics] = useState<StatisticsData>()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // 组件卸载后不再 setState，否则会触发 React「更新已卸载组件」的告警
        let ignore = false
        getStatistics()
            .then((data) => {
                if (!ignore) setStatistics(data)
            })
            .catch(() => {
                // 目前是本地模拟数据不会失败；
                // 换成真实接口后可以在这里补 message.error 之类的错误提示
            })
            .finally(() => {
                if (!ignore) setLoading(false)
            })

        return () => {
            ignore = true
        }
    }, [])

    // useMemo 很关键：option 每次渲染都新建对象的话，
    // useECharts 里的 effect 会因为依赖变化而反复重绘图表
    const option = useMemo<EChartsOption>(() => {
        // 用 ?? 兜底：数据没回来时给空数组，图表骨架先渲染出来
        const date = statistics?.date ?? []
        const datacount = statistics?.datacount ?? []

        return {
            // 鼠标悬浮时显示该 x 轴位置上的数据
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'line' },
                // 把原始数字格式化成「xx 篇」，更符合语义
                valueFormatter: (value) => `${value} 篇`,
            },
            // outerBounds* 是 echarts 6 的写法，等价于旧版的 containLabel: true，
            // 作用是让 y 轴文字也参与布局计算，不会被网格边缘裁掉
            grid: {
                top: 24,
                right: 24,
                bottom: 8,
                left: 8,
                outerBoundsMode: 'same',
                outerBoundsContain: 'axisLabel',
            },
            xAxis: {
                type: 'category',
                data: date,
                // 折线从 y 轴(左边界)开始画，而不是两边各留一格空隙
                boundaryGap: false,
                axisTick: { show: false },
                axisLine: { lineStyle: { color: '#e8e8e8' } },
                axisLabel: { color: '#8c8c8c' },
            },
            yAxis: {
                type: 'value',
                // 从 0 开始，避免视觉上放大差异造成误读
                min: 0,
                splitLine: { lineStyle: { type: 'dashed', color: '#f0f0f0' } },
                axisLabel: { color: '#8c8c8c' },
            },
            series: [
                {
                    name: '发布文章数',
                    type: 'line',
                    data: datacount,
                    // 平滑曲线更柔和；平时不显示拐点，画面更干净
                    smooth: true,
                    showSymbol: false,
                    symbolSize: 8,
                    lineStyle: { width: 3, color: '#1677ff' },
                    itemStyle: { color: '#1677ff' },
                    // 渐变填充：顶部有色、底部透明，折线图最常用的美化手法
                    areaStyle: {
                        color: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [
                                { offset: 0, color: 'rgba(22, 119, 255, 0.28)' },
                                { offset: 1, color: 'rgba(22, 119, 255, 0)' },
                            ],
                        },
                    },
                },
            ],
        }
    }, [statistics])

    // 把图表容器交给 useECharts 管理，返回的 ref 挂到 div 上即可
    const chartRef = useECharts(option)

    // 图表右上角的"近 N 天"跟数据长度保持一致，改模拟数据时不用同步改文案
    const recentDays = statistics?.date.length ?? 0

    return (
        <div className="home">
            {/* gutter 同时设置横向和纵向间距，窄屏卡片换行后也不会挤在一起 */}
            <Row gutter={[16, 16]}>
                {statCards.map((item) => (
                    <Col key={item.key} xs={24} sm={12} xl={6}>
                        <Card variant="borderless" className="stat-card" loading={loading}>
                            <div className="stat-card__body">
                                <span
                                    className="stat-card__icon"
                                    style={{ backgroundColor: item.color }}
                                >
                                    {item.icon}
                                </span>
                                <Statistic
                                    title={item.title}
                                    value={statistics?.number[item.key] ?? 0}
                                />
                            </div>
                        </Card>
                    </Col>
                ))}

                <Col span={24}>
                    <Card
                        variant="borderless"
                        title="文章发布趋势"
                        extra={recentDays > 0 ? `近 ${recentDays} 天` : null}
                        className="trend-card"
                    >
                        {/* 容器先渲染、图表后画上去：
                            如果把图表 div 藏进 loading 分支，等数据回来才挂载，
                            useECharts 的 init 就永远不会执行了（依赖数组是空的） */}
                        <div className="trend-card__chart">
                            <div ref={chartRef} className="trend-card__canvas" />
                            {loading && (
                                <div className="trend-card__mask">
                                    <Spin />
                                </div>
                            )}
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    )
}

export default Home
