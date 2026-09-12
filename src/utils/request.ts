import axios, {
    type AxiosResponse,
    type InternalAxiosRequestConfig
} from 'axios'
import { getToken } from '@/utils/token'

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
    // 对响应错误做点什么
    return Promise.reject(error)
})

export { http }