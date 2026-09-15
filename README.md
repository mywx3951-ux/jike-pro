# jike-pro（极客园）

一个基于 **React 19 + TypeScript + Vite** 的内容管理后台，使用 Redux Toolkit 管理全局状态、React Router 负责路由、Ant Design 提供 UI 组件。

> 各模块的实现细节、接口联调结论、发现的坑和后续待办，都记在 [开发记录.md](./开发记录.md) 里，继续开发前先看它。

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
- **首页数据概览**：统计卡片 + ECharts 折线图展示文章发布趋势（ECharts 按需引入，图表实例由 `useECharts` 托管生命周期、随容器自适应）。数据已对接 `GET /statistics`；演示后端该接口固定返回 `data: null`，返回为空时自动回退到 `src/apis/home.ts` 里的模拟数据，页面无需改动
- **发布 / 编辑文章**：面包屑 + 表单（标题 / 频道 / 富文本内容 / 封面），频道列表来自 `GET /channels`，富文本用 `react-quill-new`，封面支持单图、三图、无图三种类型（`Upload` 走 `/api/upload` 代理并手动携带 token），图片列表受控 + 用 ref 当仓库，切换类型时按需取图；新增走 `POST /mp/articles?draft=false`。带 `?id=xxx` 进入时自动拉取详情回填（`GET /mp/articles/:id`），提交改为 `PUT /mp/articles/:id?draft=false`，面包屑和按钮切换为「编辑文章 / 更新文章」，成功后跳回文章列表
- **文章列表**：筛选区（状态 / 频道 / 日期区间）+ 表格 + 分页 + 删除（Popconfirm 二次确认）+ 编辑跳转。筛选条件和分页统一放在一个 `params` 对象里当单一数据源，参数一变就重新请求，所以筛选、翻页、删除后都只改它
- **界面中文化**：`main.tsx` 用 `ConfigProvider locale={zhCN}` 处理 antd 组件内置文案（表格空数据、分页等），并设置 `dayjs.locale('zh-cn')`——日期面板的月份、星期取自 dayjs 语言包，只引 antd 的 locale 是不够的

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

`vite.config.ts` 已设置 `base: './'`（资源按相对路径引用，部署到任意子目录不会 404），`npm run preview` 预览产物时同样走 `/api` 代理，方便本地验证打包后的接口链路。生产部署需要由 Nginx 反向代理 `/api`，并把所有路由 fallback 到 `index.html`。

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
