export interface FieldType {
    mobile: string
    code: string
}

// 用户信息（GET /user/profile）
export interface UserInfo {
    // 用户 id
    id: string
    // 用户名字
    name: string
    // 用户头像地址
    photo: string
    // 用户手机号
    mobile: string
    // 用户性别：0 男，1 女（字面量联合类型，只能取这两个值）
    gender: 0 | 1
    // 用户生日，格式：年-月-日
    birthday: string
    // 用户介绍，没有则为 null
    intro: string | null
}