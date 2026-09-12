# jike-pro（极客园）

一个基于 **React 19 + TypeScript + Vite** 的内容管理后台，使用 Redux Toolkit 管理全局状态、React Router 负责路由、Ant Design 提供 UI 组件。

## 技术栈

| 分类 | 技术 |
| --- | --- |
| 框架 | React 19 |
| 语言 | TypeScript |
| 构建工具 | Vite |
| 路由 | React Router 7 |
| 状态管理 | Redux Toolkit + React Redux |
| UI 组件库 | Ant Design 6 |
| 网络请求 | Axios |
| 图表 | ECharts |
| 样式 | Sass |

## 已实现功能

- **登录鉴权**：登录成功后把 token 写入 Redux 与 localStorage，刷新页面登录态不丢失
- **路由守卫**：未登录时访问受保护页面会自动跳转到登录页
- **请求封装**：axios 实例统一配置 baseURL、超时时间，请求拦截器自动携带 token，响应拦截器统一抽取数据

## 快速开始

### 环境要求

- Node.js 18 及以上
- npm（项目使用 npm 管理依赖，含 `package-lock.json`）

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

启动后访问终端提示的地址（默认 <http://localhost:5173>）。

### 打包构建

```bash
npm run build
```

### 代码检查

```bash
npm run lint
```

### 本地预览打包产物

```bash
npm run preview
```

## 目录结构

```txt
src/
├── apis/              # 接口请求方法
├── assets/            # 静态资源（图片等）
├── components/        # 公共组件
│   └── AuthRoute/     # 路由权限守卫
├── hooks/             # 自定义 Hook
├── interface/         # 全局 TypeScript 类型定义
├── pages/             # 页面组件
│   ├── Article/       # 文章管理
│   ├── Home/          # 首页
│   ├── Layout/        # 布局（侧边栏 / 顶栏）
│   ├── Login/         # 登录页
│   └── Publish/       # 文章发布
├── router/            # 路由配置
├── store/             # Redux Toolkit 状态管理
│   ├── index.ts       # 创建全局 store，导出 RootState / AppDispatch 类型
│   └── modules/       # 按业务拆分的切片（slice）
├── utils/             # 工具函数
│   ├── request.ts     # axios 实例与请求 / 响应拦截器
│   └── token.ts       # token 的 localStorage 读写封装
├── main.tsx           # 入口文件（挂载 Provider 与路由）
└── index.scss         # 全局样式
```

## 项目说明

### 接口代理

接口服务地址为 `https://geek.itheima.net/v1_0`。

浏览器的同源策略会拦截跨域请求，且该服务未返回 CORS 响应头，因此**开发环境通过 Vite 代理转发**：

- `src/utils/request.ts` 中 `baseURL` 设为相对路径 `/api`
- `vite.config.ts` 中配置 `server.proxy`，把 `/api` 前缀去掉后转发到真实地址

这样请求始终发往本地开发服务器（同源），由开发服务器代为请求，从根本上避免了跨域问题。

> 注意：代理只在 `npm run dev` 时生效。部署到生产环境需要由 Nginx 反向代理或后端同域部署来承担同样的职责。

### 测试账号

```txt
手机号：13911111111
验证码：246810
```

## 关于 Vite 模板

本项目由 Vite 官方 React + TypeScript 模板创建。

目前官方提供两个 React 插件：

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) 基于 [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) 基于 [SWC](https://swc.rs/)

## 关于 React Compiler

出于对开发与构建性能的影响，本模板默认**未启用** React Compiler。如需启用，请参考 [React 官方文档](https://react.dev/learn/react-compiler/installation)。

## 扩展 ESLint 配置

如果要把本项目用于生产环境，建议开启「类型感知（type-aware）」的 lint 规则，配置方式如下：

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // 其他配置...

      // 把 tseslint.configs.recommended 替换为下面这一行
      tseslint.configs.recommendedTypeChecked,
      // 需要更严格的规则时用这个
      tseslint.configs.strictTypeChecked,
      // 需要风格类规则时可以再加上这一行
      tseslint.configs.stylisticTypeChecked,

      // 其他配置...
    },
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // 其他选项...
    },
  },
])

```

也可以安装 [eslint-plugin-react-x](https://npmx.dev/package/eslint-plugin-react-x) 和 [eslint-plugin-react-dom](https://npmx.dev/package/eslint-plugin-react-dom) 来启用 React 专属的 lint 规则：

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // 其他配置...
      // 启用 React 相关规则
      reactX.configs['recommended-typescript'],
      // 启用 React DOM 相关规则
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // 其他选项...
    },
  },
])

```
