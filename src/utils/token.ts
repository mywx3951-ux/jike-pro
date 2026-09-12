// token 本地持久化封装（localStorage）
// 作用：让登录态在刷新页面后依然保留

// localStorage 的 key 单独抽出来，避免多处硬编码写错
const TOKEN_KEY = 'jike_token'

/**
 * 读取 token
 * @returns 有值就返回 token 字符串，没有则返回 null
 */
const getToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY)
}

/**
 * 保存 token
 * @param token 登录接口返回的 token
 */
const setToken = (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token)
}

/**
 * 删除 token（退出登录、token 失效时使用）
 */
const removeToken = (): void => {
    localStorage.removeItem(TOKEN_KEY)
}

export { TOKEN_KEY, getToken, setToken, removeToken }
