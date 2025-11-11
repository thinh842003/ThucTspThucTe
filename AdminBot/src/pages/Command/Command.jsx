import { Button, ConfigProvider, Form, Input, Modal, Space, Spin, Divider, message } from 'antd'
import React, { useState, useCallback } from 'react'
import { RocketOutlined, CloseCircleOutlined, CheckCircleOutlined, MinusCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons'

// --- MÔ PHỎNG CÁC IMPORT (Đã sửa lỗi biên dịch) ---
// MÔ PHỎNG useMessage (thay thế '../../App')
const useMessage = () => ({
  antMessage: message,
});

// MÔ PHỎNG adminService (thay thế '../../service/adminService')
const adminService = {
  adminPost: (data) => {
    console.log('--- ADMIN API CALL MOCK ---');
    console.log('Sending data:', data);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Giả lập thành công 90%
        if (Math.random() < 0.9) {
          resolve();
        } else {
          reject(new Error("Mock API failed"));
        }
      }, 1000);
    });
  },
};
// --- END MÔ PHỎNG ---


// Định nghĩa màu sắc cho giao diện tối và các hành động
const ACCENT_COLOR_LONG = '#198754'; // Xanh lá đậm cho LONG
const ACCENT_COLOR_SHORT = '#dc3545'; // Đỏ đậm cho SHORT
const ACCENT_COLOR_CANCEL = '#ffc107'; // Vàng cho CANCEL_ALL
const ACCENT_COLOR_CLOSE = '#0d6efd'; // Xanh dương cho CANCEL_VITHE (Đóng lệnh)

const BACKGROUND_COLOR = '#0f172a'; // Nền tối (slate-900)
const CARD_BG = '#1e293b'; // Nền khối chính (slate-800)


const Command = () => {
  const { antMessage } = useMessage() 
  const [form] = Form.useForm()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({})
  const [currentAction, setCurrentAction] = useState('')
  const [loading, setLoading] = useState(false)

  const showModal = useCallback((values) => {
    setFormData(values)
    setIsModalOpen(true)
  }, [])

  // LOGIC XỬ LÝ OK MODAL (Giữ nguyên logic của bạn)
  const handleOk = useCallback(() => {
    let data = { status: currentAction }
    
    // GATHERING LOGIC (Đã tinh chỉnh để đảm bảo giá trị là số hoặc 0)
    Object.keys(form.getFieldsValue()).forEach(
      (key) => {
        const value = form.getFieldValue(key);
        if (key === 'price' || key === 'stopOrderValue') {
            data = { ...data, [key]: parseFloat(value) || 0 }
        } else if (key === 'orderNumber') {
             data = { ...data, [key]: parseInt(value) || 0 }
        } else {
             data = { ...data, [key]: value || 0 }
        }
      }
    )
    
    setLoading(true)
    adminService
      .adminPost(data)
      .then(() => {
        antMessage.success('Gửi lệnh thành công.')
        form.resetFields()
      })
      .catch(() => antMessage.error('Gửi lệnh thất bại.'))
      .finally(() => {
        setIsModalOpen(false)
        setLoading(false)
      })
  }, [currentAction, form, antMessage])

  const handleCancel = useCallback(() => setIsModalOpen(false), [])

  // LOGIC ĐÓNG LỆNH TỨC THỜI (Giữ nguyên logic của bạn)
  const handleImmediateAction = useCallback((action) => {
    let data = { status: action }
    data = { ...data, price: 0, orderNumber: 0, stopOrderValue: 0 }

    setLoading(true)
    adminService
      .adminPost(data)
      .then(() => {
        antMessage.success('Đóng lệnh thành công.')
      })
      .catch(() => antMessage.error('Đóng lệnh thất bại.'))
      .finally(() => {
        setLoading(false)
      })
  }, [antMessage])

  // LOGIC XỬ LÝ ACTION CLICK (Giữ nguyên logic của bạn)
  const handleActionClick = useCallback(async (action) => {
    if (action === 'CANCEL_VITHE') {
      handleImmediateAction(action)
    } else if (action === 'CANCEL_ALL') {
      setCurrentAction(action)
      showModal({})
    } else {
      try {
        const values = await form.validateFields()
        setCurrentAction(action)
        showModal(values)
      } catch (err) {
        console.error('Validation failed:', err)
      }
    }
  }, [form, handleImmediateAction, showModal])

  const getActionTitle = (action) => {
    switch(action) {
      case 'SHORT': return 'LỆNH SHORT'
      case 'LONG': return 'LỆNH LONG'
      case 'CANCEL_ALL': return 'HỦY TẤT CẢ LỆNH'
      case 'CANCEL_VITHE': return 'ĐÓNG LỆNH HIỆN TẠI'
      default: return action
    }
  }
  
  // Custom theme cho nút LONG (Xanh lá)
  const LongButtonTheme = {
    components: {
      Button: {
        colorPrimary: ACCENT_COLOR_LONG,
        colorPrimaryHover: '#4BB543',
        colorPrimaryActive: ACCENT_COLOR_LONG,
      },
    },
  };

  // Custom theme cho nút CANCEL_ALL (Vàng)
  const CancelAllButtonTheme = {
    components: {
      Button: {
        colorPrimary: ACCENT_COLOR_CANCEL,
        colorPrimaryHover: '#ffda6a',
        colorPrimaryActive: ACCENT_COLOR_CANCEL,
      },
    },
  };

  return (
    <div className="min-h-screen p-4 md:p-8 font-inter" style={{ backgroundColor: BACKGROUND_COLOR }}>
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* --- PHẦN TIÊU ĐỀ --- */}
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white uppercase tracking-wider flex items-center justify-center gap-3">
            <RocketOutlined style={{ color: ACCENT_COLOR_LONG }} />
            BẢNG ĐIỀU KHIỂN ĐẶT LỆNH
          </h1>
          <Divider className="!border-gray-700 !my-4" />
        </div>

        {/* --- PHẦN FORM CHÍNH --- */}
        <div 
          className="shadow-2xl rounded-xl transition duration-300 p-6 md:p-8 border-2" 
          style={{ backgroundColor: CARD_BG, borderColor: ACCENT_COLOR_CLOSE }}
        >
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <div style={{ width: '12px', height: '12px', backgroundColor: ACCENT_COLOR_CLOSE }} className="rounded-full shadow-lg shadow-blue-500/50"></div>
                THÔNG SỐ LỆNH
            </h2>
            <Form form={form} initialValues={{ stopOrder: 'SOL' }} layout="vertical">
            {/* Input Group */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Input 1: Giá đặt (Price) */}
              <Form.Item
                name="price"
                label={<span className="text-gray-300">Giá đặt (Price)</span>}
                rules={[
                  {
                    // Regex cho phép rỗng hoặc số có tối đa 1 thập phân
                    pattern: /^\d*(\.\d{1})?$/, 
                    message: 'Giá đặt chỉ có 1 chữ số thập phân!',
                  },
                ]}
              >
                <Input 
                  size="large" 
                  placeholder="Ví dụ: 12345.5 (Để trống là Market)" 
                  className="bg-gray-700 text-white border-gray-600 focus:border-blue-500"
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>
              
              {/* Input 2: Số hợp đồng (Order Number) */}
              <Form.Item
                name="orderNumber"
                label={<span className="text-gray-300">Số hợp đồng (Contracts)</span>}
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập số hợp đồng!',
                  },
                  // Custom rule để kiểm tra số nguyên dương > 0
                  ({ getFieldValue }) => ({
                      validator(_, value) {
                          if (!value || parseInt(value) > 0) {
                              return Promise.resolve();
                          }
                          return Promise.reject(new Error('Số hợp đồng phải lớn hơn 0!'));
                      },
                  }),
                ]}
              >
                <Input 
                  size="large" 
                  placeholder="Ví dụ: 10" 
                  type="number" 
                  min={1}
                  className="bg-gray-700 text-white border-gray-600 focus:border-blue-500"
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>
              
              {/* Input 3: Stop Order Value */}
              <Form.Item
                name="stopOrderValue"
                label={<span className="text-gray-300">Giá Stop Order (Stop Order Value)</span>}
                rules={[
                  {
                    pattern: /^\d*(\.\d{1})?$/, 
                    message: 'Là số nguyên hoặc chỉ có 1 chữ số thập phân',
                  },
                ]}
              >
                <Input 
                  size="large" 
                  placeholder="Ví dụ: 12300.0 (Tùy chọn)" 
                  className="bg-gray-700 text-white border-gray-600 focus:border-blue-500"
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>
            </div>
            
            <Divider className="!border-gray-700 !mt-0 !mb-6"/>

            {/* --- NÚT HÀNH ĐỘNG --- */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              
              {/* SHORT Button (Red) */}
              <Button
                htmlType="button"
                type="primary"
                danger
                size="large"
                className="h-16 text-xl font-extrabold rounded-xl shadow-lg transition duration-300 hover:scale-[1.03]"
                style={{ backgroundColor: ACCENT_COLOR_SHORT, borderColor: ACCENT_COLOR_SHORT, boxShadow: `0 4px 15px ${ACCENT_COLOR_SHORT}40` }}
                onClick={() => handleActionClick('SHORT')}
                icon={<MinusCircleOutlined />}
              >
                SHORT
              </Button>

              {/* LONG Button (Green) */}
              <ConfigProvider theme={LongButtonTheme}>
                <Button
                  htmlType="button"
                  type="primary"
                  size="large"
                  className="h-16 text-xl font-extrabold rounded-xl shadow-lg transition duration-300 hover:scale-[1.03]"
                  style={{ boxShadow: `0 4px 15px ${ACCENT_COLOR_LONG}40` }}
                  onClick={() => handleActionClick('LONG')}
                  icon={<CheckCircleOutlined />}
                >
                  LONG
                </Button>
              </ConfigProvider>
              
              {/* CANCEL_ALL Button (Yellow/Warning) */}
              <ConfigProvider theme={CancelAllButtonTheme}>
                <Button 
                  type="primary" 
                  size="large" 
                  className="h-16 text-xl font-extrabold rounded-xl shadow-lg transition duration-300 hover:scale-[1.03] text-gray-900"
                  style={{ boxShadow: `0 4px 15px ${ACCENT_COLOR_CANCEL}40` }}
                  onClick={() => handleActionClick('CANCEL_ALL')}
                  icon={<ExclamationCircleOutlined />}
                >
                  HỦY TẤT CẢ
                </Button>
              </ConfigProvider>
              
              {/* CANCEL_VITHE Button (Blue/Primary) */}
              <Button 
                type="primary" 
                size="large" 
                className="h-16 text-xl font-extrabold rounded-xl shadow-lg transition duration-300 hover:scale-[1.03]"
                style={{ backgroundColor: ACCENT_COLOR_CLOSE, borderColor: ACCENT_COLOR_CLOSE, boxShadow: `0 4px 15px ${ACCENT_COLOR_CLOSE}40` }}
                onClick={() => handleActionClick('CANCEL_VITHE')}
                icon={<CloseCircleOutlined />}
              >
                ĐÓNG LỆNH
              </Button>
            </div>
          </Form>
        </div>
      </div>
      
      {/* --- MODAL XÁC NHẬN --- */}
      <Modal
        title={<span className="text-xl font-bold">{currentAction === 'CANCEL_ALL' ? 'Xác nhận hủy tất cả lệnh' : `Xác nhận ${getActionTitle(currentAction)}`}</span>}
        open={isModalOpen}
        onOk={handleOk}
        okText={loading ? <Spin /> : 'GỬI LỆNH'}
        okButtonProps={{ disabled: loading, type: 'primary', danger: currentAction === 'SHORT' }}
        onCancel={handleCancel}
        cancelText="Hủy"
        className="dark-modal"
      >
        <div className="py-4">
          {currentAction === 'CANCEL_ALL' ? (
            <p className="text-lg text-yellow-600 font-semibold">
              <ExclamationCircleOutlined className="mr-2" />
              Bạn có chắc chắn muốn **hủy tất cả** các lệnh đang chờ không?
            </p>
          ) : (
            <div className="space-y-3">
              <p className="text-gray-600">Vui lòng kiểm tra lại thông tin lệnh:</p>
              <p className="text-gray-800">Giá đặt: <strong className="font-mono text-lg">{formData.price || 'Thị trường (Market)'}</strong></p>
              <p className="text-gray-800">Số hợp đồng: <strong className="font-mono text-lg">{formData.orderNumber}</strong></p>
              <p className="text-gray-800">Stop Order: <strong className="font-mono text-lg">{formData.stopOrderValue || 'Không đặt'}</strong></p>
              <p className={`text-xl font-extrabold ${currentAction === 'SHORT' ? 'text-red-600' : 'text-green-600'}`}>
                Lệnh đặt: <span>{getActionTitle(currentAction)}</span>
              </p>
            </div>
          )}
        </div>
      </Modal>

      {/* --- CUSTOM CSS CHO DARK MODE --- */}
      <style>{`
        /* Styling cho nhãn Form */
        .ant-form-item-label > label {
          color: #9ca3af !important;
        }
        
        /* Modal với nền tương phản để dễ đọc */
        .dark-modal .ant-modal-content {
          background-color: #f3f4f6; 
          color: #1f2937;
          border-radius: 12px;
        }
        .dark-modal .ant-modal-header {
            background-color: #f3f4f6; 
            border-bottom: 1px solid #e5e7eb;
            border-radius: 12px 12px 0 0;
        }
        .dark-modal .ant-modal-title {
          color: #1f2937;
        }

        /* Input overrides cho dark theme */
        .ant-input-lg, .ant-input-affix-wrapper-lg {
          background-color: ${CARD_BG} !important;
          color: white !important;
          border-color: #4b5563 !important;
        }
        .ant-input-lg::placeholder {
          color: #9ca3af !important; 
        }
        .ant-input-lg:focus, .ant-input-affix-wrapper-lg:focus,
        .ant-input-lg:hover, .ant-input-affix-wrapper-lg:hover {
          border-color: ${ACCENT_COLOR_CLOSE} !important;
          box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.2) !important;
        }
        
        /* Đảm bảo nút Hủy tất cả có chữ màu tối */
        .text-gray-900 {
            color: #1f2937 !important;
        }
      `}</style>
    </div>
  )
}

export default Command