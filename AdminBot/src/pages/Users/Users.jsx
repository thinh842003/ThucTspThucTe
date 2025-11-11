import React, { useEffect, useState } from 'react'
import {
  Table,
  Switch,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Spin,
  Tooltip,
  Flex,
  DatePicker,
  Popconfirm,
  Card,
  Typography,
} from 'antd'
import userService from '../../service/userService'
import { useMessage } from '../../App'
import {
  EditOutlined,
  DeleteOutlined,
  PlusCircleOutlined,
  UserOutlined,
} from '@ant-design/icons'
import roleService from '../../service/roleService'
import { formatDateTime, getISOString } from '../../service/commonService'

import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
dayjs.extend(customParseFormat)

const { Title } = Typography
const dateFormat = 'YYYY/MM/DD'

// MÀU SẮC CHỦ ĐẠO DARK MODE (Đồng bộ với Home.jsx)
const ACCENT_COLOR = '#ec4899'; // pink-500
const BACKGROUND_COLOR = '#0f172a'; // slate-900 (Nền tối)
const CARD_BG = '#1e293b'; // slate-800 (Nền khối chính)
const DYNAMIC_SHADOW = `0 0 15px rgba(236, 72, 153, 0.5)`; // Hiệu ứng bóng mờ màu hồng nhẹ

const columns = (handleLockOut, onEditUser, lockoutLoading, handleDeleteUser) => [
  {
    title: <span style={{ color: ACCENT_COLOR }}>Tên người dùng</span>,
    dataIndex: 'fullname',
    sorter: (a, b) => a.fullname.localeCompare(b.fullname),
    ellipsis: true,
    render: (text) => <span className="text-gray-200">{text}</span>, // Màu chữ sáng
  },
  {
    title: <span style={{ color: ACCENT_COLOR }}>Tên đăng nhập</span>,
    dataIndex: 'userName',
    sorter: (a, b) => a.userName.localeCompare(b.userName),
    ellipsis: true,
    render: (text) => <span className="text-gray-200">{text}</span>,
  },
  {
    title: <span style={{ color: ACCENT_COLOR }}>Email</span>,
    dataIndex: 'email',
    ellipsis: true,
    render: (text) => <span className="text-gray-200">{text}</span>,
  },
  {
    title: <span style={{ color: ACCENT_COLOR }}>Quyền</span>,
    dataIndex: 'roles',
    // Highlight roles slightly more
    render: (roles) => <span className="text-pink-300 font-medium">{roles.join(' - ')}</span>,
    ellipsis: true,
  },
  {
    title: <span style={{ color: ACCENT_COLOR }}>Ngày hết hạn dịch vụ</span>,
    dataIndex: 'serviceEndDate',
    // Use monospace for dates
    render: (value) => <span className="text-yellow-400 font-mono">{value && formatDateTime(value)}</span>,
  },
  {
    title: <span style={{ color: ACCENT_COLOR }}>Khóa tài khoản</span>,
    dataIndex: 'lockoutEnable',
    align: 'center',
    render: (value, record) => (
      <Switch
        loading={lockoutLoading}
        checked={value}
        onChange={(isChecked) => handleLockOut(isChecked, record.userId)}
        // Dùng className để áp dụng màu nền hồng chủ đạo khi bật
        checkedChildren={<span className="font-semibold" style={{ color: BACKGROUND_COLOR }}>Khóa</span>}
        unCheckedChildren={<span className="font-semibold text-gray-400">Mở</span>}
        className="custom-accent-switch" // Class riêng để style
      />
    ),
  },
  {
    title: <span style={{ color: ACCENT_COLOR }}>Thực hiện</span>,
    align: 'center',
    width: 120,
    render: (_, record) => (
      <Flex justify="center" align="center" gap={4}>
        <Tooltip title="Chỉnh sửa">
          <Button
            type="text"
            // Màu xanh nổi bật hơn: indigo-400
            icon={<EditOutlined style={{ color: '#818cf8' }} />}
            onClick={() => onEditUser(record)}
          />
        </Tooltip>
        <Popconfirm
          title={<span className="text-white">Xác nhận xóa **{record.fullname}**</span>}
          onConfirm={() => handleDeleteUser(record.userId)}
          okText="Xóa"
          cancelText="Hủy"
          // Thêm style cho Popconfirm để đồng bộ Dark Mode
          overlayInnerStyle={{ backgroundColor: CARD_BG, border: '1px solid #374151' }}
        >
          <Tooltip title="Xóa người dùng">
            <Button
              type="text"
              // Màu đỏ nổi bật hơn: red-400
              icon={<DeleteOutlined style={{ color: '#f87171' }} />}
            />
          </Tooltip>
        </Popconfirm>
      </Flex>
    ),
  },
]

const Users = () => {
  const [form] = Form.useForm()
  const [formAddUser] = Form.useForm()
  const { antMessage } = useMessage()
  const [isLoading, setIsLoading] = useState(false)
  const [lockoutLoading, setLockoutLoading] = useState(false)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [isUpdateUserInfo, setIsUpdateUserInfo] = useState(false)
  const [isUpdateRoles, setIsUpdateRoles] = useState(false)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isModalAddUserOpen, setIsModalAddUserOpen] = useState(false)

  const [isChangeServiceEndDate, setIsChangeServiceEndDate] = useState(false)

  const [data, setData] = useState([])
  const [roles, setRoles] = useState([])

  const [currentRoles, setCurrentRoles] = useState([])
  const [previousRoles, setPreviousRoles] = useState([])

  const [userId, setUserId] = useState('')
  const [update, setUpdate] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    userService
      .getAllUser()
      .then((res) => setData(res.data))
      .catch((err) => console.log(err))
      .finally(() => setIsLoading(false))

    roleService.getRoles().then((res) => {
      setRoles(
        res.data.map((item) => {
          return {
            value: item.name,
            label: item.name,
          }
        }),
      )
    })
  }, [update])

  const handleLockOut = (isChecked, userId) => {
    setLockoutLoading(true)
    const data = { userId: userId }
    // Giữ nguyên logic setUpdate để reload data sau khi gọi API
    if (isChecked) {
      userService
        .lockout(data)
        .then(() => {
          antMessage.success('Đã khóa tài khoản')
          setUpdate(!update)
        })
        .catch((err) => antMessage.error(err.response?.data || err.message))
        .finally(() => setLockoutLoading(false))
    } else {
      userService
        .unlock(data)
        .then(() => {
          antMessage.success('Đã mở khóa tài khoản')
          setUpdate(!update)
        })
        .catch((err) => antMessage.error(err.response?.data || err.message))
        .finally(() => setLockoutLoading(false))
    }
  }

  const handleChangeUserInfo = async () => {
    try {
      const values = await form.validateFields()

      const lostRoles = previousRoles.filter((role) => !currentRoles.includes(role))
      const addedRoles = currentRoles.filter((role) => !previousRoles.includes(role))

      setUpdateLoading(true)

      // 1. Cập nhật thông tin cơ bản (nếu có thay đổi)
      if (isUpdateUserInfo || values.password) {
        await userService.updateUser(userId, values)
      }

      // 2. Cập nhật ngày hết hạn dịch vụ (nếu có thay đổi)
      if (isChangeServiceEndDate) {
        await userService.updateServiceEndDate({
          userId: userId,
          serviceEndDate: values.serviceEndDate ? getISOString(values.serviceEndDate) : null,
        })
      }

      // 3. Cập nhật Roles
      if (addedRoles.length > 0) {
        await userService.addUserRoles({ userId: userId, roles: addedRoles })
      }
      if (lostRoles.length > 0) {
        await userService.deleteUserRoles(userId, { roles: lostRoles })
      }

      antMessage.success('Cập nhật thành công')
      setIsModalOpen(false)
      setUpdate(!update)
    } catch (err) {
      if (err.errorFields) {
        // Lỗi validate Ant Design form
      } else {
        console.error(err)
        antMessage.error(err.response?.data?.title || err.response?.data || err.message || 'Lỗi không xác định khi cập nhật!')
      }
    } finally {
      setUpdateLoading(false)
      // Reset trạng thái sau khi đóng modal
      setIsUpdateUserInfo(false)
      setIsUpdateRoles(false)
      setIsChangeServiceEndDate(false)
    }
  }

  const handleDeleteUser = async (userId) => {
    setUpdateLoading(true)
    await userService
      .deleteUser(userId)
      .then(() => {
        setUpdate(!update)
        antMessage.success('Đã xóa người dùng thành công')
      })
      .catch((err) =>
        antMessage.error(err.response?.data?.title || err.response?.data || err.message),
      )
      .finally(() => setUpdateLoading(false))
  }

  const handleCancle = () => {
    setIsModalOpen(false)
    form.resetFields()
    // Reset các trạng thái
    setIsUpdateUserInfo(false)
    setIsUpdateRoles(false)
    setIsChangeServiceEndDate(false)
  }

  const handleAddUserCancle = () => {
    setIsModalAddUserOpen(false)
    formAddUser.resetFields()
  }

  const onEditUser = (record) => {
    setIsModalOpen(true)
    // Đặt lại các trạng thái thay đổi
    setIsUpdateRoles(false)
    setIsUpdateUserInfo(false)
    setIsChangeServiceEndDate(false)

    let newValue = record
    if (record.serviceEndDate) {
      newValue = {
        ...record,
        serviceEndDate: dayjs(record.serviceEndDate),
      }
    } else {
      newValue = {
        ...record,
        serviceEndDate: null,
      }
    }

    form.setFieldsValue(newValue)
    setUserId(record.userId)
    setPreviousRoles(record.roles)
    setCurrentRoles(record.roles)
  }

  const onAddUser = () => {
    setIsModalAddUserOpen(true)
    formAddUser.resetFields()
  }

  const handleAddUser = async () => {
    try {
      const values = await formAddUser.validateFields()
      setUpdateLoading(true)
      await userService.addUser(values)

      antMessage.success('Thêm người dùng thành công')
      setIsModalAddUserOpen(false)
      setUpdate(!update)
    } catch (err) {
      if (err.errorFields) {
        // Lỗi validate form
      } else {
        console.error(err)
        antMessage.error(err.response?.data?.title || err.response?.data || err.message || 'Lỗi không xác định khi thêm người dùng!')
      }
    } finally {
      setUpdateLoading(false)
    }
  }

  return (
    // Áp dụng nền tối cho toàn bộ trang
    <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: BACKGROUND_COLOR }}>
      <div className="space-y-6">
        {/* Tiêu đề và nút Thêm người dùng */}
        <Flex align="center" justify="space-between" className="pb-4 border-b border-pink-700/50">
          <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', color: ACCENT_COLOR, fontWeight: 700 }}>
            <UserOutlined style={{ marginRight: 12, fontSize: '1.4em' }} />
            QUẢN LÝ NGƯỜI DÙNG
          </Title>
          <Tooltip title="Thêm người dùng mới">
            <Button
              type="primary"
              size="large"
              onClick={onAddUser}
              icon={<PlusCircleOutlined />}
              // Dùng style để áp dụng màu hồng chủ đạo cho nút và thêm hiệu ứng shadow nhẹ
              style={{ backgroundColor: ACCENT_COLOR, borderColor: ACCENT_COLOR, boxShadow: DYNAMIC_SHADOW }}
              className="hover:!opacity-90 transition-all duration-300"
            >
              Thêm Người Dùng
            </Button>
          </Tooltip>
        </Flex>

        {/* Bảng người dùng bọc trong Card */}
        <Card
          bordered={false}
          className="shadow-2xl rounded-xl"
          // Creative: Dynamic border and shadow
          style={{ backgroundColor: CARD_BG, border: `1px solid ${ACCENT_COLOR}50`, boxShadow: DYNAMIC_SHADOW }}
        >
          <div className="overflow-x-auto custom-table-dark">
            <Table
              loading={isLoading}
              columns={columns(handleLockOut, onEditUser, lockoutLoading, handleDeleteUser)}
              dataSource={data}
              rowKey={(record) => record.userId}
              pagination={{
                showSizeChanger: true,
                defaultPageSize: 10,
                pageSizeOptions: ['10', '20', '50', '100'],
              }}
            />
          </div>
        </Card>
      </div>

      {/* Modal Chỉnh sửa thông tin - Nền Form MÀU TRẮNG */}
      <Modal
        title={<div style={{ textAlign: 'center', fontSize: '1.2em', fontWeight: 'bold', color: ACCENT_COLOR }}>Cập Nhật Thông Tin Người Dùng</div>}
        open={isModalOpen}
        onOk={handleChangeUserInfo}
        onCancel={handleCancle}
        maskClosable={false}
        okButtonProps={{
          disabled: updateLoading || !(isUpdateUserInfo || isUpdateRoles || isChangeServiceEndDate),
          type: 'primary',
          style: { backgroundColor: ACCENT_COLOR, borderColor: ACCENT_COLOR }, // Tô màu nút OK
        }}
        okText={updateLoading ? <Spin /> : 'Xác nhận Cập nhật'}
        cancelButtonProps={{ disabled: updateLoading }}
        destroyOnClose={true}
        // Nền của Modal Content (bao gồm header, footer, body) vẫn là BACKGROUND_COLOR. 
        // Form sẽ được đặt trên nền trắng trong body.
        // Bỏ bodyStyle để Form có thể dùng nền trắng.
        className="dark-mode-modal white-form-modal" // Thêm class riêng cho Modal có form nền trắng
      >
        <Form
          form={form}
          layout="vertical"
          disabled={updateLoading}
          onValuesChange={() => setIsUpdateUserInfo(true)}
          // Đặt nền trắng cho Form và thêm padding/margin để tách biệt với body Modal
          style={{ paddingTop: 20, padding: '20px', borderRadius: '8px', backgroundColor: 'white' }} 
        >
          <Form.Item
            label="Tên người dùng"
            name="fullname"
            rules={[{ required: true, message: 'Vui lòng nhập tên người dùng' }]}
          >
            {/* Đã bỏ class dark mode cho Input */}
            <Input size="large" placeholder="Tên người dùng" />
          </Form.Item>
          <Form.Item
            label="Tên đăng nhập"
            name="userName"
            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
          >
            <Input size="large" placeholder="Tên đăng nhập" />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập địa chỉ email' },
              { type: 'email', message: 'Địa chỉ email không hợp lệ' },
            ]}
          >
            <Input size="large" placeholder="Địa chỉ email" />
          </Form.Item>

          <Form.Item label="Ngày hết hạn dịch vụ (Không bắt buộc)" name="serviceEndDate">
            <DatePicker
              className="w-full" // Bỏ class dark mode cho DatePicker
              size="large"
              format="DD/MM/YYYY"
              onChange={() => setIsChangeServiceEndDate(true)}
              placeholder="Chọn ngày hết hạn dịch vụ"
              allowClear={true}
              inputReadOnly={false}
            />
          </Form.Item>

          <Form.Item label="Mật khẩu mới (Để trống nếu không thay đổi)" name="password">
            {/* Đã bỏ class dark mode cho Input.Password */}
            <Input.Password size="large" placeholder="Mật khẩu mới" />
          </Form.Item>
          
          {/* Box Chọn Quyền trên nền trắng */}
          <div style={{ marginBottom: 8, fontWeight: '500', color: '#000' }}>Quyền</div>
          <Select
            size="large"
            mode="multiple"
            className="w-full"
            value={currentRoles}
            onChange={(values) => {
              setIsUpdateRoles(true)
              setCurrentRoles(values)
            }}
            options={roles}
            placeholder="Chọn (các) quyền cho người dùng"
            // Đảm bảo Select box dùng style light mode trên nền trắng của Form
            popupClassName="light-select-dropdown" // Class riêng cho dropdown light mode
          />
        </Form>
      </Modal>

      {/* Modal Thêm người dùng mới - Nền Form MÀU TRẮNG */}
      <Modal
        title={<div style={{ textAlign: 'center', fontSize: '1.2em', fontWeight: 'bold', color: ACCENT_COLOR }}>Thêm Người Dùng Mới</div>}
        open={isModalAddUserOpen}
        onOk={handleAddUser}
        onCancel={handleAddUserCancle}
        maskClosable={false}
        okButtonProps={{ disabled: updateLoading, type: 'primary', style: { backgroundColor: ACCENT_COLOR, borderColor: ACCENT_COLOR } }}
        okText={updateLoading ? <Spin /> : 'Thêm Người Dùng'}
        cancelButtonProps={{ disabled: updateLoading }}
        destroyOnClose={true}
        // Bỏ bodyStyle để Form có thể dùng nền trắng.
        className="dark-mode-modal white-form-modal"
      >
        <Form
          form={formAddUser}
          layout="vertical"
          disabled={updateLoading}
          // Đặt nền trắng cho Form và thêm padding/margin để tách biệt với body Modal
          style={{ paddingTop: 20, padding: '20px', borderRadius: '8px', backgroundColor: 'white' }}
        >
          <Form.Item
            label="Tên người dùng"
            name="fullname"
            rules={[{ required: true, message: 'Vui lòng nhập tên người dùng' }]}
          >
            {/* Đã bỏ class dark mode cho Input */}
            <Input size="large" placeholder="Tên người dùng" />
          </Form.Item>
          <Form.Item
            label="Tên đăng nhập"
            name="userName"
            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
          >
            <Input size="large" placeholder="Tên đăng nhập" />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập địa chỉ email' },
              { type: 'email', message: 'Địa chỉ email không hợp lệ' },
            ]}
          >
            <Input size="large" placeholder="Địa chỉ email" />
          </Form.Item>
          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
          >
            <Input.Password size="large" placeholder="Mật khẩu" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Custom Styles for Antd Dark Mode */}
      <style>{`
          /* Modal content background fix (vẫn giữ nền tối cho header, footer nếu không bị override) */
          .ant-modal-content {
            background-color: ${BACKGROUND_COLOR} !important;
            color: white;
          }
          .ant-modal-header {
            background-color: ${BACKGROUND_COLOR} !important;
            border-bottom: 1px solid #374151; /* gray-700 */
          }
          .ant-modal-footer {
            background-color: ${BACKGROUND_COLOR} !important;
            border-top: 1px solid #374151; /* gray-700 */
          }
          .ant-modal-close-x {
            color: white !important;
          }
            
          /* FIX: Form Labels in Modal (Quan trọng để label hiển thị màu đen trên nền form trắng) */
          .white-form-modal .ant-form-item-label > label {
              color: #000 !important; /* Đổi màu label sang đen */
          }
          /* FIX: Antd error/warning messages for white form */
          .white-form-modal .ant-form-item-explain-error,
          .white-form-modal .ant-form-item-explain-warning {
              color: #ff4d4f !important; /* Giữ màu đỏ/vàng mặc định */
          }

          /* Table Styles (Giữ nguyên Dark Mode) */
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
              border-bottom: 1px solid #374151; 
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

            /* Custom Switch for Accent Color Background when Checked */
            .ant-switch.custom-accent-switch.ant-switch-checked {
                background-color: ${ACCENT_COLOR} !important;
            }
            .ant-switch.custom-accent-switch.ant-switch-checked .ant-switch-handle {
                background: white !important; /* White handle */
            }

            /* Dark Select Dropdown Styles (Dùng cho Select Quyền trong Modal Update nếu muốn giữ nền tối) */
            /* Do đã đổi Form sang nền trắng, ta cần một dropdown style light mode */
            .dark-select-dropdown .ant-select-dropdown {
                background-color: ${CARD_BG} !important;
                border: 1px solid #374151;
            }
            /* Thêm Light Select Dropdown Styles cho form nền trắng */
            .light-select-dropdown .ant-select-dropdown {
                background-color: white !important;
                border: 1px solid #d9d9d9;
            }
            .light-select-dropdown .ant-select-item-option-content {
                color: #000;
            }
            .light-select-dropdown .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
                background-color: #e6f7ff !important; /* Màu xanh nhạt cho selected */
            }
            .light-select-dropdown .ant-select-item-option-active:not(.ant-select-item-option-selected) {
                background-color: #f5f5f5 !important; /* Màu xám nhạt cho hover */
            }
            /* Nếu Select cần giữ style light-mode, thì phải bỏ style={ {backgroundColor: CARD_BG} } ở Select component và dùng popupClassName="light-select-dropdown" (Đã làm ở trên) */

      `}</style>
    </div>
  )
}

export default Users