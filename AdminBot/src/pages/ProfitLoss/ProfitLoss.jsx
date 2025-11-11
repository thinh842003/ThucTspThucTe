import React, { useEffect, useState } from 'react'
import { Button, Modal, Spin, Table, Card, Divider } from 'antd'
import { formatDateTime, formatVND } from '../../service/commonService'
import { DeleteOutlined, DollarCircleOutlined } from '@ant-design/icons'
import { useMessage } from '../../App'
import profitLossService from '../../service/profitLossService'

// MÀU SẮC CHỦ ĐẠO TƯƠNG TỰ HOME.JSX
const ACCENT_COLOR = '#ec4899'; // pink-500
const BACKGROUND_COLOR = '#0f172a'; // slate-900 (Nền tối)
const CARD_BG = '#1e293b'; // slate-800 (Nền khối chính)

const ProfitLoss = () => {
  const { antMessage } = useMessage()
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [id, setID] = useState('')
  const [loadingDelete, setLoadingDelete] = useState(false)

  const columns = [
    {
      title: 'Tên người dùng',
      dataIndex: 'fullname',
      sorter: (a, b) => a.fullname.localeCompare(b.fullname),
    },
    {
      title: 'Thời gian',
      dataIndex: 'date',
      render: (value) => formatDateTime(value),
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
    {
      title: 'Lợi nhuận',
      dataIndex: 'price',
      render: (value) => <span style={{ color: value > 0 ? '#4ade80' : '#f43f5e', fontWeight: 'bold' }}>{formatVND(value)}</span>, // Dynamic color
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: 'Thực hiện',
      render: (_, record) => (
        <Button
          className="text-red-500 border-0 hover:!text-red-400"
          icon={<DeleteOutlined />}
          onClick={() => {
            setIsModalOpen(true)
            setID(record.id)
          }}
          type="text"
          danger
        />
      ),
    },
  ]

  // LOGIC: Lấy dữ liệu (Giữ nguyên)
  useEffect(() => {
    setIsLoading(true)
    profitLossService
      .getProfitLoss()
      .then((res) => setData(res.data))
      .catch((err) => {
        console.log(err)
        antMessage.error('Không thể tải dữ liệu lợi nhuận/thua lỗ.')
      })
      .finally(() => setIsLoading(false))
  }, [antMessage])

  // LOGIC: Xử lý xóa (Giữ nguyên)
  const handleOk = () => {
    setLoadingDelete(true)
    profitLossService
      .deleteProfitLoss(id)
      .then(() => {
        const newData = data.filter((item) => item.id !== id)
        setData(newData)
        antMessage.success('Xóa thành công.')
      })
      .catch((err) => {
        console.log(err)
        antMessage.error(err.response?.data?.message || 'Lỗi khi xóa lợi nhuận/thua lỗ.')
      })
      .finally(() => {
        setLoadingDelete(false)
        setIsModalOpen(false)
      })
  }

  // Tính tổng lợi nhuận
  const totalProfit = data?.reduce((sum, item) => sum + item.price, 0) || 0;
  const totalProfitColor = totalProfit >= 0 ? '#4ade80' : '#ef4444'; // green or red

  return (
    // Áp dụng nền tối cho toàn bộ trang
    <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: BACKGROUND_COLOR }}>
      <div className="space-y-8">
        
        {/* --- TIÊU ĐỀ CHÍNH --- */}
        <Divider className="!border-gray-700">
          <span className="text-gray-400 text-lg font-bold flex items-center gap-2">
            <DollarCircleOutlined style={{ color: ACCENT_COLOR }} /> CHI TIẾT LỢI NHUẬN / THUA LỖ CỦA NGƯỜI DÙNG
          </span>
        </Divider>

        {/* --- CARD CHỨA TỔNG QUAN --- */}
        <Card 
          className="shadow-2xl rounded-xl" 
          style={{ backgroundColor: CARD_BG, border: '1px solid #374151' }}
        >
          <div className="space-y-6">
            
            {/* Tổng lợi nhuận chung */}
            <Card 
              bordered={false} 
              className="shadow-md rounded-xl"
              style={{ backgroundColor: BACKGROUND_COLOR, border: `1px solid ${totalProfitColor}` }}
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-400 font-semibold text-lg">TỔNG LỢI NHUẬN RÒNG ĐÃ GHI NHẬN</span>
                <span 
                  className="font-extrabold text-2xl" 
                  style={{ color: totalProfitColor }}
                >
                  {formatVND(totalProfit)}
                </span>
              </div>
            </Card>

            {/* Bảng Chi tiết Lợi nhuận/Thua lỗ */}
            <div className="overflow-x-auto custom-table-dark">
              <Table
                title={() => <span className="text-xl font-semibold text-white">DANH SÁCH CHI TIẾT</span>}
                loading={isLoading}
                columns={columns}
                dataSource={data}
                className="shadow-lg"
                rowKey={(record) => record.id}
                pagination={{ pageSize: 8 }}
                locale={{ emptyText: <span className="text-gray-400">Không có dữ liệu lợi nhuận/thua lỗ nào.</span> }}
              />
            </div>
          </div>
        </Card>

      </div>
      
      {/* --- MODAL XÓA (Giữ nguyên logic) --- */}
      <Modal
        title={<span style={{ color: ACCENT_COLOR, fontWeight: 'bold' }}>XÓA LỢI NHUẬN CỦA NGƯỜI DÙNG</span>}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
        okText={loadingDelete ? <Spin size="small" style={{ color: 'white' }} /> : 'XÁC NHẬN XÓA'}
        cancelText="HỦY"
        okButtonProps={{ 
            style: { backgroundColor: '#ef4444', borderColor: '#ef4444' }, 
            disabled: loadingDelete 
        }}
        cancelButtonProps={{ style: { color: 'white', backgroundColor: CARD_BG } }}
        style={{ color: 'white' }}
        bodyStyle={{ backgroundColor: CARD_BG, color: 'white' }}
        headStyle={{ backgroundColor: BACKGROUND_COLOR, borderBottom: `1px solid ${ACCENT_COLOR}` }}
      >
        <p className="text-white text-lg mt-4">
          Bạn có chắc chắn muốn **xóa vĩnh viễn** mục lợi nhuận/thua lỗ này? Hành động này không thể hoàn tác.
        </p>
      </Modal>

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

export default ProfitLoss