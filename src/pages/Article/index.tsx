import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    Breadcrumb,
    Button,
    Card,
    DatePicker,
    Form,
    Popconfirm,
    Radio,
    Select,
    Space,
    Table,
    Tag,
    message,
} from 'antd'
import type { TableProps } from 'antd'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
// RangePicker 的中文包：不传的话面板和占位文字都是英文
import locale from 'antd/es/date-picker/locale/zh_CN'
import { deleteArticle, getArticleList, getChannels } from '@/apis/article'
import type { Article as ArticleItem, ArticleFilterForm, ArticleListParams, Channel } from '@/interface'
// 没有封面的文章用这张兜底图（封面那一列不允许出现破图）
import img404 from '@/assets/error.png'

const { Option } = Select
const { RangePicker } = DatePicker

// 接口返回的状态是数字，这里统一映射成文案 + Tag 颜色
const STATUS_MAP: Record<number, { text: string; color: string }> = {
    0: { text: '草稿', color: 'orange' },
    1: { text: '审核中', color: 'blue' },
    2: { text: '审核通过', color: 'green' },
}

// 每页条数：分页组件和请求参数共用
const PER_PAGE = 5

// 内容管理（对应路由 /article）
const Article = () => {
    const navigate = useNavigate()
    // 频道列表（筛选条件用）
    const [channels, setChannels] = useState<Channel[]>([])
    // 文章列表数据
    const [articleList, setArticleList] = useState<ArticleItem[]>([])
    // 总条数：分页和卡片标题都用它
    const [count, setCount] = useState(0)
    const [loading, setLoading] = useState(false)
    // 查询参数：筛选条件和分页放在同一个对象里，当作列表的"单一数据源"。
    // 参数一变下面的 effect 就会重新请求，所以筛选、翻页、删除后都只需要改它
    const [params, setParams] = useState<ArticleListParams>({
        page: 1,
        per_page: PER_PAGE,
    })

    // 频道列表只请求一次
    useEffect(() => {
        getChannels()
            .then((res) => setChannels(res.data.channels))
            .catch(() => {
                message.error('频道列表加载失败，请刷新页面重试')
            })
    }, [])

    // 拉取文章列表：params 变化就重新请求
    useEffect(() => {
        // 组件卸载后不再 setState；同时防止先发出的旧请求覆盖后发出的新请求
        let ignore = false

        const fetchArticleList = async () => {
            setLoading(true)
            try {
                const res = await getArticleList(params)
                if (ignore) return
                setArticleList(res.data.results)
                setCount(res.data.total_count)
            } catch (error) {
                console.log(error)
                if (!ignore) message.error('文章列表加载失败，请稍后重试')
            } finally {
                if (!ignore) setLoading(false)
            }
        }
        fetchArticleList()

        return () => {
            ignore = true
        }
    }, [params])

    // 筛选：提交表单后拼装查询参数
    const onFinish = (formValue: ArticleFilterForm) => {
        const { channel_id, date, status } = formValue
        setParams({
            // 筛选后要回到第一页，否则会停在上一次的分页上，
            // 出现"明明有数据却查不到"的假象
            page: 1,
            per_page: PER_PAGE,
            // 「全部」传的是空字符串，对接口没有意义，转成 undefined 让 axios 直接不带这个参数
            status: status === '' ? undefined : status,
            channel_id,
            begin_pubdate: date?.[0]?.format('YYYY-MM-DD'),
            end_pubdate: date?.[1]?.format('YYYY-MM-DD'),
        })
    }

    // 翻页：只改 page，筛选条件保持不变
    const pageChange = (page: number) => {
        setParams({ ...params, page })
    }

    // 删除文章
    const delArticle = async (data: ArticleItem) => {
        try {
            await deleteArticle(data.id)
            message.success('删除文章成功')
            // 这一页只剩要删的这条时，删完得往前翻一页，不然会停在一个空页上
            const nextPage = articleList.length === 1 && params.page > 1 ? params.page - 1 : params.page
            // setParams 传入的是新对象，即使 page 没变也会触发上面的 effect 重新请求
            setParams({ ...params, page: nextPage })
        } catch (error) {
            console.log(error)
            message.error('删除文章失败，请稍后重试')
        }
    }

    // 表格列定义
    const columns: TableProps<ArticleItem>['columns'] = [
        {
            title: '封面',
            dataIndex: 'cover',
            width: 120,
            // 这里没用第一个参数，直接从整行数据 record 里取，字段类型有提示
            render: (_, record) => (
                <img src={record.cover.images[0] || img404} width={80} height={60} alt="" />
            ),
        },
        {
            title: '标题',
            dataIndex: 'title',
            width: 220,
        },
        {
            title: '状态',
            dataIndex: 'status',
            render: (status: number) => {
                const item = STATUS_MAP[status]
                return <Tag color={item?.color}>{item?.text ?? '未知状态'}</Tag>
            },
        },
        {
            title: '发布时间',
            dataIndex: 'pubdate',
        },
        {
            title: '阅读数',
            dataIndex: 'read_count',
        },
        {
            title: '评论数',
            dataIndex: 'comment_count',
        },
        {
            title: '点赞数',
            dataIndex: 'like_count',
        },
        {
            title: '操作',
            // 这列没有 dataIndex，整行数据只能从 record 拿
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="primary"
                        shape="circle"
                        icon={<EditOutlined />}
                        // 带上 id 跳到发布页，编辑文章模块就是靠这个 id 回填数据的
                        onClick={() => navigate(`/publish?id=${record.id}`)}
                    />
                    <Popconfirm
                        title="确认删除该条文章吗?"
                        okText="确认"
                        cancelText="取消"
                        onConfirm={() => delArticle(record)}
                    >
                        <Button type="primary" danger shape="circle" icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ]

    return (
        <div className="article">
            <Card
                title={
                    <Breadcrumb
                        items={[
                            { title: <Link to="/">首页</Link> },
                            { title: '文章列表' },
                        ]}
                    />
                }
                style={{ marginBottom: 20 }}
            >
                {/* initialValues：进页面默认选中「全部」 */}
                <Form initialValues={{ status: '' }} onFinish={onFinish}>
                    <Form.Item label="状态" name="status">
                        <Radio.Group>
                            <Radio value="">全部</Radio>
                            <Radio value={0}>草稿</Radio>
                            <Radio value={2}>审核通过</Radio>
                        </Radio.Group>
                    </Form.Item>

                    <Form.Item label="频道" name="channel_id">
                        <Select placeholder="请选择文章频道" style={{ width: 200 }} allowClear>
                            {channels.map((item) => (
                                <Option key={item.id} value={item.id}>
                                    {item.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item label="日期" name="date">
                        <RangePicker locale={locale} />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" style={{ marginLeft: 40 }}>
                            筛选
                        </Button>
                    </Form.Item>
                </Form>
            </Card>

            <Card title={`根据筛选条件共查询到 ${count} 条结果：`}>
                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={articleList}
                    loading={loading}
                    pagination={{
                        current: params.page,
                        pageSize: params.per_page,
                        total: count,
                        onChange: pageChange,
                        // 每页条数固定，关掉尺寸切换器，避免和请求参数对不上
                        showSizeChanger: false,
                    }}
                />
            </Card>
        </div>
    )
}

export default Article
