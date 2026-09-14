import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { Provider } from 'react-redux'
import router from './router'
import store from './store'
import { clearUserInfo } from './store/modules/user'
import { setUnauthorizedHandler } from './utils/request'
// 全局样式（必须在这里引入，否则 html/body/#root 不会有高度，布局撑不满整页）
import './index.scss'
// import App from './App.tsx'

// 把「token 失效时要做什么」注入给 request.ts
// 这样 request.ts 不需要反向 import store，避免循环依赖导致白屏
setUnauthorizedHandler(() => {
    // 清空 Redux + localStorage 里的登录态
    // 清完后 AuthRoute 会自动跳回登录页，不需要手动跳转或刷新页面
    store.dispatch(clearUserInfo())
})

createRoot(document.getElementById('root')!).render(
    // Provider 把 store 注入 Context，组件里的 useDispatch / useSelector 才能拿到
    <Provider store={store}>
        <RouterProvider router={router} />
    </Provider>
)
