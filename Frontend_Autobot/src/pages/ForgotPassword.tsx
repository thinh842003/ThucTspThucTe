import iconBot2 from "/src/assets/iconbothi.jpg";
import piclerf from "/src/assets/1000_F_1369373417_m2Oa554rcYSDHPXowqTv2XnqbdfWhnJY.jpg";
import { LockOutlined, MailOutlined, SafetyOutlined } from '@ant-design/icons';
import { Button, Form, Input} from 'antd';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthService } from '../services/authService';
import { useMessage } from '../App';

// MÀU SẮC CHỦ ĐẠO TỪ HOME.TSX VÀ LOGIN.TSX
const ACCENT_COLOR = '#ec4899'; // pink-500
const BACKGROUND_COLOR = '#0f172a'; // slate-900 (Nền tối)
const CARD_BG = '#1e293b'; // slate-800 (Nền khối)

const ForgotPassword: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const antMessage = useMessage();
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [verifiedCode, setVerifiedCode] = useState<string | null>(null);
  const authService = new AuthService();

  const handleSendCode = async () => {
    try {
      const email = form.getFieldValue('email');
      if (!email) {
        if(antMessage) antMessage.error('Vui lòng nhập email trước khi gửi mã!');
        return;
      }
      setSendingCode(true);
      
      // Call the service and handle success/error using promises
      await authService.sendResetCode(email)
        .then(() => {
          if(antMessage) antMessage.success('Mã xác minh đã được gửi đến email của bạn!');
        })
        .catch((error: any) => {
          console.error('Send code error:', error); // Debug log
          if (error.message) {
            if(antMessage) antMessage.error(error.message);
          } else {
            if(antMessage) antMessage.error('Không thể gửi mã xác minh. Vui lòng thử lại!');
          }
        })
        .finally(() => {
          setSendingCode(false);
        });

    } catch (error) {
      // This catch block is mostly for sync errors before the async call
      console.error('Unexpected error in handleSendCode:', error); // Debug log
      if(antMessage) antMessage.error('Có lỗi xảy ra. Vui lòng thử lại!');
      setSendingCode(false); // Ensure loading state is reset even on unexpected errors
    }
  };

  const handleVerifyCode = async () => {
    try {
      const email = form.getFieldValue('email');
      const code = form.getFieldValue('verifyCode');
      
      if (!email || !code) {
        if(antMessage) antMessage.error('Vui lòng nhập đầy đủ email và mã xác minh!');
        return;
      }

      setLoading(true);
      await authService.verifyResetCode(email, code);
      if(antMessage) antMessage.success('Mã xác minh hợp lệ! Vui lòng nhập mật khẩu mới.');
      setIsVerified(true);
      setVerifiedEmail(email); // Store verified email
      setVerifiedCode(code); // Store verified code
      
      // Clear password fields in case user navigates back and forth (optional, but good practice)
      form.setFieldsValue({
          newPassword: '',
          confirmPassword: '',
      });
      
    } catch (error: any) {
      if (error.message) {
        if(antMessage) antMessage.error(error.message);
      } else {
        if(antMessage) antMessage.error('Mã xác minh không hợp lệ. Vui lòng thử lại!');
      }
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: { newPassword: string; confirmPassword: string }) => {
    try {
      // Only proceed if email and code have been verified and stored
      if (!verifiedEmail || !verifiedCode) {
        if(antMessage) antMessage.error('Vui lòng xác minh email và mã trước!');
        return;
      }

      if (values.newPassword !== values.confirmPassword) {
        if(antMessage) antMessage.error('Mật khẩu xác nhận không khớp!');
        return;
      }

      setLoading(true);
      
      // Use stored email and code, and new password from form
      console.log('Reset password request data:', {
        email: verifiedEmail,
        code: verifiedCode,
        newPassword: values.newPassword,
      });

      await authService.resetPassword(verifiedEmail, verifiedCode, values.newPassword);
      if(antMessage) antMessage.success('Đặt lại mật khẩu thành công!');
      navigate('/login');
    } catch (error: any) {
      if (error.message) {
        if(antMessage) antMessage.error(error.message);
      } else {
        if(antMessage) antMessage.error('Không thể đặt lại mật khẩu. Vui lòng kiểm tra lại thông tin!');
      }
    } finally {
      setLoading(false);
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
        
      {/* KHỐI CHÍNH */}
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

          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600, color: 'white' }}>Quên mật khẩu</h2>
          <p style={{ fontSize: '14px', marginBottom: '20px', color: '#9ca3af' }}>
            {isVerified ? 'Nhập mật khẩu mới' : 'Nhập email để nhận mã xác minh'}
          </p>

          <Form form={form} layout="vertical" onFinish={onFinish}>
            {!isVerified ? (
              <>
                <Form.Item
                  name="email"
                  rules={[{ required: true, message: 'Vui lòng nhập email!', type: 'email' }]}
                  className="ant-form-item-dark"
                >
                  <Input
                    size="large"
                    placeholder="Email"
                    prefix={<MailOutlined style={{ color: ACCENT_COLOR }} />}
                    className="custom-input-dark"
                  />
                </Form.Item>

                <Form.Item
                  name="verifyCode"
                  rules={[{ required: true, message: 'Vui lòng nhập mã xác minh!' }]}
                  className="ant-form-item-dark"
                >
                  <Input
                    size="large"
                    placeholder="Mã xác minh"
                    prefix={<SafetyOutlined style={{ color: ACCENT_COLOR }} />}
                    className="custom-input-dark"
                    addonAfter={
                      <Button 
                        onClick={handleSendCode} 
                        loading={sendingCode}
                        style={{ backgroundColor: CARD_BG, borderColor: '#4b5563', color: ACCENT_COLOR }}
                        className="hover:!bg-slate-700/50 hover:!border-pink-600 transition duration-300"
                      >
                        Gửi mã
                      </Button>
                    }
                  />
                </Form.Item>

                <Form.Item>
                  <Button 
                    type="primary" 
                    onClick={handleVerifyCode} 
                    size="large" 
                    block 
                    loading={loading}
                    style={{ backgroundColor: ACCENT_COLOR, borderColor: ACCENT_COLOR, fontWeight: 700 }}
                    className="hover:!bg-pink-600 hover:!border-pink-600 transition duration-300"
                  >
                    Xác minh mã
                  </Button>
                </Form.Item>
              </>
            ) : (
              <>
                <Form.Item
                  name="newPassword"
                  rules={[
                    { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                    { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                  ]}
                  className="ant-form-item-dark"
                >
                  <Input.Password
                    size="large"
                    placeholder="Mật khẩu mới"
                    prefix={<LockOutlined style={{ color: ACCENT_COLOR }} />}
                    className="custom-input-dark"
                  />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  rules={[
                    { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('newPassword') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                      },
                    }),
                  ]}
                  className="ant-form-item-dark"
                >
                  <Input.Password
                    size="large"
                    placeholder="Xác nhận mật khẩu"
                    prefix={<LockOutlined style={{ color: ACCENT_COLOR }} />}
                    className="custom-input-dark"
                  />
                </Form.Item>

                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    size="large" 
                    block 
                    loading={loading}
                    style={{ backgroundColor: ACCENT_COLOR, borderColor: ACCENT_COLOR, fontWeight: 700 }}
                    className="hover:!bg-pink-600 hover:!border-pink-600 transition duration-300"
                  >
                    Đặt lại mật khẩu
                  </Button>
                </Form.Item>
              </>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-start', fontSize: '13px', color: '#9ca3af' }}>
              <Link to="/login" style={{ color: ACCENT_COLOR, fontWeight: 500 }} className="hover:underline">Quay lại đăng nhập</Link>
            </div>
          </Form>
        </div>
      </div>
       {/* Custom Styles for Antd Dark Mode - Copied from Login.tsx */}
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

            /* Antd addon button styling */
            .ant-input-group-addon {
                padding: 0; /* Remove default padding */
                background-color: transparent !important; /* Ensure the button background handles color */
                border: none !important; /* Remove border from addon */
            }

            .ant-input-group > .ant-input-group-addon button {
                height: 100%;
                border-top-left-radius: 0;
                border-bottom-left-radius: 0;
                /* Match text color */
                color: ${ACCENT_COLOR} !important;
                background-color: ${CARD_BG} !important;
                border-color: #4b5563 !important;
            }

            .ant-input-group > .ant-input-group-addon button:hover {
                 background-color: #374151 !important;
            }
        `}</style>
    </div>
  );
};

export default ForgotPassword;