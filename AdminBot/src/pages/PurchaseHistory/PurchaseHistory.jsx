import React, { useEffect, useState } from 'react'
import { Table, Card, Divider, Statistic } from 'antd'
import purchaseHistoryService from '../../service/purchaseHistoryService'
import { formatDate, formatVND } from '../../service/commonService'
import { HistoryOutlined, DollarCircleFilled } from '@ant-design/icons'

// MÀU SẮC CHỦ ĐẠO TƯƠNG TỰ HOME.JSX
const ACCENT_COLOR = '#ec4899'; // pink-500
const BACKGROUND_COLOR = '#0f172a'; // slate-900 (Nền tối)
const CARD_BG = '#1e293b'; // slate-800 (Nền khối chính)

const PurchaseHistory = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState()
  const [totalRevenue, setTotalRevenue] = useState(0) // State để lưu tổng doanh thu

  const columns = [
    {
      title: 'Tên người dùng',
      dataIndex: 'userId',
      sorter: (a, b) => a.userId.localeCompare(b.userId),
      className: 'text-white',
    },
    {
      title: 'Giá gói',
      dataIndex: 'priceBot',
      sorter: (a, b) => a.priceBot - b.priceBot,
      render: (value) => <span className="text-green-400 font-semibold">{formatVND(value)}</span>,
    },
    {
      title: 'Ngày bắt đầu của gói',
      dataIndex: 'startDate',
      render: (value) => formatDate(value),
    },
    {
      title: 'Ngày kết thúc gói',
      dataIndex: 'endDate',
      render: (value) => formatDate(value),
    },
    {
      title: 'Phương thức thanh toán',
      dataIndex: 'paymentMethod',
      sorter: (a, b) => a.paymentMethod.localeCompare(b.paymentMethod),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (status) => (
        <span className={`font-medium ${status === 'Hoàn thành' ? 'text-green-500' : 'text-yellow-500'}`}>
          {status}
        </span>
      ),
    },
  ]

  // LOGIC: Lấy dữ liệu và tính tổng doanh thu (Giữ nguyên logic API)
  useEffect(() => {
    setIsLoading(true)
    purchaseHistoryService
      .getPurchaseHistory()
      .then((res) => {
        setData(res.data)
        // Tính tổng doanh thu
        const total = res.data.reduce((sum, record) => sum + record.priceBot, 0)
        setTotalRevenue(total)
      })
      .catch((err) => {
        console.log(err)
      })
      .finally(() => setIsLoading(false))
  }, [])

  return (
    // Áp dụng nền tối cho toàn bộ trang
    <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: BACKGROUND_COLOR }}>
      <div className="space-y-8">
        
        {/* --- TIÊU ĐỀ CHÍNH --- */}
        <Divider className="!border-gray-700">
          <span className="text-gray-400 text-lg font-bold flex items-center gap-2">
            <HistoryOutlined style={{ color: ACCENT_COLOR }} /> LỊCH SỬ MUA GÓI DỊCH VỤ
          </span>
        </Divider>

        {/* --- CARD CHỨA TỔNG QUAN VÀ BẢNG --- */}
        <Card 
          className="shadow-2xl rounded-xl" 
          style={{ backgroundColor: CARD_BG, border: '1px solid #374151' }}
          loading={isLoading}
        >
          <div className="space-y-6">
            
            {/* Thẻ thống kê tổng doanh thu */}
            <Card 
                bordered={false} 
                className="shadow-md rounded-xl border-l-4"
                style={{ backgroundColor: BACKGROUND_COLOR, borderColor: ACCENT_COLOR }}
            >
                <Statistic
                    title={<span className="text-gray-400 font-semibold text-sm">TỔNG DOANH THU GHI NHẬN</span>}
                    value={formatVND(totalRevenue)}
                    valueStyle={{ color: ACCENT_COLOR, fontWeight: 'bold', fontSize: '1.5rem' }}
                    loading={isLoading}
                    prefix={<DollarCircleFilled style={{ color: ACCENT_COLOR }} />}
                />
            </Card>

            {/* Bảng Lịch sử mua hàng */}
            <div className="overflow-x-auto custom-table-dark">
              <Table
                title={() => <span className="text-xl font-semibold text-white">DANH SÁCH GIAO DỊCH</span>}
                columns={columns}
                dataSource={data}
                className="shadow-lg"
                rowKey={(record) => record.id}
                pagination={{ pageSize: 8 }}
                locale={{ emptyText: <span className="text-gray-400">Không có dữ liệu lịch sử mua gói.</span> }}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Custom Styles for Antd Dark Mode - Tương tự Home.jsx */}
      <style>{`
          /* Table Styles */
          .custom-table-dark .ant-table {
              background: ${CARD_BG} !important;
              border-radius: 8px;
              border: 1px solid #374151; /* gray-700 */
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

export default PurchaseHistory