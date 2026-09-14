import axios, {
    type AxiosResponse,
    type InternalAxiosRequestConfig
} from 'axios'
import { getToken } from '@/utils/token'

// ---------------------------------------------------------------------------
// 401 处理器：由外部（main.tsx）注册进来
//
// 为什么不直接在这个文件里 import store？
// request.ts 是被 store 间接依赖的底层模块：
//   store/index.ts → store/modules/user.ts → utils/request.ts
// 如果这里再反向 import store，就形成了循环依赖：
//   router → Layout → user.ts → request.ts → store/index.ts
// 而 store/index.ts 在顶层就要立即使用 userReducer，此时 user.ts 还没初始化完，
// 会直接抛 "Cannot access 'userReducer' before initialization"，整个页面白屏（已实测）。
//
// 所以这里只留一个"钩子"，具体要做什么由外部注入，依赖方向保持单向。
// ---------------------------------------------------------------------------
type UnauthorizedHandler = () => void

let unauthorizedHandler: UnauthorizedHandler | undefined

/** 注册 token 失效（401）时要执行的处理逻辑 */
const setUnauthorizedHandler = (handler: UnauthorizedHandler): void => {
    unauthorizedHandler = handler
}

const http = axios.create({
    // 开发环境使用 vite 代理前缀 /api，避免浏览器跨域
    // 真实地址由 vite.config.ts 的 server.proxy 转发到 https://geek.itheima.net/v1_0
    baseURL: '/api',
    timeout: 5000
})

// 添加请求拦截器
http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    // 有 token 就塞进请求头，后端靠这个识别登录态
    // 格式固定为 "Bearer <token>"，Bearer 和 token 之间必须有一个空格
    const token = getToken()
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
}, (error: unknown) => {
    return Promise.reject(error)
})

// 添加响应拦截器
http.interceptors.response.use((response: AxiosResponse) => {
    // 2xx 范围内的状态码都会触发该函数。
    // 对响应数据做点什么
    return response.data
}, (error: unknown) => {
    // 超出 2xx 范围的状态码都会触发该函数。
    // token 失效（401）：调用外部注册的处理器清空登录态
    // 清完之后 AuthRoute 会自动渲染 <Navigate to="/Login" replace />，
    // 所以这里不需要手动 navigate，更不需要 window.location.reload()
    //
    // 注意必须用可选链：网络错误 / 跨域时 error.response 是 undefined，
    // 直接写 error.response.status 会抛 TypeError，还会把真实的网络错误掩盖掉
    if (axios.isAxiosError(error) && error.response?.status === 401) {
        unauthorizedHandler?.()
    }

    return Promise.reject(error)
})

export { http, setUnauthorizedHandler }