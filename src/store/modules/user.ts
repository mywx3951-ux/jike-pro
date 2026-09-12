import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { http } from '@/utils/request'
import type { FieldType } from '@/interface'
import type { AppDispatch } from '@/store'
import { getToken, setToken } from '@/utils/token'

const userStore = createSlice({
    name: 'user',
    // 数据状态：刷新页面时从 localStorage 把 token 读回来，登录态才不会丢
    initialState: {
        token: getToken() ?? ''
    },
    // 同步修改方法
    reducers: {
        setUserInfo(state, action: PayloadAction<string>) {
            // 更新 Redux（内存），组件能立刻响应
            state.token = action.payload
            // 新增逻辑：同步写入 localStorage（持久化），刷新后还能读到
            setToken(action.payload)
        }
    }
})

// 解构出actionCreater
const { setUserInfo } = userStore.actions

// 获取reducer函数
const userReducer = userStore.reducer

// 异步方法封装
const fetchLogin = (loginForm: FieldType) => {
    return async (dispatch: AppDispatch) => {
        const res = await http.post('/authorizations', loginForm)
        dispatch(setUserInfo(res.data.token))
    }
}

export { fetchLogin }

export default userReducer