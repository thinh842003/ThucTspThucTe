import React, { useEffect, useState } from 'react'
import { Table, Card, Typography, Skeleton, Flex } from 'antd' // Thêm Card, Typography, Flex
import userBotService from '../../service/userBotService'
import { UserSwitchOutlined } from '@ant-design/icons' // Thêm icon

const { Title } = Typography

// MÀU SẮC CHỦ ĐẠO TỪ HOME.JSX
const ACCENT_COLOR = '#ec4899'; // pink-500
const BACKGROUND_COLOR = '#0f172a'; // slate-900 (Nền tối)
const CARD_BG = '#1e293b'; // slate-800 (Nền khối chính)

const UserBot = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState([])

  const columns = [
    {
      title: <span style={{ color: ACCENT_COLOR }}>Người dùng Bot</span>,
      dataIndex: 'user',
      render: (user) => (
        <Flex vertical>
          <span className="text-white font-medium">{user.fullname}</span>
          <span className="text-gray-400 text-sm">@{user.userName}</span>
        </Flex>
      ),
      // Giữ nguyên logic sorter, nhưng dùng .userName để so sánh string
      sorter: (a, b) => a.user?.userName.localeCompare(b.user?.userName),
    },
    {
      title: <span style={{ color: ACCENT_COLOR }}>Thông tin Bot</span>,
      dataIndex: 'bot',
      render: (bot) => (
        <span className="text-white font-medium">{bot.name}</span>
      ),
      // Giữ nguyên logic sorter
      sorter: (a, b) => a.botTradingId - b.botTradingId,
    },
  ]

  useEffect(() => {
    setIsLoading(true)
    userBotService
      .getAllUserBot()
      .then((res) => setData(res.data))
      .catch((err) => {
        console.log(err)
      })
      .finally(() => setIsLoading(false))
  }, [])

  return (
    // Áp dụng nền tối cho toàn bộ trang
    <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: BACKGROUND_COLOR }}>
      <div className="space-y-6">
        
        {/* Tiêu đề */}
        <Title level={3} style={{ margin: 0, display: 'flex', alignItems: 'center', color: ACCENT_COLOR }}>
          <UserSwitchOutlined style={{ marginRight: 10 }} />
          Danh Sách Người Dùng Bot
        </Title>

        {/* Bảng dữ liệu bọc trong Card */}
        <Card 
            bordered={false}
            className="shadow-2xl rounded-xl" 
            style={{ backgroundColor: CARD_BG, border: '1px solid #374151' }}
        >
            {isLoading ? (
                <Skeleton active />
            ) : (
                <div className="overflow-x-auto custom-table-dark">
                    <Table
                        columns={columns}
                        dataSource={data}
                        className="shadow-lg"
                        rowKey={(record) => record.user?.userId + record.bot?.id}
                        pagination={{
                            showSizeChanger: true,
                            defaultPageSize: 10,
                            pageSizeOptions: ['10', '20', '50', '100'],
                        }}
                    />
                </div>
            )}
        </Card>
      </div>
      
       {/* Custom Styles for Antd Dark Mode (Đồng bộ với Home.jsx) */}
       <style>{`
            /* Table Styles */
            .custom-table-dark .ant-table {
                background: ${CARD_BG} !important;
                border-radius: 8px;
            }
            .custom-table-dark .ant-table-wrapper {
                background: ${CARD_BG} !important;
            }
            .custom-table-dark .ant-table-container {
                border-radius: 8px !important;
            }

            .custom-table-dark .ant-table-header {
                background: ${CARD_BG} !important;
                border-bottom: 1px solid #374151; /* gray-700 */
            }

            .custom-table-dark .ant-table-thead > tr > th {
                background: ${CARD_BG} !important;
                color: ${ACCENT_COLOR} !important;
                font-weight: bold;
                border-bottom: 1px solid #374151;
            }

            .custom-table-dark .ant-table-tbody > tr > td {
                background: ${CARD_BG} !important;
                color: white;
                border-bottom: 1px solid #374151;
            }
            
            /* Footer (Nếu có) */
            .custom-table-dark .ant-table-footer {
                background: #111827 !important; /* slate-900 đậm hơn */
                color: white;
                border-top: 1px solid #374151;
            }
            
            /* Hover row */
            .custom-table-dark .ant-table-tbody > tr:hover > td {
                background: #374151 !important; /* gray-700 */
            }

            /* Pagination */
            .custom-table-dark .ant-pagination-item-link,
            .custom-table-dark .ant-pagination-item {
                background-color: #374151 !important;
                border-color: #4b5563 !important;
            }
            .custom-table-dark .ant-pagination-item a,
            .custom-table-dark .ant-pagination-item-link-icon {
                color: white !important;
            }
            .custom-table-dark .ant-pagination-item-active {
                background-color: ${ACCENT_COLOR} !important;
                border-color: ${ACCENT_COLOR} !important;
            }
            .custom-table-dark .ant-pagination-item-active a {
                color: white !important;
            }
        `}</style>
    </div>
  )
}

export default UserBot