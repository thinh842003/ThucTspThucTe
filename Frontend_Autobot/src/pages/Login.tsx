import iconBot2 from "/src/assets/iconbothi.jpg";
import piclerf from "/src/assets/1000_F_1369373417_m2Oa554rcYSDHPXowqTv2XnqbdfWhnJY.jpg";
import { LockOutlined, UserOutlined, MailOutlined } from '@ant-design/icons'; // Thêm MailOutlined cho mã xác thực
import { Button, Checkbox, Form, Input } from 'antd';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useMessage, useAuth } from '../App';
import { LOGIN_SUCCESS } from '../services/authActions';

// MÀU SẮC CHỦ ĐẠO TỪ HOME.TSX
const ACCENT_COLOR = '#ec4899'; // pink-500
const BACKGROUND_COLOR = '#0f172a'; // slate-900 (Nền tối)
const CARD_BG = '#1e293b'; // slate-800 (Nền khối login)

const Login: React.FC = () => {
  const navigate = useNavigate();
  const antMessage = useMessage();
  const auth = useAuth();
  const [loginForm] = Form.useForm();
  const [verifyForm] = Form.useForm();

  if (!auth) {
    console.error("Auth context not available in Login page.");
    return null;
  }

  const { dispatch } = auth;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [adminUserId, setAdminUserId] = useState<string | null>(null);

  useEffect(() => {
    // Check for remembered phone number in local storage
    const rememberedPhone = localStorage.getItem('rememberedPhone');
    if (rememberedPhone) {
      loginForm.setFieldsValue({
        phone: rememberedPhone,
        remember: true, // Also check the remember me box
      });
    }
  }, [loginForm]); // Add form to dependency array

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onFinishLogin = async (values: any) => {
    setIsSubmitting(true);
    try {
      const userData = await authService.login(values.phone, values.password);

      // Handle remember me
      if (values.remember) {
        localStorage.setItem('rememberedPhone', values.phone);
      } else {
        localStorage.removeItem('rememberedPhone');
      }

      // Kiểm tra xem phản hồi có chứa thông tin user (userId) hay không
      if (userData && userData.userId) {
        // Phản hồi có thông tin user. Bây giờ kiểm tra xem có cần xác thực bước 2 cho admin không.
        // Điều kiện cần xác thực bước 2 là: user có role 'Admin' VÀ phản hồi không chứa access_token.
        if (userData.roles.includes('Admin') && (!('access_token' in userData) || !userData.access_token)) {
           // Đây là admin cần xác thực bước 2
          setAdminUserId(userData.userId);
          setShowVerificationForm(true);
          if (antMessage) {
              antMessage.info('Vui lòng kiểm tra email để nhận mã xác thực.');
          }
        } else {
          // User thường HOẶC Admin đã xác thực bước 2 (phản hồi có token)
          dispatch({ type: LOGIN_SUCCESS, payload: { user: userData } });
          if (antMessage) {
              antMessage.success('Đăng nhập thành công!');
          }
          navigate('/');
        }
      } else {
          // Phản hồi không có thông tin user (userId)
          throw new Error('Đăng nhập thất bại. Không nhận được thông tin người dùng.');
      }

    } catch (error: any) {
      console.error('Login failed:', error);
      if (antMessage) {
        antMessage.error(error.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onFinishVerification = async (values: any) => {
    if (!adminUserId) return; // Đảm bảo có userId admin

    setIsSubmitting(true);
    try {
        const userData = await authService.verifyAdminLogin(adminUserId, values.verificationCode);

        // Xác thực admin thành công
        dispatch({ type: LOGIN_SUCCESS, payload: { user: userData } });
        if (antMessage) {
            antMessage.success('Xác thực thành công! Đang chuyển hướng...');
        }
        navigate('/');

    } catch (error: any) {
        console.error('Verification failed:', error);
        if (antMessage) {
            antMessage.error(error.message || 'Xác thực thất bại. Vui lòng kiểm tra lại mã.');
        }
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div
      className="w-screen min-h-screen flex items-center justify-center font-sans relative overflow-hidden"
      style={{ 
        fontFamily: 'system-ui, -apple-system, Helvetica, Arial, sans-serif',
        backgroundColor: BACKGROUND_COLOR, // Áp dụng nền tối
      }}
    >
        {/* HIỆU ỨNG BACKGROUND MỜ (tạo cảm giác công nghệ) */}
        <div 
            className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 blur-3xl" 
            style={{ background: ACCENT_COLOR, filter: 'blur(100px)', zIndex: 0 }}
        ></div>
        <div 
            className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-10 blur-3xl" 
            style={{ background: '#3b82f6', filter: 'blur(100px)', zIndex: 0 }}
        ></div>
        
      {/* KHỐI LOGIN CHÍNH */}
      <div
        className="w-full sm:w-[900px] h-auto sm:h-[600px] flex rounded-2xl overflow-hidden shadow-2xl max-w-full flex-col sm:flex-row relative z-10 border border-gray-700/50"
        style={{ 
            boxShadow: `0 15px 40px ${ACCENT_COLOR}20`, 
            maxHeight: '100vh',
            backgroundColor: CARD_BG, // Nền khối tối
        }}
      >
        {/* TRÁI - ẢNH */}
        <div className="flex-1 relative min-h-[180px] hidden sm:block">
          <img
            src={piclerf}
            alt="bg"
            className="w-full h-full object-cover"
          />
          {/* Lớp phủ màu để phù hợp với tông màu */}
          <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(to top right, ${BACKGROUND_COLOR}80, ${ACCENT_COLOR}40)` }} />
        </div>

        {/* PHẢI - FORM */}
        <div
          className="flex-1 flex flex-col justify-center px-6 py-8 sm:px-[60px] sm:py-[50px] text-white"
        >
          {/* LOGO */}
          <Link to="/">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <img src={iconBot2} alt="logo" style={{ width: '60px'}} />
              <h1 
                style={{ 
                    fontFamily: 'Saira, sans-serif' , 
                    fontSize: '30px', 
                    margin: 0, 
                    fontWeight: 700, 
                    color: 'white',
                    textShadow: `0 0 5px ${ACCENT_COLOR}AA` // Hiệu ứng neon
                }}
              >
                <span style={{ color: ACCENT_COLOR }}>TRADING</span>BOT
              </h1>
            </div>
          </Link>

          {!showVerificationForm ? (
            // FORM ĐĂNG NHẬP CHÍNH
            <>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600, color: 'white' }}>Đăng nhập</h2>
                <p style={{ fontSize: '14px', marginBottom: '20px', color: '#9ca3af' }}>
                  Chào mừng bạn trở lại!
                </p>
                <Form 
                    form={loginForm} 
                    layout="vertical" 
                    onFinish={onFinishLogin} 
                    initialValues={{ remember: true }}
                    className="space-y-4"
                >
                  <Form.Item
                    name="phone"
                    rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                    className="ant-form-item-dark"
                  >
                    <Input
                      size="large"
                      placeholder="Số điện thoại"
                      prefix={<UserOutlined style={{ color: ACCENT_COLOR }} />}
                      className="custom-input-dark"
                    />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                    className="ant-form-item-dark"
                  >
                  <Input.Password
                      size="large"
                      placeholder="Mật khẩu"
                      prefix={<LockOutlined style={{ color: ACCENT_COLOR }} />}
                      className="custom-input-dark"
                    />
                  </Form.Item>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <Form.Item name="remember" valuePropName="checked" noStyle>
                      <Checkbox style={{ color: '#9ca3af' }} className="custom-checkbox-dark">Ghi nhớ đăng nhập</Checkbox>
                    </Form.Item>
                  </div>

                  <Form.Item>
                    <Button 
                        type="primary" 
                        htmlType="submit" 
                        size="large" 
                        block 
                        loading={isSubmitting}
                        style={{ backgroundColor: ACCENT_COLOR, borderColor: ACCENT_COLOR, fontWeight: 700 }}
                        className="hover:!bg-pink-600 hover:!border-pink-600 transition duration-300"
                    >
                      Đăng nhập
                    </Button>
                  </Form.Item>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#9ca3af' }}>
                    <span>
                      Bạn chưa có tài khoản?{' '}
                      <Link to="/register" style={{ color: ACCENT_COLOR, fontWeight: 500 }} className="hover:underline">Đăng ký</Link>
                    </span>
                    <Link to="/forgot-password" style={{ color: ACCENT_COLOR, fontWeight: 500 }} className="hover:underline">Quên mật khẩu</Link>
                  </div>
                </Form>
            </>
          ) : (
            // FORM XÁC THỰC MÃ ADMIN
            <>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600, color: 'white' }}>Xác thực Admin</h2>
                <p style={{ fontSize: '14px', marginBottom: '20px', color: '#9ca3af' }}>
                  Vui lòng nhập mã xác thực đã được gửi đến email quản trị.
                </p>
                <Form form={verifyForm} layout="vertical" onFinish={onFinishVerification}>
                     <Form.Item
                        name="verificationCode"
                        rules={[{ required: true, message: 'Vui lòng nhập mã xác thực!' }]}
                        className="ant-form-item-dark"
                    >
                        <Input
                            size="large"
                            placeholder="Mã xác thực 6 chữ số"
                            prefix={<MailOutlined style={{ color: ACCENT_COLOR }} />}
                            className="custom-input-dark"
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button 
                            type="primary" 
                            htmlType="submit" 
                            size="large" 
                            block 
                            loading={isSubmitting}
                            style={{ backgroundColor: ACCENT_COLOR, borderColor: ACCENT_COLOR, fontWeight: 700 }}
                            className="hover:!bg-pink-600 hover:!border-pink-600 transition duration-300"
                        >
                            Xác thực
                        </Button>
                    </Form.Item>
                    <div className="mt-4 text-center">
                        <Button 
                            type="link" 
                            onClick={() => setShowVerificationForm(false)}
                            style={{ color: '#9ca3af' }}
                            className="hover:!text-white"
                        >
                            Quay lại đăng nhập
                        </Button>
                    </div>
                </Form>
            </>
          )}
        </div>
      </div>
       {/* Custom Styles for Antd Dark Mode */}
       <style>{`
            /* Custom dark input styles */
            .custom-input-dark {
                background-color: #374151 !important; /* slate-700 */
                border-color: #4b5563 !important; /* gray-600 */
                color: white !important;
            }
            .custom-input-dark:hover {
                border-color: ${ACCENT_COLOR} !important;
            }
            .custom-input-dark:focus, 
            .custom-input-dark-focused {
                border-color: ${ACCENT_COLOR} !important;
                box-shadow: 0 0 0 2px ${ACCENT_COLOR}40 !important;
            }
            .custom-input-dark input {
                background-color: #374151 !important; /* slate-700 */
                color: white !important;
            }
            .custom-input-dark .ant-input-password-icon,
            .custom-input-dark .ant-input-prefix,
            .custom-input-dark .ant-input-suffix {
                color: #9ca3af !important;
            }

            /* For Password input */
            .ant-input-password .ant-input-handler-icon {
                color: ${ACCENT_COLOR} !important;
            }

            /* Placeholder text color */
            .custom-input-dark ::placeholder {
                color: #6b7280 !important;
                opacity: 1; 
            }

            /* Checkbox */
            .custom-checkbox-dark .ant-checkbox-checked .ant-checkbox-inner {
                background-color: ${ACCENT_COLOR} !important;
                border-color: ${ACCENT_COLOR} !important;
            }
            .custom-checkbox-dark .ant-checkbox-inner {
                border-color: #4b5563 !important;
                background-color: #374151 !important;
            }
        `}</style>
    </div>
  );
};

export default Login;