import React, { useEffect, useState } from 'react'
import { Button, DatePicker, Form, Input, InputNumber, Modal, Spin, Table, Divider, Card } from 'antd'
import expenseService from '../../service/expenseService'
import { formatDate, formatVND, getISOString } from '../../service/commonService'
import { useMessage } from '../../App'
import { DeleteOutlined, PlusOutlined, LineChartOutlined } from '@ant-design/icons'
import locale from 'antd/es/date-picker/locale/vi_VN' // Thêm locale

// MÀU SẮC CHỦ ĐẠO (Đồng nhất với Home.jsx)
const ACCENT_COLOR = '#ec4899'; // pink-500
const BACKGROUND_COLOR = '#0f172a'; // slate-900 (Nền tối)
const CARD_BG = '#1e293b'; // slate-800 (Nền khối chính)

const Expense = () => {
  const [data, setData] = useState([])
  const [form] = Form.useForm()
  const [loadingAdd, setLoadingAdd] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState(false)
  const { antMessage } = useMessage()
  const [loading, setLoading] = useState(false)
  const [id, setID] = useState('')
  const [loadingDelete, setLoadingDelete] = useState(false)

  // Cột cho bảng chi tiêu
  const columns = [
    {
      title: 'Loại chi',
      dataIndex: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name), // Sửa sorter cho chuỗi
    },
    {
      title: 'Số tiền',
      dataIndex: 'price',
      render: (value) => formatVND(value),
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: 'Ngày',
      dataIndex: 'date',
      render: (value) => formatDate(value),
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
    },
    {
      title: 'Action',
      render: (_, record) => (
        <Button
          className="text-red-500 border-0 bg-transparent hover:bg-red-900/50" // Thêm style hover
          icon={<DeleteOutlined />}
          onClick={() => {
            setIsModalOpen(true)
            setID(record.id)
          }}
        />
      ),
    },
  ]

  // Logic: Lấy dữ liệu chi tiêu
  useEffect(() => {
    setLoading(true)
    form.setFieldValue('description', '-')
    expenseService
      .getExpense()
      .then((res) => {
        setData(res.data)
      })
      .catch((err) => console.log(err))
      .finally(() => setLoading(false))
  }, [editingRecord, form])

  // Logic: Thêm chi tiêu
  const handleAdd = () => {
    const nData = {
      ...form.getFieldsValue(),
      date: getISOString(form.getFieldValue('date').format()), //dayjs
    }

    setLoadingAdd(true)
    expenseService
      .addExpense(nData)
      .then(() => {
        antMessage.success('Thêm thành công.')
        setEditingRecord(!editingRecord)
        form.resetFields()
        form.setFieldValue('description', '-') // Reset lại mô tả
      })
      .catch((err) =>
        antMessage.error(err.response?.data.title || err.response?.data || err.message),
      )
      .finally(() => setLoadingAdd(false))
  }

  // Logic: Xóa chi tiêu
  const handleOk = () => {
    setLoadingDelete(true)
    expenseService
      .deleteExpense(id)
      .then(() => {
        const newData = data.filter((item) => !(item.id === id))
        setData(newData)
        antMessage.success('Xóa thành công.')
      })
      .catch((err) => antMessage.error(err.response?.data || err.message))
      .finally(() => {
        setLoadingDelete(false)
        setIsModalOpen(false)
      })
  }

  const handleCancel = () => {
    setIsModalOpen(false)
  }

  return (
    // Áp dụng nền tối cho toàn bộ trang
    <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: BACKGROUND_COLOR }}>
      <div className="space-y-8">
        
        {/* --- PHẦN 1: THÊM CHI TIÊU --- */}
        <Divider className="!border-gray-700">
          <span className="text-gray-400 text-lg font-bold flex items-center gap-2">
            <PlusOutlined style={{ color: ACCENT_COLOR }} /> NHẬP CHI TIÊU MỚI
          </span>
        </Divider>

        <Card 
          className="shadow-2xl rounded-xl" 
          style={{ backgroundColor: CARD_BG, border: '1px solid #374151' }}
        >
          <div className="text-2xl font-bold text-center p-2 text-white" style={{ color: ACCENT_COLOR }}>
            NHẬP DỮ LIỆU CHI PHÍ KHÁC
          </div>
          <Form 
            form={form} 
            onFinish={handleAdd} 
            className="px-4 py-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" // Sử dụng grid 4 cột cho form
            layout="vertical" // Dạng vertical cho form
          >
            {/* Tên loại chi */}
            <Form.Item
              label={<span className="text-gray-300 font-medium">Loại chi:</span>}
              name="name"
              rules={[{ required: true, message: 'Vui lòng nhập loại chi!' }]}
              className="lg:col-span-1"
            >
              <Input className="custom-input-dark" />
            </Form.Item>
            
            {/* Giá */}
            <Form.Item
              label={<span className="text-gray-300 font-medium">Số tiền:</span>}
              name="price"
              rules={[{ required: true, message: 'Vui lòng nhập số tiền!' }]}
              className="lg:col-span-1"
            >
              <InputNumber
                className="w-full custom-input-dark"
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
              />
            </Form.Item>
            
            {/* Ngày */}
            <Form.Item
              label={<span className="text-gray-300 font-medium">Ngày:</span>}
              name="date"
              rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}
              className="lg:col-span-1"
            >
              <DatePicker className="w-full custom-date-picker-dark" locale={locale} />
            </Form.Item>
            
            {/* Mô tả */}
            <Form.Item
              label={<span className="text-gray-300 font-medium">Mô tả:</span>}
              name="description"
              rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
              className="lg:col-span-1"
            >
              <Input className="custom-input-dark" />
            </Form.Item>

            {/* Nút Thêm */}
            <div className="lg:col-span-4 flex justify-center mt-4">
              <Button 
                htmlType="submit" 
                type="primary" 
                size="large"
                className="w-full md:w-1/3 lg:w-1/4"
                style={{ backgroundColor: ACCENT_COLOR, borderColor: ACCENT_COLOR }}
              >
                {loadingAdd ? <Spin size="small" /> : 'THÊM CHI TIÊU'}
              </Button>
            </div>
          </Form>
        </Card>

        {/* --- PHẦN 2: DANH SÁCH CHI TIÊU --- */}
        <Divider className="!border-gray-700">
          <span className="text-gray-400 text-lg font-bold flex items-center gap-2">
            <LineChartOutlined /> DANH SÁCH CHI TIÊU ĐÃ GHI
          </span>
        </Divider>

        <Card 
          className="shadow-2xl rounded-xl" 
          style={{ backgroundColor: CARD_BG, border: '1px solid #374151' }}
        >
          <div className="overflow-x-auto custom-table-dark">
            <Table
              title={() => <span className="text-xl font-semibold text-white">LỊCH SỬ CHI PHÍ KHÁC</span>}
              loading={loading}
              columns={columns}
              dataSource={data}
              rowKey={(record) => record.id}
              pagination={{ pageSize: 10 }}
            />
          </div>
        </Card>
      </div>

      {/* Modal xác nhận xóa */}
      <Modal
        title={<span className="text-white">Xóa chi tiêu</span>}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={loadingDelete ? <Spin /> : 'Xác nhận xóa'}
        cancelText="Hủy"
        okButtonProps={{ disabled: loadingDelete, style: { backgroundColor: '#ef4444', borderColor: '#ef4444' } }} // red-500
        cancelButtonProps={{ style: { color: 'white', backgroundColor: CARD_BG, borderColor: '#374151' } }}
        style={{ top: 200 }} // Đưa modal lên giữa màn hình
        bodyStyle={{ backgroundColor: CARD_BG, color: 'white' }}
        className="custom-modal-dark"
      >
        <p className="text-white">Bạn có chắc chắn muốn xóa chi tiêu này? Hành động này không thể hoàn tác.</p>
      </Modal>

      {/* Custom Styles for Antd Dark Mode (Đồng nhất với Home.jsx) */}
      <style>{`
          /* Input/InputNumber/DatePicker styles */
          .custom-input-dark.ant-input,
          .custom-input-dark.ant-input-number,
          .custom-input-dark .ant-input-number-input,
          .custom-date-picker-dark.ant-picker {
              background-color: #374151 !important; /* gray-700 */
              border-color: #4b5563 !important; /* gray-600 */
              color: white !important;
          }

          .custom-input-dark.ant-input:focus,
          .custom-input-dark.ant-input:hover,
          .custom-input-dark.ant-input-number:focus,
          .custom-date-picker-dark.ant-picker-focused,
          .custom-date-picker-dark.ant-picker:hover {
              border-color: ${ACCENT_COLOR} !important;
              box-shadow: 0 0 0 2px ${ACCENT_COLOR}40 !important;
          }

          .custom-input-dark .ant-input-number-handler-wrap {
              background: #374151 !important;
              border-left: 1px solid #4b5563 !important;
          }

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
          
          /* Modal style */
          .custom-modal-dark .ant-modal-content {
              background-color: ${CARD_BG} !important;
              border: 1px solid #374151;
          }
          .custom-modal-dark .ant-modal-header {
              background-color: ${CARD_BG} !important;
              border-bottom: 1px solid #374151;
          }
          .custom-modal-dark .ant-modal-title {
              color: white !important;
          }
      `}</style>
    </div>
  )
}

export default Expense