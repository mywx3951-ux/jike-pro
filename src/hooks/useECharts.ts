import { useEffect, useRef } from 'react'
import * as echarts from 'echarts/core'
import type { EChartsCoreOption } from 'echarts/core'

/**
 * 把 ECharts 实例的生命周期托管给 React，用法：
 *
 *   const chartRef = useECharts(option)
 *   <div ref={chartRef} style={{ height: 360 }} />
 *
 * 内部做四件事：
 *   1. 挂载时 echarts.init 创建实例
 *   2. option 变化时 setOption 重绘
 *   3. 容器尺寸变化（窗口缩放、侧边栏折叠）时自动 resize
 *   4. 卸载时 dispose 销毁实例，避免内存泄漏
 */
export const useECharts = (option: EChartsCoreOption) => {
    // 图表容器（真实 DOM 节点）
    const containerRef = useRef<HTMLDivElement>(null)
    // ECharts 实例只用来操作图表，不参与渲染，所以用 ref 存而不是 state
    const chartRef = useRef<echarts.ECharts>(null)

    // 依赖数组为空：只在挂载时创建、卸载时销毁
    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const chart = echarts.init(container)
        chartRef.current = chart

        // ECharts 自身不会跟随容器变化重新计算尺寸，必须手动 resize
        // 用 ResizeObserver 比监听 window.resize 更准：布局变化（如侧边栏收起）也能感知
        const observer = new ResizeObserver(() => chart.resize())
        observer.observe(container)

        return () => {
            observer.disconnect()
            chart.dispose()
            chartRef.current = null
        }
    }, [])

    // 数据变了就重新渲染。effect 的执行顺序和声明顺序一致，
    // 所以挂载时这一步一定在 init 之后，chartRef.current 不会为空
    useEffect(() => {
        chartRef.current?.setOption(option)
    }, [option])

    return containerRef
}
