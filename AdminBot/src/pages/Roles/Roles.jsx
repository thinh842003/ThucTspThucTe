import React, { useEffect, useState } from 'react'
import { Button, Form, Input, Modal, Spin, Table, Divider, Card } from 'antd'
import { EditOutlined, DeleteOutlined, UsergroupAddOutlined, ProfileOutlined } from '@ant-design/icons'
import { useMessage } from '../../App'
import roleService from '../../service/roleService'

// MÀU SẮC CHỦ ĐẠO (Đồng nhất với Home.jsx)
const ACCENT_COLOR = '#ec4899'; // pink-500
const BACKGROUND_COLOR = '#0f172a'; // slate-900 (Nền tối)
const CARD_BG = '#1e293b'; // slate-800 (Nền khối chính)

const Roles = () => {
  const { antMessage } = useMessage()
  const [data, setData] = useState([])
  const [form] = Form.useForm()
  const [loadingAdd, setLoadingAdd] = useState(false)
  const [loadingUpdated, setLoadingUpdated] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [id, setID] = useState('')
  const [loadingDelete, setLoadingDelete] = useState(false)

  const [update, setUpdate] = useState(false)

  // Cột cho bảng Roles
  const columns = (onEdit) => [
    {
      title: 'Quyền',
      dataIndex: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name), // Sửa sorter cho chuỗi
    },
    {
      title: 'Action',
      render: (_, record) => (
        <>
          <Button
            className="mr-2 border-0 bg-transparent hover:bg-gray-700/50 text-white"
            icon={<EditOutlined style={{ color: ACCENT_COLOR }} />}
            onClick={() => {
              setID(record.id)
              onEdit(record)
            }}
          />
          <Button
            className="text-red-500 border-0 bg-transparent hover:bg-red-900/50"
            icon={<DeleteOutlined />}
            onClick={() => {
              setIsModalOpen(true)
              setID(record.id)
            }}
          />
        </>
      ),
    },
  ]

  // Logic: Lấy danh sách Roles
  useEffect(() => {
    setLoading(true)
    roleService
      .getRoles()
      .then((res) => setData(res.data))
      .catch((err) => console.log(err))
      .finally(() => setLoading(false))
  }, [update])

  // Logic: Khi nhấn nút Edit
  const onEdit = (record) => {
    form.setFieldsValue(record)
    setIsEditing(true)
  }

  // Logic: Cập nhật Role
  const handleUpdate = async () => {
    try {
      const values = await form.validateFields()
      setLoadingUpdated(true)
      roleService
        .updateRole({ newRole: values.name, id: id })
        .then(() => {
          antMessage.success('Cập nhật thành công!')
          setIsEditing(false)
          setUpdate(!update)
          form.resetFields()
        })
        .catch((err) => antMessage.error(err.response?.data || err.message))
        .finally(() => setLoadingUpdated(false))
    } catch (error) { /* Bỏ qua lỗi validate */ }
  }

  // Logic: Thêm Role mới
  const handleAdd = async () => {
    try {
      const values = await form.validateFields()

      setLoadingAdd(true)
      roleService
        .addRole(values.name)
        .then(() => {
          antMessage.success('Thêm quyền thành công.')
          setUpdate(!update)
          form.resetFields()
        })
        .catch((err) => {
          console.log(err)
          antMessage.error(err.response?.data || err.message)
        })
        .finally(() => setLoadingAdd(false))
    } catch (error) { /* Bỏ qua lỗi validate */ }
  }

  // Logic: Xóa Role
  const handleOk = () => {
    setLoadingDelete(true)
    roleService
      .deleteRole(id)
      .then(() => {
        const newData = data.filter((item) => !(item.id === id))
        setData(newData)
        antMessage.success('Xóa thành công.')
      })
      .catch((err) => {
        console.log(err)
        antMessage.error(err.response?.data || err.message)
      })
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

        {/* --- PHẦN 1: THÊM/CẬP NHẬT ROLES --- */}
        <Divider className="!border-gray-700">
          <span className="text-gray-400 text-lg font-bold flex items-center gap-2">
            <UsergroupAddOutlined style={{ color: ACCENT_COLOR }} /> {isEditing ? 'CẬP NHẬT' : 'THÊM'} QUYỀN TRUY CẬP
          </span>
        </Divider>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
          {/* Cột 1 & 2: Bảng Roles */}
          <Card
            className="md:col-span-2 shadow-2xl rounded-xl"
            style={{ backgroundColor: CARD_BG, border: '1px solid #374151' }}
          >
            <div className="overflow-x-auto custom-table-dark">
              <Table
                title={() => <span className="text-xl font-semibold text-white">DANH SÁCH ROLES</span>}
                loading={loading}
                columns={columns(onEdit)}
                dataSource={data}
                className="overflow-x-auto"
                rowKey={(record) => record.id}
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
              {isEditing ? 'SỬA QUYỀN' : 'THÊM QUYỀN MỚI'}
            </div>
            <Form
              form={form}
              className="px-4 py-4 space-y-3"
              layout="vertical"
            >
              {/* Tên quyền */}
              <Form.Item
                label={<span className="text-gray-300 font-medium">Tên quyền:</span>}
                name="name"
                rules={[{ required: true, message: 'Vui lòng nhập quyền' }]}
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
        title={<span className="text-white">Xóa Quyền</span>}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={loadingDelete ? <Spin /> : 'Xác nhận xóa'}
        cancelText="Hủy"
        okButtonProps={{ disabled: loadingDelete, style: { backgroundColor: '#ef4444', borderColor: '#ef4444' } }} // red-500
        cancelButtonProps={{ style: { color: 'white', backgroundColor: CARD_BG, borderColor: '#374151' } }}
        style={{ top: 200 }}
        bodyStyle={{ backgroundColor: CARD_BG, color: 'white' }}
        className="custom-modal-dark"
      >
        <p className="text-white">Bạn có chắc chắn muốn xóa quyền này? Hành động này không thể hoàn tác.</p>
      </Modal>

      {/* Custom Styles for Antd Dark Mode (Đồng nhất với Home.jsx) */}
      <style>{`
          /* Input styles */
          .custom-input-dark.ant-input {
              background-color: #374151 !important; /* gray-700 */
              border-color: #4b5563 !important; /* gray-600 */
              color: white !important;
          }

          .custom-input-dark.ant-input:focus,
          .custom-input-dark.ant-input:hover {
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

export default Roles