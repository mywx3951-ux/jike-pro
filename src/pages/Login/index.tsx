import './index.scss'
import { Card, Form, Input, Button, message } from 'antd'
import logo from '@/assets/logo.png'
import type { FieldType } from '@/interface'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchLogin } from '@/store/modules/user'
import type { AppDispatch } from '@/store'

const Login = () => {
    // 指定 AppDispatch，否则 dispatch 不认识 thunk 函数
    const dispatch = useDispatch<AppDispatch>()
    const navigate = useNavigate()
    const onFinish = async (formValue: FieldType) => {
        try {
            await dispatch(fetchLogin(formValue))
            navigate('/')
            message.success('登录成功')
        } catch (error) {
            // 拿不到 response 说明是网络/跨域问题，能拿到说明是账号或参数问题
            console.log(error);

            message.error('登录失败，请检查手机号或验证码')
        }
    }

    return (
        <div className="login">
            <Card className="login-container">
                <img className="login-logo" src={logo} alt="" />
                {/* 登录表单 */}
                <Form
                    layout="vertical" autoComplete="off"
                    onFinish={onFinish}
                >
                    <Form.Item
                        name="mobile"
                        validateTrigger="onBlur"
                        rules={[
                            {
                                pattern: /^1[3-9]\d{9}$/,
                                message: '手机号码格式不对'
                            }, {
                                required: true,
                                message: "请输入手机号"
                            }

                        ]}
                    >
                        <Input size="large" placeholder="请输入手机号" />
                    </Form.Item>
                    <Form.Item
                        name="code"
                        rules={
                            [{ required: true, message: '请输入验证码' },]
                        }
                        validateTrigger="onBlur"
                    >
                        <Input size="large" placeholder="请输入验证码" maxLength={6} />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" size="large" block>
                            登录
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    )
}

export default Login