import { Button, ConfigProvider, Form, Input, Spin } from 'antd'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LockOutlined, PhoneOutlined, VerifiedOutlined } from '@ant-design/icons'
import authService from '../../service/authService'
import { useAuth, useMessage } from '../../App'
import authActions from '../../service/authAction'

// MÀU SẮC CHỦ ĐẠO (Đồng nhất với Home/Roles)
const ACCENT_COLOR = '#ec4899'; // pink-500
const BACKGROUND_COLOR = '#0f172a'; // slate-900 (Nền tối)
const CARD_BG = '#1e293b'; // slate-800 (Nền khối chính)

const Login = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { dispatch } = useAuth()
  const { antMessage } = useMessage()

  const [userId, setUserId] = useState('')
  const [isVerify, setIsVerify] = useState(false)

  // --- LOGIC ĐĂNG NHẬP (GIỮ NGUYÊN) ---
  const handleSubmit = () => {
    setLoading(true)
    authService
      .login(form.getFieldsValue())
      .then((res) => {
        if (res.data?.roles?.includes('Admin')) {
          setIsVerify(true)
          setUserId(res.data.userId ?? '')
          antMessage.success('Đã gửi mã xác nhận đến email')
        } else throw new Error('Bạn không có quyền truy cập.')
      })
      .catch((err) =>
        antMessage.error(err.response?.data?.title || err.response?.data || err.message),
      )
      .finally(() => setLoading(false))
  }

  // --- LOGIC XÁC THỰC 2FA (GIỮ NGUYÊN) ---
  const handleVerify = () => {
    const data = {
      ...form.getFieldsValue(),
      userId: userId,
    }
    setLoading(true)
    authService
      .verifyLogin(data)
      .then((res) => {
        if (res.data?.roles?.includes('Admin')) {
          setIsVerify(false)
          dispatch(authActions.LOGIN(res.data?.roles))
          antMessage.success('Đăng nhập thành công')
          navigate('/home')
        } else throw new Error('Bạn không có quyền truy cập.')
      })
      .catch((err) =>
        antMessage.error(err.response?.data?.title || err.response?.data || err.message),
      )
      .finally(() => setLoading(false))
  }

  return (
    // Nền tối và căn giữa toàn bộ trang
    <div className="flex items-center justify-center min-h-screen p-4" style={{ backgroundColor: BACKGROUND_COLOR }}>
      
      {/* Khối Đăng nhập (Card) */}
      <div
        className="lg:w-1/3 md:w-1/2 w-full max-w-md shadow-2xl rounded-2xl overflow-hidden transform transition duration-500 hover:scale-[1.02]"
        style={{ backgroundColor: CARD_BG, border: `1px solid ${ACCENT_COLOR}40` }}
      >
        <div className="p-10 md:p-12">
          
          {/* Tiêu đề */}
          <div className="flex justify-center items-center font-extrabold mb-10 text-3xl" style={{ color: ACCENT_COLOR }}>
            {isVerify ? 'Xác Thực 2FA' : 'CHÀO ADMIN!'}
          </div>

          {isVerify ? (
            // --- GIAO DIỆN XÁC THỰC MÃ TOKEN ---
            <Form disabled={loading} form={form} onFinish={handleVerify}>
              <p className="text-gray-400 mb-6 text-center">
                Mã xác thực đã được gửi đến email của bạn. Vui lòng kiểm tra và nhập mã bên dưới để tiếp tục.
              </p>
              <Form.Item
                name="token"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập mã xác thực',
                  },
                ]}
              >
                <Input
                  size="large"
                  placeholder="Mã xác thực (Token)"
                  prefix={<VerifiedOutlined className="text-gray-500 mx-1" />}
                  className="custom-input-login"
                />
              </Form.Item>
              
              {/* Nút Xác nhận */}
              <ConfigProvider
                theme={{
                  components: {
                    Button: {
                      colorPrimary: ACCENT_COLOR,
                      colorPrimaryHover: ACCENT_COLOR,
                      colorPrimaryActive: '#e91e63', // Darker pink
                    },
                  },
                }}
              >
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  className="w-full mt-4 font-bold rounded-xl h-12"
                >
                  {loading ? <Spin /> : 'XÁC NHẬN'}
                </Button>
              </ConfigProvider>
            </Form>
          ) : (
            // --- GIAO DIỆN ĐĂNG NHẬP BÌNH THƯỜNG ---
            <Form disabled={loading} form={form} onFinish={handleSubmit} className="space-y-6">
              
              {/* Username (Số điện thoại) */}
              <Form.Item
                name="username"
                rules={[
                  {
                    required: true,
                    message: 'Số điện thoại là bắt buộc.',
                  },
                ]}
              >
                <Input
                  prefix={<PhoneOutlined className="text-gray-500 mx-1" />}
                  placeholder="Số điện thoại"
                  size="large"
                  className="custom-input-login"
                />
              </Form.Item>
              
              {/* Password (Mật khẩu) */}
              <Form.Item
                name="password"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập mật khẩu',
                  },
                ]}
              >
                <Input.Password
                  size="large"
                  placeholder="Mật khẩu"
                  prefix={<LockOutlined className="text-gray-500 mx-1" />}
                  className="custom-input-login"
                />
              </Form.Item>
              
              {/* Nút Đăng nhập */}
              <ConfigProvider
                theme={{
                  components: {
                    Button: {
                      colorPrimary: ACCENT_COLOR,
                      colorPrimaryHover: ACCENT_COLOR,
                      colorPrimaryActive: '#e91e63', // Darker pink
                    },
                  },
                }}
              >
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  className="w-full mt-8 font-bold rounded-xl h-12"
                >
                  {loading ? <Spin /> : 'ĐĂNG NHẬP'}
                </Button>
              </ConfigProvider>
            </Form>
          )}
        </div>
      </div>
      
      {/* Custom CSS cho giao diện Dark Mode */}
      <style>{`
          /* Input styles */
          .custom-input-login.ant-input-affix-wrapper,
          .custom-input-login.ant-input,
          .custom-input-login .ant-input-password {
              background-color: #374151 !important; /* gray-700 */
              border-color: #4b5563 !important; /* gray-600 */
              color: white !important;
              padding: 10px 14px;
              border-radius: 8px !important;
          }

          .custom-input-login.ant-input-affix-wrapper:hover,
          .custom-input-login.ant-input-affix-wrapper:focus-within {
              border-color: ${ACCENT_COLOR} !important;
              box-shadow: 0 0 0 2px ${ACCENT_COLOR}40 !important;
          }

          .custom-input-login .ant-input-password-icon {
              color: #9ca3af !important; /* gray-400 */
          }
      `}</style>
    </div>
  )
}

export default Login
