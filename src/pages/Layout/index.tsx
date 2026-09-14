import { Layout, Menu, Popconfirm, type MenuProps } from 'antd'
import {
    HomeOutlined,
    DiffOutlined,
    EditOutlined,
    LogoutOutlined,
} from '@ant-design/icons'
import './index.scss'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUserInfo, clearUserInfo } from '@/store/modules/user'
import type { AppDispatch, RootState } from '@/store'


const { Header, Sider } = Layout

const items = [
    {
        label: '首页',
        key: '/',
        icon: <HomeOutlined />,
    },
    {
        label: '文章管理',
        key: '/article',
        icon: <DiffOutlined />,
    },
    {
        label: '创建文章',
        key: '/publish',
        icon: <EditOutlined />,
    },
]

const GeekLayout = () => {
    const dispatch = useDispatch<AppDispatch>()
    // 从 store 读取用户信息：请求回来后组件会自动重新渲染
    const name = useSelector((state: RootState) => state.user.userInfo.name)
    const location = useLocation()
    const selectedKey = location.pathname
    const navigate = useNavigate()
    // 复用 antd Menu 自带的 onClick 类型：
    // route 会被自动推断成 MenuInfo，不用自己声明接口
    const menuClick: MenuProps['onClick'] = (route) => {
        navigate(route.key)
    }

    // 退出登录：清空 Redux 与 localStorage 里的登录态，然后回到登录页
    const loginOut = () => {
        dispatch(clearUserInfo())
        navigate('/Login')
    }

    // 组件挂载时自动请求一次用户信息
    // 依赖数组里放 dispatch：它的引用不会变，所以这个 effect 只会跑一次
    useEffect(() => {
        // 这里 catch 掉失败：token 失效（401）已由 request.ts 的拦截器统一处理，
        // 不 catch 的话控制台会多出一条「未处理的 Promise 拒绝」红字
        dispatch(fetchUserInfo()).catch(() => { })
    }, [dispatch])
    return (
        <Layout>
            <Header className="header">
                <div className="logo" />
                <div className="user-info">
                    <span className="user-name">{name || "加载中..."}</span>
                    <span className="user-logout">
                        <Popconfirm
                            title="是否确认退出？"
                            okText="退出"
                            cancelText="取消"
                            onConfirm={loginOut}
                        >
                            <LogoutOutlined /> 退出
                        </Popconfirm>
                    </span>
                </div>
            </Header>
            <Layout>
                <Sider width={200} className="site-layout-background">
                    <Menu
                        mode="inline"
                        theme="dark"
                        selectedKeys={[selectedKey]}
                        items={items}
                        style={{ height: '100%', borderRight: 0 }}
                        onClick={menuClick}
                    ></Menu>
                </Sider>
                <Layout className="layout-content" style={{ padding: 20 }}>
                    <Outlet />
                </Layout>
            </Layout>
        </Layout>
    )
}
export default GeekLayout