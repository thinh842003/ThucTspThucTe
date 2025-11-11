import React, { useEffect, useState } from 'react'
import { Button, Form, Input, InputNumber, Modal, Select, Spin, Table, Divider, Card } from 'antd'
import salaryService from '../../service/salaryService'
import userService from '../../service/userService'
import { useMessage } from '../../App'
import { EditOutlined, DeleteOutlined, UserOutlined, PlusOutlined } from '@ant-design/icons'
import { formatVND } from '../../service/commonService'

const { Option } = Select

// MÀU SẮC CHỦ ĐẠO (Đồng nhất với Home.jsx)
const ACCENT_COLOR = '#ec4899'; // pink-500
const BACKGROUND_COLOR = '#0f172a'; // slate-900 (Nền tối)
const CARD_BG = '#1e293b'; // slate-800 (Nền khối chính)

const Salary = () => {
  const { antMessage } = useMessage()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState()
  const [form] = Form.useForm()
  const [loadingAdd, setLoadingAdd] = useState(false) // Khởi tạo false
  const [userOptions, setUserOptions] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [loadingUpdated, setLoadingUpdated] = useState(false)
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')
  const [userId, setUserId] = useState('')
  const [loadingDelete, setLoadingDelete] = useState(false)

  const [update, setUpdate] = useState(false)

  // Cột cho bảng lương
  const columns = (onEdit) => [
    {
      title: 'Tên nhân viên',
      dataIndex: 'fullName',
      sorter: (a, b) => a.fullName.localeCompare(b.fullName), // Sửa sorter cho chuỗi
    },
    {
      title: 'Tháng',
      dataIndex: 'month',
      sorter: (a, b) => a.month - b.month,
    },
    {
      title: 'Năm',
      dataIndex: 'year',
      sorter: (a, b) => a.year - b.year,
    },
    {
      title: 'Tiền lương',
      dataIndex: 'price',
      sorter: (a, b) => a.price - b.price,
      render: (value) => formatVND(value),
    },
    {
      title: 'Tiền thưởng',
      dataIndex: 'bonus',
      sorter: (a, b) => a.bonus - b.bonus,
      render: (value) => formatVND(value),
    },
    {
      title: 'Tổng lương',
      render: (_, record) => formatVND(record.price + record.bonus),
      sorter: (a, b) => (a.price + a.bonus) - (b.price + b.bonus), // Sửa sorter cho tổng
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
    },
    {
      title: 'Thực hiện',
      render: (_, record) => (
        <>
          <Button
            className="mr-2 border-0 bg-transparent hover:bg-gray-700/50 text-white"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          />
          <Button
            className="text-red-500 border-0 bg-transparent hover:bg-red-900/50"
            icon={<DeleteOutlined />}
            onClick={() => {
              setIsModalOpen(true)
              setMonth(record.month)
              setYear(record.year)
              setUserId(record.userId)
            }}
          />
        </>
      ),
    },
  ]

  // Logic: Lấy dữ liệu và danh sách nhân viên
  useEffect(() => {
    setLoading(true)
    salaryService
      .getAllSalary()
      .then((res) => setData(res.data))
      .catch((err) => console.log(err))
      .finally(() => setLoading(false))

    userService
      .getUserRole('Employee')
      .then((res) => setUserOptions(res.data))
      .catch((err) => console.log(err))
  }, [update])

  // Logic: Khi nhấn nút Edit
  const onEdit = (record) => {
    form.setFieldsValue(record)
    setIsEditing(true)
  }

  // Logic: Thêm lương
  const handleAdd = async () => {
    try {
      const values = await form.validateFields()

      setLoadingAdd(true)
      salaryService
        .addSalary(values)
        .then(() => {
          antMessage.success('Thêm lương thành công.')
          setUpdate(!update)
          form.resetFields()
        })
        .catch((err) => antMessage.error(err.response?.data || err.message))
        .finally(() => setLoadingAdd(false))
    } catch (error) { /* Bỏ qua lỗi validate */ }
  }

  // Logic: Cập nhật lương
  const handleUpdate = async () => {
    try {
      const values = await form.validateFields()

      setLoadingUpdated(true)
      salaryService
        .updateSalary(values.month, values.year, values.userId, values)
        .then(() => {
          antMessage.success('Cập nhật thành công!')
          setIsEditing(false)
          setUpdate(!update)
          form.resetFields()
        })
        .catch((err) => {
          antMessage.error(err.response?.data || err.message)
        })
        .finally(() => setLoadingUpdated(false))
    } catch (error) { /* Bỏ qua lỗi validate */ }
  }

  // Logic: Xóa lương
  const handleDelete = () => {
    setLoadingDelete(true)
    salaryService
      .deleteSalary(month, year, userId)
      .then(() => {
        const newData = data.filter(
          (item) => !(item.month === month && item.year === year && item.userId === userId),
        )
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

  // Logic: Xóa form và thoát chế độ chỉnh sửa
  const handleClear = () => {
    setIsEditing(false)
    form.resetFields()
  }

  return (
    // Áp dụng nền tối cho toàn bộ trang
    <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: BACKGROUND_COLOR }}>
      <div className="space-y-8">
        
        {/* --- PHẦN 1: THÊM/CẬP NHẬT LƯƠNG --- */}
        <Divider className="!border-gray-700">
          <span className="text-gray-400 text-lg font-bold flex items-center gap-2">
            <PlusOutlined style={{ color: ACCENT_COLOR }} /> {isEditing ? 'CẬP NHẬT' : 'THÊM'} BẢNG LƯƠNG
          </span>
        </Divider>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
          {/* Cột 1 & 2: Bảng Lương */}
          <Card 
            className="md:col-span-2 shadow-2xl rounded-xl" 
            style={{ backgroundColor: CARD_BG, border: '1px solid #374151' }}
          >
            <div className="overflow-x-auto custom-table-dark">
              <Table
                title={() => <span className="text-xl font-semibold text-white">DANH SÁCH BẢNG LƯƠNG</span>}
                loading={loading}
                columns={columns(onEdit)}
                dataSource={data}
                className="overflow-x-auto"
                rowKey={(record) => record.userId + record.month + record.year}
                pagination={{ pageSize: 10 }}
              />
            </div>
          </Card>

          {/* Cột 3: Form Thêm/Cập nhật */}
          <Card 
            className="h-fit shadow-2xl rounded-xl" 
            style={{ backgroundColor: CARD_BG, border: '1px solid #374151' }}
          >
            <div className="text-2xl font-bold text-center p-2 text-white" style={{ color: ACCENT_COLOR }}>
              {isEditing ? 'SỬA LƯƠNG' : 'NHẬP LƯƠNG'}
            </div>
            <Form 
              form={form} 
              className="px-4 py-4 space-y-3"
              layout="vertical"
            >
              {/* Tên nhân viên */}
              <Form.Item
                label={<span className="text-gray-300 font-medium">Tên nhân viên:</span>}
                name="userId"
                rules={[{ required: true, message: 'Vui lòng chọn tên nhân viên' }]}
              >
                <Select disabled={isEditing} className="custom-select-dark">
                  {userOptions.map((user) => (
                    <Option key={user.userId} value={user.userId}>
                      {user.fullname}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              
              {/* Tháng */}
              <Form.Item
                label={<span className="text-gray-300 font-medium">Tháng:</span>}
                name="month"
                rules={[{ required: true, message: 'Vui lòng chọn tháng' }]}
              >
                <Select disabled={isEditing} className="custom-select-dark">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <Option key={month} value={month}>
                      Tháng {month}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              
              {/* Năm */}
              <Form.Item
                label={<span className="text-gray-300 font-medium">Năm:</span>}
                name="year"
                rules={[{ required: true, message: 'Năm là bắt buộc' }]}
              >
                <InputNumber 
                  className="w-full custom-input-dark" 
                  disabled={isEditing} 
                  min={2000} // Giới hạn năm hợp lý
                />
              </Form.Item>
              
              {/* Lương */}
              <Form.Item
                label={<span className="text-gray-300 font-medium">Lương cơ bản:</span>}
                name="price"
                rules={[{ required: true, message: 'Vui lòng nhập lương' }]}
              >
                <InputNumber
                  className="w-full custom-input-dark"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
              
              {/* Thưởng */}
              <Form.Item
                label={<span className="text-gray-300 font-medium">Tiền thưởng:</span>}
                name="bonus"
                rules={[{ required: true, message: 'Vui lòng nhập tiền thưởng' }]}
              >
                <InputNumber
                  className="w-full custom-input-dark"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
              
              {/* Mô tả */}
              <Form.Item
                label={<span className="text-gray-300 font-medium">Mô tả:</span>}
                name="description"
                rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
              >
                <Input className="custom-input-dark" />
              </Form.Item>
              
              {/* Nút thao tác */}
              <div className="grid grid-cols-3 gap-2 pt-4">
                <Button 
                  type="primary" 
                  size="large" 
                  onClick={handleUpdate} 
                  disabled={!isEditing}
                  className="col-span-3 md:col-span-1"
                  style={{ backgroundColor: isEditing ? ACCENT_COLOR : '#4b5563', borderColor: isEditing ? ACCENT_COLOR : '#4b5563' }}
                >
                  {loadingUpdated ? <Spin size="small" /> : 'Cập nhật'}
                </Button>
                <Button 
                  type="primary" 
                  size="large" 
                  onClick={handleAdd} 
                  disabled={isEditing}
                  className="col-span-3 md:col-span-1"
                  style={{ backgroundColor: !isEditing ? ACCENT_COLOR : '#4b5563', borderColor: !isEditing ? ACCENT_COLOR : '#4b5563' }}
                >
                  {loadingAdd ? <Spin size="small" /> : 'Thêm'}
                </Button>
                <Button
                  className="col-span-3 md:col-span-1"
                  onClick={handleClear}
                  size="large"
                  style={{ backgroundColor: CARD_BG, borderColor: '#4b5563', color: 'white' }}
                >
                  {isEditing ? 'Hủy sửa' : 'Xóa form'}
                </Button>
              </div>
            </Form>
          </Card>
        </div>
      </div>

      {/* Modal xác nhận xóa */}
      <Modal
        title={<span className="text-white">Xóa Bảng lương</span>}
        open={isModalOpen}
        onOk={handleDelete}
        onCancel={handleCancel}
        okText={loadingDelete ? <Spin /> : 'Xác nhận xóa'}
        cancelText="Hủy"
        okButtonProps={{ disabled: loadingDelete, style: { backgroundColor: '#ef4444', borderColor: '#ef4444' } }} // red-500
        cancelButtonProps={{ style: { color: 'white', backgroundColor: CARD_BG, borderColor: '#374151' } }}
        style={{ top: 200 }} 
        bodyStyle={{ backgroundColor: CARD_BG, color: 'white' }}
        className="custom-modal-dark"
      >
        <p className="text-white">Bạn có chắc chắn muốn xóa bảng lương này của nhân viên?</p>
      </Modal>

      {/* Custom Styles for Antd Dark Mode (Đồng nhất với Home.jsx) */}
      <style>{`
          /* Input/InputNumber/Select styles */
          .custom-input-dark.ant-input,
          .custom-input-dark.ant-input-number,
          .custom-input-dark .ant-input-number-input,
          .custom-select-dark.ant-select .ant-select-selector {
              background-color: #374151 !important; /* gray-700 */
              border-color: #4b5563 !important; /* gray-600 */
              color: white !important;
          }

          .custom-input-dark.ant-input:focus,
          .custom-input-dark.ant-input:hover,
          .custom-input-dark.ant-input-number:focus,
          .custom-select-dark.ant-select-focused .ant-select-selector,
          .custom-select-dark.ant-select:not(.ant-select-disabled):hover .ant-select-selector {
              border-color: ${ACCENT_COLOR} !important;
              box-shadow: 0 0 0 2px ${ACCENT_COLOR}40 !important;
          }

          /* Table Styles - Dùng lại từ Home.jsx */
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

export default Salary