import React, { useEffect, useState } from 'react'
import { Button, Form, Input, Modal, Spin, Table, Card, Divider, Tooltip } from 'antd'
import { EditOutlined, DeleteOutlined, RobotOutlined, SaveOutlined, PlusCircleOutlined, SyncOutlined } from '@ant-design/icons'
import botService from '../../service/botService'
import { useMessage } from '../../App'

// MÀU SẮC CHỦ ĐẠO TƯƠNG TỰ HOME.JSX
const ACCENT_COLOR = '#ec4899'; // pink-500
const BACKGROUND_COLOR = '#0f172a'; // slate-900 (Nền tối)
const CARD_BG = '#1e293b'; // slate-800 (Nền khối chính)

const columns = (onEdit, setBotId, setIsModalOpen) => [
  {
    title: 'Mã bot',
    dataIndex: 'id',
    className: 'text-gray-300',
  },
  {
    title: 'Tên Bot',
    dataIndex: 'name',
    sorter: (a, b) => a.name.localeCompare(b.name),
    className: 'text-white font-semibold',
  },
  {
    title: 'Tỷ lệ lãi (%)',
    dataIndex: 'interestRate',
    sorter: (a, b) => a.interestRate - b.interestRate,
    render: (value) => <span className="text-yellow-400">{value}%</span>,
  },
  {
    title: 'Lợi nhuận',
    dataIndex: 'profit',
    sorter: (a, b) => a.profit - b.profit,
    render: (value) => <span className="text-green-400 font-medium">{value}</span>,
  },
  {
    title: 'Số lệnh',
    dataIndex: 'commandNumber',
    sorter: (a, b) => a.commandNumber - b.commandNumber,
  },
  {
    title: 'Tỉ lệ thắng (%)',
    dataIndex: 'winRate',
    sorter: (a, b) => a.winRate - b.winRate,
    render: (value) => <span className="text-cyan-400">{value}%</span>,
  },
  {
    title: 'Thực hiện',
    render: (_, record) => (
      <>
        <Tooltip title="Chỉnh sửa">
          <Button
            className="mr-2 border-0 bg-transparent hover:!bg-[#374151] hover:!text-yellow-400 !text-gray-400"
            icon={<EditOutlined />}
            onClick={() => {
              onEdit(record)
              setBotId(record.id)
            }}
            type="text"
          />
        </Tooltip>
        <Tooltip title="Xóa Bot">
          <Button
            className="text-red-500 border-0 bg-transparent hover:!bg-[#374151] hover:!text-red-400"
            icon={<DeleteOutlined />}
            onClick={() => {
              setIsModalOpen(true)
              setBotId(record.id)
            }}
            type="text"
          />
        </Tooltip>
      </>
    ),
  },
]

const Bot = () => {
  const { antMessage } = useMessage()
  const [data, setData] = useState([])
  const [form] = Form.useForm()
  const [loadingupdated, setLoadingupdated] = useState(false)
  const [loadingAdd, setLoadingAdd] = useState(false)
  const [editingRecord, setEditingRecord] = useState(false)
  const [botId, setBotId] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingDelete, setLoadingDelete] = useState(false)
  const [update, setUpdate] = useState(false) // State trigger re-fetch

  // LOGIC: Lấy dữ liệu (Giữ nguyên)
  useEffect(() => {
    setLoading(true)
    botService
      .getAllBot()
      .then((res) => setData(res.data))
      .catch((err) => {
        console.log(err)
        antMessage.error('Không thể tải danh sách Bot.')
      })
      .finally(() => setLoading(false))
  }, [update, antMessage])

  const onEdit = (record) => {
    form.setFieldsValue(record)
    setEditingRecord(true)
  }

  // LOGIC: Cập nhật (Giữ nguyên)
  const handleUpdate = () => {
    form.validateFields()
      .then(formData => {
        setLoadingupdated(true)
        botService
          .updateBot(botId, formData)
          .then(() => {
            antMessage.success('Cập nhật thành công!')
            setEditingRecord(false)
            form.resetFields()
            setBotId('')
            setUpdate(prev => !prev) // Trigger re-fetch
          })
          .catch((err) => {
            console.log(err);
            antMessage.error(err.response?.data?.message || 'Lỗi khi cập nhật Bot.')
          })
          .finally(() => setLoadingupdated(false))
      })
      .catch(info => {
        console.log('Validate Failed:', info);
        antMessage.warning('Vui lòng điền đầy đủ và đúng định dạng các trường.')
      });
  }

  // LOGIC: Thêm mới (Giữ nguyên)
  const handleAdd = () => {
    form.validateFields()
      .then(formData => {
        setLoadingAdd(true)
        botService
          .addBot(formData)
          .then(() => {
            antMessage.success('Thêm bot thành công.')
            form.resetFields()
            setUpdate(prev => !prev) // Trigger re-fetch
          })
          .catch((err) => {
            console.log(err);
            antMessage.error(err.response?.data?.message || 'Lỗi khi thêm Bot.')
          })
          .finally(() => setLoadingAdd(false))
      })
      .catch(info => {
        console.log('Validate Failed:', info);
        antMessage.warning('Vui lòng điền đầy đủ và đúng định dạng các trường.')
      });
  }

  // LOGIC: Xóa (Giữ nguyên)
  const handleOk = () => {
    setLoadingDelete(true)
    botService
      .deleteBot(botId)
      .then(() => {
        const newData = data.filter((item) => item.id !== botId)
        setData(newData)
        antMessage.success('Xóa thành công.')
      })
      .catch((err) => {
        console.log(err);
        antMessage.error(err.response?.data?.message || 'Lỗi khi xóa Bot.')
      })
      .finally(() => {
        setLoadingDelete(false)
        setIsModalOpen(false)
        setBotId('')
      })
  }

  const handleCancel = () => {
    setIsModalOpen(false)
  }

  const handleClear = () => {
    setEditingRecord(false)
    form.resetFields()
    setBotId('')
  }
  
  const refreshData = () => {
    setUpdate(prev => !prev);
  }

  return (
    // Áp dụng nền tối cho toàn bộ trang
    <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: BACKGROUND_COLOR }}>
      <div className="space-y-8">
        
        {/* --- TIÊU ĐỀ CHÍNH --- */}
        <Divider className="!border-gray-700">
          <span className="text-gray-400 text-lg font-bold flex items-center gap-2">
            <RobotOutlined style={{ color: ACCENT_COLOR }} /> QUẢN LÝ DANH SÁCH BOT
          </span>
        </Divider>

        {/* --- KHỐI CHÍNH: Bảng và Form --- */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          
          {/* --- CỘT 1: BẢNG DANH SÁCH BOT --- */}
          <Card 
            className="lg:col-span-2 shadow-2xl rounded-xl" 
            style={{ backgroundColor: CARD_BG, border: '1px solid #374151' }}
          >
            <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-semibold text-white">DANH SÁCH BOT HIỆN CÓ</span>
                <Tooltip title="Tải lại dữ liệu">
                    <Button 
                      icon={<SyncOutlined />} 
                      onClick={refreshData}
                      className="bg-transparent !text-gray-400 hover:!text-white hover:!border-gray-600"
                      loading={loading}
                    />
                </Tooltip>
            </div>
            <div className="overflow-x-auto custom-table-dark">
              <Table
                loading={loading}
                columns={columns(onEdit, setBotId, setIsModalOpen)}
                dataSource={data}
                className="shadow-lg"
                rowKey={(record) => record.id}
                pagination={{ pageSize: 8 }}
                locale={{ emptyText: <span className="text-gray-400">Không có dữ liệu Bot nào.</span> }}
              />
            </div>
          </Card>
          
          {/* --- CỘT 2: FORM THÊM/SỬA BOT --- */}
          <Card 
            className="h-fit shadow-2xl rounded-xl lg:col-span-1" 
            style={{ backgroundColor: CARD_BG, border: '1px solid #374151' }}
          >
            <div className="text-xl text-center p-2 text-white font-bold mb-4" style={{ borderBottom: `2px solid ${ACCENT_COLOR}` }}>
                {editingRecord ? 'CHỈNH SỬA THÔNG TIN BOT' : 'THÊM BOT MỚI'}
            </div>
            
            <Form form={form} layout="vertical">
              
              {/* Trường Tên Bot */}
              <Form.Item 
                label={<span className="text-gray-300 font-semibold">Tên Bot</span>}
                name="name" 
                rules={[{ required: true, message: 'Vui lòng nhập Tên Bot!' }]}
              >
                {/* Đã thêm class: bg-[#0f172a] text-white border-[#374151] focus:!border-pink-500 hover:!border-pink-500 */}
                <Input className="bg-[#0f172a] text-white border-[#374151] focus:!border-pink-500 hover:!border-pink-500" />
              </Form.Item>
              
              {/* Trường Tỷ lệ lãi */}
              <Form.Item 
                label={<span className="text-gray-300 font-semibold">Tỷ lệ lãi (%)</span>}
                name="interestRate" 
                rules={[
                  { required: true, message: 'Vui lòng nhập Tỷ lệ lãi!' },
                  { pattern: /^\d+(\.\d+)?$/, message: 'Phải là số hợp lệ!' }
                ]}
              >
                {/* Đã thêm class: bg-[#0f172a] text-white border-[#374151] focus:!border-pink-500 hover:!border-pink-500 */}
                <Input className="bg-[#0f172a] text-white border-[#374151] focus:!border-pink-500 hover:!border-pink-500" suffix="%" />
              </Form.Item>
              
              {/* Trường Lợi nhuận */}
              <Form.Item 
                label={<span className="text-gray-300 font-semibold">Lợi nhuận</span>}
                name="profit" 
                rules={[
                  { required: true, message: 'Vui lòng nhập Lợi nhuận!' },
                  { pattern: /^\d+(\.\d+)?$/, message: 'Phải là số hợp lệ!' }
                ]}
              >
                {/* Đã thêm class: bg-[#0f172a] text-white border-[#374151] focus:!border-pink-500 hover:!border-pink-500 */}
                <Input className="bg-[#0f172a] text-white border-[#374151] focus:!border-pink-500 hover:!border-pink-500" />
              </Form.Item>
              
              {/* Trường Số lệnh */}
              <Form.Item 
                label={<span className="text-gray-300 font-semibold">Số lệnh</span>}
                name="commandNumber" 
                rules={[
                  { required: true, message: 'Vui lòng nhập Số lệnh!' },
                  { pattern: /^\d+$/, message: 'Phải là số nguyên!' }
                ]}
              >
                {/* Đã thêm class: bg-[#0f172a] text-white border-[#374151] focus:!border-pink-500 hover:!border-pink-500 */}
                <Input className="bg-[#0f172a] text-white border-[#374151] focus:!border-pink-500 hover:!border-pink-500" />
              </Form.Item>
              
              {/* Trường Tỉ lệ thắng */}
              <Form.Item 
                label={<span className="text-gray-300 font-semibold">Tỉ lệ thắng (%)</span>}
                name="winRate" 
                rules={[
                  { required: true, message: 'Vui lòng nhập Tỉ lệ thắng!' },
                  { pattern: /^\d+(\.\d+)?$/, message: 'Phải là số hợp lệ!' }
                ]}
              >
                {/* Đã thêm class: bg-[#0f172a] text-white border-[#374151] focus:!border-pink-500 hover:!border-pink-500 */}
                <Input className="bg-[#0f172a] text-white border-[#374151] focus:!border-pink-500 hover:!border-pink-500" suffix="%" />
              </Form.Item>
              
              {/* Nhóm Button */}
              <div className="flex justify-between gap-2 mt-6">
                
                {editingRecord ? (
                  <Button
                    type="primary"
                    size="large"
                    className="flex-1 bg-yellow-600 hover:!bg-yellow-500 border-none"
                    onClick={handleUpdate}
                    disabled={loadingupdated}
                    icon={loadingupdated ? <Spin size="small" /> : <SaveOutlined />}
                  >
                    Cập nhật
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    size="large"
                    className="flex-1"
                    style={{ backgroundColor: ACCENT_COLOR, borderColor: ACCENT_COLOR }}
                    onClick={handleAdd}
                    disabled={loadingAdd}
                    icon={loadingAdd ? <Spin size="small" /> : <PlusCircleOutlined />}
                  >
                    Thêm Bot
                  </Button>
                )}
                
                <Button
                  size="large"
                  onClick={handleClear}
                  className="w-1/3 bg-[#374151] text-white hover:!bg-[#4b5563] border-none"
                  icon={<SyncOutlined />}
                >
                  Clear
                </Button>
              </div>
            </Form>
          </Card>
        </div>
      </div>
      
      {/* --- MODAL XÓA (Giữ nguyên logic) --- */}
      <Modal
        title={<span style={{ color: ACCENT_COLOR, fontWeight: 'bold' }}>XÓA THÔNG TIN BOT</span>}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
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
          Bạn có chắc chắn muốn **xóa vĩnh viễn** Bot này khỏi hệ thống? Hành động này không thể hoàn tác.
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
          
          /* Form Inputs - Sửa để giữ nền tối khi focus/hover */
          /* Cho Input thường */
          .ant-input {
            color: white !important;
            background-color: #0f172a !important; 
            border-color: #374151 !important;
            box-shadow: none !important; 
          }
          .ant-input:hover {
            border-color: ${ACCENT_COLOR} !important;
          }
          .ant-input:focus,
          .ant-input-focused {
            border-color: ${ACCENT_COLOR} !important;
            background-color: #0f172a !important; /* Quan trọng: Giữ nền tối khi focus */
            box-shadow: 0 0 0 2px rgba(236, 72, 153, 0.2) !important; /* Shadow mờ của pink-500 */
          }
          
          /* Fix cho Input có Suffix/Prefix (Affix Wrapper) */
          .ant-input-affix-wrapper {
            background-color: #0f172a !important;
            border-color: #374151 !important;
            color: white !important;
          }
          .ant-input-affix-wrapper:not(.ant-input-affix-wrapper-disabled):hover {
            border-color: ${ACCENT_COLOR} !important; 
          }
          .ant-input-affix-wrapper-focused,
          .ant-input-affix-wrapper:focus {
            border-color: ${ACCENT_COLOR} !important;
            background-color: #0f172a !important; /* Quan trọng: Giữ nền tối khi focus */
            box-shadow: 0 0 0 2px rgba(236, 72, 153, 0.2) !important; /* Shadow mờ của pink-500 */
          }
          
          .ant-input-suffix {
            color: #9ca3af !important; /* gray-400 */
          }
      `}</style>
    </div>
  )
}

export default Bot