import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { Provider } from 'react-redux'
import router from './router'
import store from './store'
// import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
    // Provider 把 store 注入 Context，组件里的 useDispatch / useSelector 才能拿到
    <Provider store={store}>
        <RouterProvider router={router} />
    </Provider>
)
