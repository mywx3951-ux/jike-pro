import { useEffect, useRef, useState } from 'react'
import {
    Breadcrumb,
    Button,
    Card,
    Form,
    Input,
    Radio,
    Select,
    Space,
    Upload,
    message,
} from 'antd'
import type { UploadFile, UploadProps } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import ReactQuill from 'react-quill-new'
// 富文本编辑器自带样式，必须引，否则工具栏和编辑区都没有样式
import 'react-quill-new/dist/quill.snow.css'
import { getChannels, publishArticle } from '@/apis/article'
import { getToken } from '@/utils/token'
import type {
    Channel,
    CoverType,
    PublishArticleParams,
    PublishFormValue,
    UploadResponse,
} from '@/interface'
import './index.scss'

const { Option } = Select

// Upload 的 fileList 元素类型：把响应体的类型传进去，item.response.data.url 就有提示了
type CoverFile = UploadFile<UploadResponse>

// 封面类型的默认值：表单的 initialValues 和 state 都用它，
// 抽成常量就不会出现"两边改了其中一个"导致的状态不同步
const DEFAULT_COVER_TYPE: CoverType = 1

// 发布文章（对应路由 /publish）
const Publish = () => {
    // Form 实例：发布成功后用它重置表单
    const [form] = Form.useForm<PublishFormValue>()
    // 频道列表
    const [channels, setChannels] = useState<Channel[]>([])
    // 封面类型：除了提交给接口，还要控制上传框的显隐和可上传数量，所以单独放一份 state
    const [imageType, setImageType] = useState<CoverType>(DEFAULT_COVER_TYPE)
    // 当前显示在上传框里的图片（受控 fileList，antd 只认这个）
    const [imageList, setImageList] = useState<CoverFile[]>([])
    // 图片仓库：切到单图只显示一张，再切回三图还能把之前上传的都拿回来
    const cacheImageList = useRef<CoverFile[]>([])
    // 发布中的 loading，防止连点重复提交
    const [submitting, setSubmitting] = useState(false)

    // 只要页面挂载就拉一次频道列表
    useEffect(() => {
        getChannels()
            .then((res) => setChannels(res.data.channels))
            .catch(() => {
                message.error('频道列表加载失败，请刷新页面重试')
            })
    }, [])

    // 上传状态变化：同步最新的文件列表到 state 和仓库
    const onUploadChange: UploadProps['onChange'] = (info) => {
        const { fileList } = info
        setImageList(fileList)
        cacheImageList.current = fileList
        // token 失效、图片过大等情况会走到这里，给个提示不然用户一脸懵
        if (info.file.status === 'error') {
            message.error(`${info.file.name} 上传失败`)
        }
    }

    // 切换封面类型：从仓库里按需取图，而不是直接把已上传的丢掉
    const onImageTypeChange = (type: CoverType) => {
        setImageType(type)
        if (type === 1) {
            // 单图只取第一张
            setImageList(cacheImageList.current.slice(0, 1))
        } else if (type === 3) {
            // 三图把仓库里的一股脑取出来
            setImageList(cacheImageList.current)
        }
    }

    // 提交：校验通过才会走到这里
    const onFinish = async (formValue: PublishFormValue) => {
        // 类型和数量必须对得上：单图 1 张、三图 3 张、无图 0 张
        if (imageType !== imageList.length) {
            message.warning('图片类型和数量不一致')
            return
        }
        // 图片还在上传中就提交，拿到的是空地址，接口会存下一张破图
        if (imageList.some((item) => item.status === 'uploading')) {
            message.warning('图片还在上传中，请稍候')
            return
        }

        const { channel_id, content, title } = formValue
        const data: PublishArticleParams = {
            channel_id,
            content,
            title,
            type: imageType,
            cover: {
                type: imageType,
                // 上传接口返回的地址在 response.data.url 里
                images: imageList.map((item) => item.response?.data.url ?? ''),
            },
        }

        try {
            setSubmitting(true)
            await publishArticle(data)
            message.success('发布文章成功')
            // 发布成功就清空表单，方便接着写下一篇。
            // 注意：resetFields 会把封面的 Radio 恢复成 initialValues 里的默认值，
            // 所以 imageType 这个 state 也必须一起复位，否则表单显示"单图"、
            // state 还停留在"三图"，下一篇发布会被数量校验误拦
            form.resetFields()
            setImageType(DEFAULT_COVER_TYPE)
            setImageList([])
            cacheImageList.current = []
        } catch (error) {
            // 拿不到 response 一般是网络问题，能拿到就是参数或权限问题
            console.log(error)
            message.error('发布文章失败，请稍后重试')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="publish">
            <Card
                title={
                    <Breadcrumb
                        items={[
                            { title: <Link to="/">首页</Link> },
                            { title: '发布文章' },
                        ]}
                    />
                }
            >
                <Form
                    form={form}
                    labelCol={{ span: 4 }}
                    wrapperCol={{ span: 16 }}
                    // content 给个空串：让富文本编辑器一开始就是受控的
                    initialValues={{ type: DEFAULT_COVER_TYPE, content: '' }}
                    onFinish={onFinish}
                >
                    <Form.Item
                        label="标题"
                        name="title"
                        rules={[{ required: true, message: '请输入文章标题' }]}
                    >
                        <Input placeholder="请输入文章标题" style={{ width: 400 }} />
                    </Form.Item>

                    <Form.Item
                        label="频道"
                        name="channel_id"
                        rules={[{ required: true, message: '请选择文章频道' }]}
                    >
                        <Select placeholder="请选择文章频道" style={{ width: 400 }}>
                            {channels.map((item) => (
                                <Option key={item.id} value={item.id}>
                                    {item.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="内容"
                        name="content"
                        rules={[{ required: true, message: '请输入文章内容' }]}
                    >
                        <ReactQuill
                            className="publish-quill"
                            theme="snow"
                            placeholder="请输入文章内容"
                        />
                    </Form.Item>

                    <Form.Item label="封面">
                        {/* antd v6 里 direction 已废弃，用 orientation */}
                        <Space orientation="vertical" size={12}>
                            <Form.Item name="type" noStyle>
                                <Radio.Group
                                    onChange={(e) => onImageTypeChange(e.target.value as CoverType)}
                                >
                                    <Radio value={1}>单图</Radio>
                                    <Radio value={3}>三图</Radio>
                                    <Radio value={0}>无图</Radio>
                                </Radio.Group>
                            </Form.Item>

                            {/* 只有单图/三图才需要上传，无图就把上传框收起来 */}
                            {imageType > 0 && (
                                <Upload
                                    name="image"
                                    listType="picture-card"
                                    showUploadList
                                    // 走 vite 代理，和 axios 一样是同源请求，不会跨域
                                    action="/api/upload"
                                    // Upload 内部用的是 XMLHttpRequest，不走 axios 的拦截器，
                                    // 所以 token 必须手动带上，否则接口 401
                                    headers={{ Authorization: `Bearer ${getToken() ?? ''}` }}
                                    // 受控：fileList 由我们的 state 说了算
                                    fileList={imageList}
                                    onChange={onUploadChange}
                                    // 单图最多 1 张，三图最多 3 张
                                    maxCount={imageType}
                                    multiple={imageType > 1}
                                >
                                    <div style={{ marginTop: 8 }}>
                                        <PlusOutlined />
                                    </div>
                                </Upload>
                            )}
                        </Space>
                    </Form.Item>

                    <Form.Item wrapperCol={{ offset: 4 }}>
                        <Space>
                            <Button
                                size="large"
                                type="primary"
                                htmlType="submit"
                                loading={submitting}
                            >
                                发布文章
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    )
}

export default Publish
