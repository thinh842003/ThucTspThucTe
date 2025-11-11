import React, { useEffect, useState } from 'react'
import { Button, Form, Input, Modal, Spin, Table, Select, InputNumber, Card, Divider } from 'antd'
import { EditOutlined, DeleteOutlined, RobotOutlined, DollarOutlined, TagOutlined, CalendarOutlined, FileTextOutlined, SaveOutlined, PlusCircleOutlined, ReloadOutlined } from '@ant-design/icons'
import pricebotService from '../../service/pricebotService'
import botService from '../../service/botService'
import { useMessage } from '../../App'
import { formatVND } from '../../service/commonService'

const { Option } = Select

// MÀU SẮC CHỦ ĐẠO
const ACCENT_COLOR = '#ec4899'; // pink-500
const BACKGROUND_COLOR = '#0f172a'; // slate-900 (Nền tối)
const CARD_BG = '#1e293b'; // slate-800 (Nền khối chính)

const PriceBot = () => {
  const { antMessage } = useMessage()
  const [data, setData] = useState([])
  const [botOptions, setBotOptions] = useState([])
  const [form] = Form.useForm()
  const [loadingAdd, setLoadingAdd] = useState(false)
  const [loadingUpdated, setLoadingUpdated] = useState(false)

  const [isEditing, setIsEditing] = useState(false)
  const [month, setMonth] = useState('')
  const [botTradingId, setBotTradingId] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [update, setUpdate] = useState(false)

  // --- COLUMN DEFINITIONS (GIỮ NGUYÊN LOGIC) ---
  const columns = (onEdit) => [
    {
      title: <span style={{ color: ACCENT_COLOR }}>Số tháng của gói</span>,
      dataIndex: 'month',
      sorter: (a, b) => a.month - b.month,
    },
    {
      title: <span style={{ color: ACCENT_COLOR }}>Giá gói</span>,
      dataIndex: 'price',
      render: (value) => formatVND(value),
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: <span style={{ color: ACCENT_COLOR }}>Giảm giá (%)</span>,
      dataIndex: 'discount',
      render: (value) => `${value}%`
    },
    {
      title: <span style={{ color: ACCENT_COLOR }}>Mã Bot</span>,
      dataIndex: 'botTradingId',
    },
    {
      title: <span style={{ color: ACCENT_COLOR }}>Mô tả</span>,
      dataIndex: 'description',
    },
    {
      title: <span style={{ color: ACCENT_COLOR }}>Thao tác</span>,
      render: (_, record) => (
        <div className='flex items-center space-x-2'>
          <Button
            type="primary"
            style={{ backgroundColor: '#2563eb', borderColor: '#2563eb' }} // Màu xanh dương
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
            size="small"
          />
          <Button
            type="primary"
            style={{ backgroundColor: '#ef4444', borderColor: '#ef4444' }} // Màu đỏ
            icon={<DeleteOutlined />}
            onClick={() => {
              setIsModalOpen(true)
              setMonth(record.month)
              setBotTradingId(record.botTradingId)
            }}
            size="small"
          />
        </div>
      ),
    },
  ]

  // --- DATA FETCHING (GIỮ NGUYÊN LOGIC) ---
  useEffect(() => {
    setLoading(true)
    pricebotService
      .getPriceBot()
      .then((res) => setData(res.data))
      .catch((err) => console.log(err))
      .finally(() => setLoading(false))

    botService
      .getAllBot()
      .then((res) => setBotOptions(res.data))
      .catch((err) => console.log(err))
  }, [update])

  // --- HANDLERS (GIỮ NGUYÊN LOGIC) ---
  const onEdit = (record) => {
    form.setFieldsValue(record)
    setIsEditing(true)
  }

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields()

      setLoadingUpdated(true)
      pricebotService
        .updatePriceBot(values.month, values.botTradingId, values)
        .then((res) => {
          console.log(res)
          antMessage.success('Cập nhật thành công!')
          setIsEditing(false)
          setUpdate(!update)
          form.resetFields()
        })
        .catch((err) => {
          antMessage.error(err.response?.data || err.message)
        })
        .finally(() => setLoadingUpdated(false))
    } catch (error) {}
  }

  const handleAdd = async () => {
    try {
      const values = await form.validateFields()

      setLoadingAdd(true)
      pricebotService
        .addPriceBot({ ...values, discount: values.discount ?? 0 })
        .then(() => {
          antMessage.success('Thêm giá bot thành công.')
          form.resetFields()
          setUpdate(!update)
        })
        .catch((err) => antMessage.error(err.response?.data || err.message))
        .finally(() => setLoadingAdd(false))
    } catch (error) {}
  }

  const handleOk = () => {
    pricebotService
      .deletePrictbot(month, botTradingId)
      .then(() => {
        const newData = data.filter(
          (item) => !(item.month === month && item.botTradingId === botTradingId),
        )
        setData(newData)
        antMessage.success('Xóa thành công.')
      })
      .catch(() => antMessage.error('Xóa lỗi'))
      .finally(() => setIsModalOpen(false))
  }

  const handleCancel = () => {
    setIsModalOpen(false)
  }

  const handleClear = () => {
    setIsEditing(false)
    form.resetFields()
  }

  // --- RENDER COMPONENT (CẬP NHẬT GIAO DIỆN) ---
  return (
    <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: BACKGROUND_COLOR }}>
      <div className="space-y-8">
        <Divider className="!border-gray-700">
          <span className="text-gray-400 text-lg font-bold flex items-center gap-2">
            <RobotOutlined /> QUẢN LÝ GÓI BOT GIAO DỊCH
          </span>
        </Divider>
        
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          
          {/* BẢNG DỮ LIỆU GÓI BOT */}
          <Card 
            className="shadow-2xl rounded-xl custom-table-dark lg:col-span-2" 
            style={{ backgroundColor: CARD_BG, border: '1px solid #374151' }}
            title={<span className="text-xl font-semibold text-white">DANH SÁCH GÓI BOT</span>}
          >
            <div className="overflow-x-auto">
              <Table
                loading={loading}
                columns={columns(onEdit)}
                dataSource={data}
                rowKey={(record) => record.botTradingId + record.month}
                pagination={{ pageSize: 5 }}
              />
            </div>
          </Card>
          
          {/* FORM THÊM/CẬP NHẬT GÓI BOT */}
          <Card 
            className="shadow-2xl rounded-xl h-fit" 
            style={{ backgroundColor: CARD_BG, border: `1px solid ${isEditing ? '#2563eb' : ACCENT_COLOR}` }}
            title={<span className="text-xl font-bold text-white flex items-center gap-2">
              {isEditing ? <EditOutlined /> : <PlusCircleOutlined />} {isEditing ? 'CẬP NHẬT GÓI' : 'THÊM GÓI MỚI'}
            </span>}
          >
            <Form 
              form={form} 
              layout="vertical" 
              className="space-y-2 custom-form-dark"
            >
              {/* Số tháng */}
              <Form.Item
                label={<span className="text-gray-300 flex items-center gap-1"><CalendarOutlined /> Số tháng của gói</span>}
                rules={[
                  { required: true, message: 'Vui lòng nhập số tháng' },
                  { type: 'number', min: 1, max: 12, message: 'Số tháng phải từ 1 đến 12' }
                ]}
                name="month"
              >
                <InputNumber disabled={isEditing} className="w-full custom-input-dark" />
              </Form.Item>
              
              {/* Giá */}
              <Form.Item
                label={<span className="text-gray-300 flex items-center gap-1"><DollarOutlined /> Giá gói (VND)</span>}
                rules={[
                  { required: true, message: 'Vui lòng nhập giá' },
                  { type: 'number', min: 0, message: 'Giá không được âm' }
                ]}
                name="price"
              >
                <InputNumber
                  className="w-full custom-input-dark"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
              
              {/* Giảm giá */}
              <Form.Item 
                label={<span className="text-gray-300 flex items-center gap-1"><TagOutlined /> Giảm giá (%)</span>}
                name="discount" 
                rules={[
                  { type: 'number', min: 0, max: 100, message: 'Giảm giá phải từ 0 đến 100%' }
                ]}
                initialValue={0} // Đặt giá trị mặc định nếu không có
              >
                <InputNumber min={0} max={100} className="w-full custom-input-dark" />
              </Form.Item>
              
              {/* Bot ID */}
              <Form.Item
                label={<span className="text-gray-300 flex items-center gap-1"><RobotOutlined /> Chọn Bot</span>}
                rules={[{ required: true, message: 'Vui lòng chọn Bot' }]}
                name="botTradingId"
              >
                <Select 
                  disabled={isEditing} 
                  className="custom-select-dark"
                  dropdownStyle={{ backgroundColor: CARD_BG }}
                >
                  {botOptions.map((bot) => (
                    <Option key={bot.id} value={bot.id} className="custom-select-option-dark">
                      {bot.name} (ID: {bot.id})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              
              {/* Mô tả */}
              <Form.Item
                label={<span className="text-gray-300 flex items-center gap-1"><FileTextOutlined /> Mô tả</span>}
                rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
                name="description"
              >
                <Input.TextArea rows={2} className="custom-input-dark" />
              </Form.Item>
              
              {/* Action Buttons */}
              <div className="pt-4 grid grid-cols-3 gap-2">
                <Button 
                  type="primary" 
                  size="large" 
                  onClick={handleUpdate} 
                  disabled={!isEditing}
                  icon={<SaveOutlined />}
                  className="col-span-1"
                  style={{ backgroundColor: '#2563eb', borderColor: '#2563eb' }}
                >
                  {loadingUpdated ? <Spin /> : 'Cập nhật'}
                </Button>
                
                <Button 
                  type="primary" 
                  size="large" 
                  onClick={handleAdd} 
                  disabled={isEditing}
                  icon={<PlusCircleOutlined />}
                  className="col-span-1"
                  style={{ backgroundColor: ACCENT_COLOR, borderColor: ACCENT_COLOR }}
                >
                  {loadingAdd ? <Spin /> : 'Thêm'}
                </Button>
                
                <Button
                  size="large"
                  onClick={handleClear}
                  icon={<ReloadOutlined />}
                  className="col-span-1"
                  style={{ backgroundColor: '#4b5563', borderColor: '#4b5563', color: 'white' }}
                >
                  Xóa Form
                </Button>
              </div>
            </Form>
          </Card>
        </div>
      </div>

      {/* Modal Xóa */}
      <Modal 
        title={<span className="text-xl font-bold text-red-500">Xác nhận xóa gói</span>} 
        open={isModalOpen} 
        onOk={handleOk} 
        onCancel={handleCancel}
        okText="Xóa"
        cancelText="Hủy"
        className="custom-modal-dark"
      >
        <p className="text-white text-lg">Bạn có chắc chắn **xóa gói** của Bot này? Thao tác này không thể hoàn tác.</p>
      </Modal>

      {/* Custom Styles for Antd Dark Mode */}
      <style>{`
            /* Input, InputNumber, TextArea Styles */
            .custom-input-dark.ant-input, 
            .custom-input-dark.ant-input-number-input,
            .custom-input-dark.ant-input-number,
            .custom-input-dark.ant-input-textarea {
                background-color: #374151 !important; /* gray-700 */
                border-color: #4b5563 !important; /* gray-600 */
                color: white !important;
            }
            .custom-input-dark.ant-input:focus,
            .custom-input-dark.ant-input:hover,
            .custom-input-dark.ant-input-number:focus,
            .custom-input-dark.ant-input-number:hover {
                border-color: ${ACCENT_COLOR} !important;
                box-shadow: 0 0 0 2px ${ACCENT_COLOR}40 !important;
            }

            /* Select Styles */
            .custom-select-dark .ant-select-selector {
                background-color: #374151 !important; /* gray-700 */
                border-color: #4b5563 !important;
                color: white !important;
            }
            .custom-select-dark.ant-select-focused .ant-select-selector,
            .custom-select-dark .ant-select-selector:hover {
                border-color: ${ACCENT_COLOR} !important;
                box-shadow: 0 0 0 2px ${ACCENT_COLOR}40 !important;
            }
            .custom-select-option-dark {
                background-color: ${CARD_BG} !important;
                color: white !important;
            }
            .custom-select-option-dark.ant-select-item-option-selected {
                background-color: #374151 !important;
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

            .custom-table-dark .ant-table-thead > tr > th {
                background: #111827 !important; /* Đậm hơn cho header */
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
            
            /* Modal Styles */
            .custom-modal-dark .ant-modal-content {
                background-color: ${CARD_BG} !important;
                border: 1px solid #374151;
            }
            .custom-modal-dark .ant-modal-header {
                background-color: ${CARD_BG} !important;
                border-bottom: 1px solid #374151;
            }
            .custom-modal-dark .ant-modal-close-x {
                color: white !important;
            }
      `}</style>
    </div>
  )
}

export default PriceBot