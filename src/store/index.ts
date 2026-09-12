import { configureStore } from '@reduxjs/toolkit'
import userReducer from './modules/user'

// 创建全局 store，注册 user 模块
const store = configureStore({
    reducer: {
        user: userReducer
    }
})

// 从 store 本身推导出类型，避免手写导致不同步
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
