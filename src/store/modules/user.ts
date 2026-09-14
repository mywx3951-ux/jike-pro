import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { http } from '@/utils/request'
import type { FieldType, UserInfo } from '@/interface'
import type { AppDispatch } from '@/store'
import { getToken, setToken, removeToken } from '@/utils/token'

// state 的类型
interface UserState {
    token: string
    // Partial：用户信息还没请求到时是空对象 {}，字段可以暂时不存在
    userInfo: Partial<UserInfo>
}

const initialState: UserState = {
    // 刷新页面时从 localStorage 把 token 读回来，登录态才不会丢
    token: getToken() ?? '',
    userInfo: {}
}

const userStore = createSlice({
    name: 'user',
    initialState,
    // 同步修改方法
    reducers: {
        // 存 token：同时写内存和 localStorage
        setUserToken(state, action: PayloadAction<string>) {
            state.token = action.payload
            setToken(action.payload)
        },
        // 存用户信息：只放内存，不需要持久化（它随时可以重新请求）
        setUserInfo(state, action: PayloadAction<UserInfo>) {
            state.userInfo = action.payload
        },
        // 退出登录：清空 token 与用户信息，并删除本地存储
        clearUserInfo(state) {
            state.token = ''
            state.userInfo = {}
            // 关键：只清 Redux 是不够的，localStorage 里的 token 也必须删掉，
            // 否则刷新页面后 initialState 又会把它读回来，等于没退出
            removeToken()
        }
    }
})

// 解构出actionCreater
const { setUserToken, setUserInfo, clearUserInfo } = userStore.actions

// 获取reducer函数
const userReducer = userStore.reducer

// 异步方法封装：登录
const fetchLogin = (loginForm: FieldType) => {
    return async (dispatch: AppDispatch) => {
        const res = await http.post('/authorizations', loginForm)
        dispatch(setUserToken(res.data.token))
    }
}

// 异步方法封装：获取用户信息
const fetchUserInfo = () => {
    return async (dispatch: AppDispatch) => {
        const res = await http.get('/user/profile')
        dispatch(setUserInfo(res.data))
    }
}

export { fetchLogin, fetchUserInfo, clearUserInfo }

export default userReducer