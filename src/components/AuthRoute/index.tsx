import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store'

type AuthRouteProps = {
    children?: ReactNode
}

// 路由权限守卫：包裹受保护路由
// - 有 token：放行，渲染 children（也就是 Layout 界面）
// - 无 token：跳转到登录页
export function AuthRoute({ children }: AuthRouteProps) {
    // 从 Redux 读 token（Redux 初始化时已从 localStorage 恢复，刷新也能拿到）
    const token = useSelector((state: RootState) => state.user.token)

    if (!token) {
        // replace：用替换历史记录代替压栈，
        // 否则用户点浏览器"后退"会又回到这个页面，然后再被弹回登录页，来回死循环
        return <Navigate to="/Login" replace />
    }

    return <>{children}</>
}
