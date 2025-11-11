import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, Button, Input, message, Card, Modal, List, Tooltip, Spin } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5131';

interface BotItem {
    id?: number;
    Id?: number;
    name?: string;
    Name?: string;
    botTradingId?: number;
}

interface Webhook {
    id?: number;
    webhookUrl: string;
}

// Màu sắc
const ACCENT_COLOR = '#ec4899';
const PRIMARY_COLOR = '#1e293b';
const BACKGROUND_COLOR = '#0f172a';

const UserBotWebhookManager: React.FC = () => {
    const { botId: routeBotId } = useParams();
    const navigate = useNavigate();
    const [bots, setBots] = useState<BotItem[]>([]);
    const [webhooks, setWebhooks] = useState<Record<number, Webhook[]>>({});
    const [webhooksLoading, setWebhooksLoading] = useState<Record<number, boolean>>({});
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalBot, setModalBot] = useState<BotItem | null>(null);
    const [linkValue, setLinkValue] = useState('');
    const [modalLoading, setModalLoading] = useState(false);

    const getToken = () => {
        return localStorage.getItem('access_token') || getCookie('access_token') || getCookie('jwt');
    };

    const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        return parts.length === 2 ? parts.pop()?.split(';').shift() : null;
    };

    const getAuthHeaders = () => {
        const token = getToken();
        return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : {};
    };

    const validateWebhookUrl = (url: string) => {
        return url.startsWith('https://discord.com/api/webhooks/') ||
            url.startsWith('https://discordapp.com/api/webhooks/');
    };

    useEffect(() => {
        fetchBots();
    }, []);

    const fetchBots = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/api/botTrading/getAll`, { headers: getAuthHeaders() });

            if (!Array.isArray(res.data)) {
                message.error('Dữ liệu bot không hợp lệ');
                setBots([]); setWebhooks({}); return;
            }

            const fetchedBots = res.data;
            setBots(fetchedBots);

            const validBots = fetchedBots.filter((bot): bot is BotItem & { botTradingId: number } =>
                !!(bot.id ?? bot.Id ?? bot.botTradingId)
            );

            if (validBots.length === 0) { setWebhooks({}); return; }

            const promises = validBots.map(bot => {
                const botId = bot.id ?? bot.Id ?? bot.botTradingId;
                setWebhooksLoading(prev => ({ ...prev, [botId]: true }));

                return axios.get(`${API_URL}/api/userbot/${botId}/links`, { headers: getAuthHeaders() })
                    .then(res => ({ botId, data: res.data }))
                    .catch(err => {
                        if (axios.isAxiosError(err) && err.response?.status === 401) {
                            message.error('Phiên đăng nhập hết hạn'); navigate('/login');
                        }
                        return { botId, data: [] };
                    })
                    .finally(() => setWebhooksLoading(prev => ({ ...prev, [botId]: false })));
            });

            const responses = await Promise.all(promises);
            const map: Record<number, Webhook[]> = {};
            responses.forEach(r => {
                map[r.botId] = Array.isArray(r.data) ? r.data.map(url => ({ webhookUrl: url })) : [];
            });
            setWebhooks(map);
        } catch (err) {
            const msg = axios.isAxiosError(err) ? JSON.stringify(err.response?.data) : (err as Error).message;
            message.error(`Tải bot thất bại: ${msg}`);
            setBots([]); setWebhooks({});
        } finally {
            setLoading(false);
        }
    };

    const openAddModal = (bot: BotItem) => {
        if (!getToken()) {
            message.error('Vui lòng đăng nhập'); navigate('/login'); return;
        }
        setModalBot(bot); setLinkValue(''); setModalVisible(true);
    };

    const submitLink = async () => {
        if (!modalBot || !linkValue) return message.warning('Vui lòng nhập URL');
        if (!validateWebhookUrl(linkValue)) return message.error('URL không hợp lệ');

        const botId = modalBot.id ?? modalBot.Id ?? modalBot.botTradingId ?? routeBotId;
        if (!botId) return message.error('Thiếu ID bot');

        try {
            setModalLoading(true);
            const res = await axios.post(`${API_URL}/api/userbot/${botId}/links`, { webhookUrl: linkValue }, { headers: getAuthHeaders() });
            const newWebhooks = Array.isArray(res.data) ? res.data.map(url => ({ webhookUrl: url })) : [];

            setWebhooks(prev => ({ ...prev, [botId]: newWebhooks }));
            message.success('Thêm thành công'); setModalVisible(false);
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.status === 401) {
                message.error('Phiên hết hạn'); navigate('/login');
            } else {
                message.error('Thêm thất bại');
            }
        } finally {
            setModalLoading(false);
        }
    };

    const deleteLink = async (botId: number, webhookUrl: string) => {
        try {
            setLoading(true);
            const res = await axios.delete(`${API_URL}/api/userbot/${botId}/links`, {
                params: { webhookUrl }, headers: getAuthHeaders()
            });
            const updated = Array.isArray(res.data) ? res.data.map(url => ({ webhookUrl: url })) : [];
            setWebhooks(prev => ({ ...prev, [botId]: updated }));
            message.success('Xóa thành công');
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.status === 401) {
                message.error('Phiên hết hạn'); navigate('/login');
            } else {
                message.error('Xóa thất bại');
            }
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Bot',
            key: 'name',
            render: (_: any, record: BotItem) => (
                <span style={{ color: 'black', fontWeight: 500 }}>
                    {record.name ?? record.Name ?? `Bot ${record.id ?? record.Id ?? record.botTradingId ?? 'Unknown'}`}
                </span>
            ),
        },
        {
            title: 'Discord Webhooks',
            key: 'webhooks',
            render: (_: any, record: BotItem) => {
                const botId = record.id ?? record.Id ?? record.botTradingId;
                if (!botId) return <span style={{ color: 'black' }}>Không có ID</span>;
                const items = webhooks[botId] || [];
                const loading = !!webhooksLoading[botId];
                if (loading) return <Spin size="small" />;

                return (
                    <List
                        className="custom-list"
                        dataSource={items}
                        locale={{ emptyText: <span style={{ color: '#888' }}>Chưa có webhook</span> }}
                        renderItem={(webhook) => (
                            <List.Item
                                className="hover:bg-slate-700 transition-colors"
                                actions={[
                                    <Tooltip title="Xóa">
                                        <Button icon={<DeleteOutlined />} onClick={() => deleteLink(botId, webhook.webhookUrl)} danger size="small" />
                                    </Tooltip>
                                ]}
                            >
                                <Tooltip title={webhook.webhookUrl}>
                                    <span style={{
                                        color: 'black',
                                        fontWeight: 500,
                                        display: 'inline-block',
                                        maxWidth: '400px',
                                        cursor: 'pointer',
                                        wordBreak: 'break-all' as const,
                                    }}>
                                        {webhook.webhookUrl.length > 50 ? `${webhook.webhookUrl.substring(0, 50)}...` : webhook.webhookUrl}
                                    </span>
                                </Tooltip>
                            </List.Item>
                        )}
                    />
                );
            },
        },
        {
            title: 'Hành động',
            key: 'actions',
            render: (_: any, record: BotItem) => (
                <Button
                    type="primary"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => openAddModal(record)}
                    disabled={!(record.id ?? record.Id ?? record.botTradingId)}
                    style={{
                        backgroundColor: ACCENT_COLOR,
                        borderColor: ACCENT_COLOR,
                        borderRadius: 6,
                        fontWeight: 500,
                        boxShadow: '0 2px 4px rgba(236, 72, 153, 0.2)',
                    }}
                    className="hover:scale-105 transition-transform"
                >
                    Thêm Webhook
                </Button>
            ),
        },
    ];

    return (
        <div>
            <style>{`
                .custom-table .ant-table-cell,
                .custom-table .ant-table-cell * {
                    color: black !important;
                }
                .custom-table .ant-table-row:hover > td,
                .custom-table .ant-table-row:hover > td * {
                    background-color: #334155 !important;
                    color: white !important;
                }
                .ant-table-thead > tr > th,
                .ant-table-thead > tr > th * {
                    color: black !important;
                    background-color: white !important;
                }
                .custom-list .ant-list-item,
                .custom-list .ant-list-item * {
                    color: black !important;
                }
                .custom-list .ant-list-item:hover,
                .custom-list .ant-list-item:hover * {
                    background-color: #334155 !important;
                    color: white !important;
                }
                .custom-modal-input .ant-input {
                    background-color: white !important;
                    color: black !important;
                    border: 1px solid #d1d5db !important;
                }
                .custom-modal-input .ant-input::placeholder {
                    color: #6b7280 !important;
                }
                .custom-modal-input .ant-input:focus {
                    border-color: ${ACCENT_COLOR} !important;
                    box-shadow: 0 0 0 2px rgba(236, 72, 153, 0.2) !important;
                }
            `}</style>

            <div className="p-6 max-w-7xl mx-auto">
                <Card
                    title="Quản lý Webhook Discord cho Bot"
                    loading={loading}
                    className="rounded-lg shadow-lg border-0 custom-table"
                    headStyle={{
                        fontSize: '1.2em',
                        fontWeight: 500,
                        backgroundColor: BACKGROUND_COLOR,
                        color: 'white',
                        borderBottom: `2px solid ${ACCENT_COLOR}`
                    }}
                    bodyStyle={{ backgroundColor: '#ffffff' }}
                >
                    {bots.length === 0 && !loading && (
                        <p className="text-center text-gray-500">Không có bot nào</p>
                    )}
                    <Table
                        columns={columns}
                        dataSource={bots}
                        rowKey={(r, i) => (r.id ?? r.Id ?? r.botTradingId ?? `bot-${i}`).toString()}
                        pagination={false}
                        className="mt-4 custom-table"
                    />
                </Card>

                <Modal
                    title={<span style={{ color: 'white', fontWeight: 500 }}>
                        Thêm webhook cho {modalBot?.name ?? modalBot?.Name ?? 'bot'}
                    </span>}
                    open={modalVisible}
                    onOk={submitLink}
                    onCancel={() => setModalVisible(false)}
                    okText="Lưu"
                    cancelText="Hủy"
                    confirmLoading={modalLoading}
                    bodyStyle={{ padding: '20px', backgroundColor: PRIMARY_COLOR }}
                    modalRender={modal => (
                        <div className="bg-slate-800 rounded-xl overflow-hidden shadow-2xl">
                            {modal}
                        </div>
                    )}
                >
                    <Spin spinning={modalLoading}>
                        <Input
                            value={linkValue}
                            onChange={e => setLinkValue(e.target.value.trim())}
                            placeholder="https://discord.com/api/webhooks/..."
                            className="custom-modal-input h-11 text-base"
                            style={{ borderRadius: 8 }}
                        />
                    </Spin>
                </Modal>
            </div>
        </div>
    );
};

export default UserBotWebhookManager;