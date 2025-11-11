import iconBot2 from "/src/assets/iconbothi.jpg";
import piclerf from "/src/assets/1000_F_1369373417_m2Oa554rcYSDHPXowqTv2XnqbdfWhnJY.jpg";
import { LockOutlined, UserOutlined, MailOutlined, PhoneOutlined, SafetyOutlined } from '@ant-design/icons';
import { Button, Form, Input } from 'antd';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useMessage } from '../App';

// MÀU SẮC CHỦ ĐẠO TỪ HOME.TSX VÀ LOGIN.TSX
const ACCENT_COLOR = '#ec4899'; // pink-500
const BACKGROUND_COLOR = '#0f172a'; // slate-900 (Nền tối)
const CARD_BG = '#1e293b'; // slate-800 (Nền khối login)

const Register: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const antMessage = useMessage();

  const [showVerificationField, setShowVerificationField] = useState(false);
  const [emailToVerify, setEmailToVerify] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [initialRegisterValues, setInitialRegisterValues] = useState<any>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onFinish = async (values: any) => {
    if (!showVerificationField) {
      // BƯỚC 1: Gửi mã xác nhận qua email
      setIsSubmitting(true);
      setInitialRegisterValues(values);

      try {
        await authService.sendRegisterCode(values.email);
        setEmailToVerify(values.email);
        setShowVerificationField(true);
        if (antMessage) {
          antMessage.success(`Mã xác nhận đã được gửi đến ${values.email}. Vui lòng kiểm tra email của bạn.`);
        }
      } catch (error: any) {
        console.error('Error sending verification code:', error);
        if (antMessage) {
          const errorMessage = error.message || 'Gửi mã xác nhận thất bại.';
          const lowerCaseError = errorMessage.toLowerCase();

          if (lowerCaseError.includes('duplicate email') || lowerCaseError.includes('already taken') || lowerCaseError.includes('đã tồn tại')) {
            antMessage.error(errorMessage + '. Vui lòng kiểm tra lại thông tin.');
          } else {
            antMessage.error(errorMessage);
          }
        }
      } finally {
        setIsSubmitting(false);
      }

    } else {
      // BƯỚC 2: Xác nhận mã và hoàn tất đăng ký
      setIsSubmitting(true);
      try {
        const registrationData = {
          ...initialRegisterValues,
          token: values.verificationCode
        };
        
        await authService.register(
          registrationData.fullName,
          registrationData.email,
          registrationData.phone,
          registrationData.password,
          registrationData.token
        );

        if (antMessage) {
          antMessage.success('Đăng ký thành công! Vui lòng đăng nhập.');
        }
        navigate('/login');

      } catch (error: any) {
        console.error('Error verifying code or finalizing registration:', error);
        if (antMessage) {
          const errorMessage = error.message || 'Xác nhận mã thất bại.';
          const lowerCaseError = errorMessage.toLowerCase();

          if (lowerCaseError.includes('duplicate email') || lowerCaseError.includes('already taken') || lowerCaseError.includes('đã tồn tại')) {
            antMessage.error(errorMessage + '. Vui lòng kiểm tra lại thông tin và thử lại.');
            // Quay lại bước 1
            setShowVerificationField(false);
            // Giữ lại các trường khác trừ mã xác nhận
            form.setFieldsValue({
                verificationCode: undefined, // Xóa trường mã xác nhận
            });
            setInitialRegisterValues(null);
          } else {
            antMessage.error(errorMessage);
            // Xóa mã xác nhận để người dùng nhập lại
            form.setFieldsValue({ verificationCode: undefined });
          }
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleSendCode = async () => {
    // Lấy giá trị email hiện tại trong form
    const currentEmail = form.getFieldValue('email');

    if (!currentEmail) {
        // Kiểm tra nếu người dùng cố gửi lại mã mà không điền email ở bước 1
        if (antMessage) {
            antMessage.warning('Vui lòng điền thông tin và nhấn "Đăng ký" trước để gửi mã lần đầu.');
        }
        return;
    }

    setIsSendingCode(true);
    try {
      await authService.sendRegisterCode(currentEmail);
      if (antMessage) {
        antMessage.success(`Mã xác nhận đã được gửi lại đến ${currentEmail}.`);
      }
    } catch (error: any) {
      console.error('Error resending verification code:', error);
      if (antMessage) {
        antMessage.error(error.message || 'Gửi lại mã xác nhận thất bại.');
      }
    } finally {
      setIsSendingCode(false);
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

      {/* KHỐI REGISTER CHÍNH */}
      <div
        className="w-full sm:w-[900px] h-auto sm:h-[650px] flex rounded-2xl overflow-hidden shadow-2xl max-w-full flex-col sm:flex-row relative z-10 border border-gray-700/50"
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
          className="flex-1 flex flex-col justify-center px-6 py-8 sm:px-[60px] sm:py-[50px] text-white overflow-y-auto"
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

          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600, color: 'white' }}>Đăng ký</h2>
          <p style={{ fontSize: '14px', marginBottom: '20px', color: '#9ca3af' }}>
            {showVerificationField ? `Bước 2: Mã xác nhận đã gửi đến ${emailToVerify}` : 'Bước 1: Tạo tài khoản mới tại Tradingbot'}
          </p>

          <Form 
            form={form} 
            layout="vertical" 
            onFinish={onFinish}
            className="space-y-4"
            // Giá trị ban đầu cho các trường ở bước 1 (nếu có)
            initialValues={initialRegisterValues} 
          >
            {/* CÁC TRƯỜNG ĐĂNG KÝ (HIỆN KHI CHƯA XÁC MINH) */}
            {!showVerificationField && (
              <>
                <Form.Item
                  name="fullName"
                  rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                  className="ant-form-item-dark"
                >
                  <Input
                    size="large"
                    placeholder="Họ và tên"
                    prefix={<UserOutlined style={{ color: ACCENT_COLOR }} />}
                    className="custom-input-dark"
                  />
                </Form.Item>

                <div className='flex gap-4'>
                  <Form.Item
                    name="email"
                    rules={[
                      { required: true, message: 'Vui lòng nhập email!' },
                      { type: 'email', message: 'Email không hợp lệ!' }
                    ]}
                    className="ant-form-item-dark w-1/2"
                  >
                    <Input
                      size="large"
                      placeholder="Email"
                      prefix={<MailOutlined style={{ color: ACCENT_COLOR }} />}
                      className="custom-input-dark"
                      disabled={showVerificationField} // Khóa trường khi ở bước xác thực
                    />
                  </Form.Item>

                  <Form.Item
                    name="phone"
                    rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                    className="ant-form-item-dark w-1/2"
                  >
                    <Input
                      size="large"
                      placeholder="Số điện thoại"
                      prefix={<PhoneOutlined style={{ color: ACCENT_COLOR }} />}
                      className="custom-input-dark"
                      disabled={showVerificationField} // Khóa trường khi ở bước xác thực
                    />
                  </Form.Item>
                </div>

                <div className='flex gap-4'>
                  <Form.Item
                    name="password"
                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                    className="ant-form-item-dark w-1/2"
                  >
                    <Input.Password
                      size="large"
                      placeholder="Mật khẩu"
                      prefix={<LockOutlined style={{ color: ACCENT_COLOR }} />}
                      className="custom-input-dark"
                      disabled={showVerificationField} // Khóa trường khi ở bước xác thực
                    />
                  </Form.Item>

                  <Form.Item
                    name="confirmPassword"
                    dependencies={['password']}
                    rules={[
                      { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('password') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('Mật khẩu không khớp!'));
                        },
                      }),
                    ]}
                    className="ant-form-item-dark w-1/2"
                  >
                    <Input.Password
                      size="large"
                      placeholder="Xác nhận mật khẩu"
                      prefix={<LockOutlined style={{ color: ACCENT_COLOR }} />}
                      className="custom-input-dark"
                      disabled={showVerificationField} // Khóa trường khi ở bước xác thực
                    />
                  </Form.Item>
                </div>
              </>
            )}

            {/* TRƯỜNG XÁC MINH (HIỆN KHI ĐÃ GỬI MÃ) */}
            {showVerificationField && (
              <Form.Item
                name="verificationCode"
                rules={[{ required: true, message: 'Vui lòng nhập mã xác nhận!' }]}
                className="ant-form-item-dark"
              >
                <Input
                  size="large"
                  placeholder="Mã xác nhận 6 chữ số"
                  prefix={<SafetyOutlined style={{ color: ACCENT_COLOR }} />}
                  className="custom-input-dark"
                  addonAfter={
                    <Button 
                        type="primary" 
                        onClick={handleSendCode} 
                        loading={isSendingCode}
                        style={{ backgroundColor: ACCENT_COLOR, borderColor: ACCENT_COLOR }}
                        className="hover:!bg-pink-600 hover:!border-pink-600 transition duration-300"
                    >
                        Gửi lại mã
                    </Button>
                  }
                />
              </Form.Item>
            )}

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
                {showVerificationField ? 'Xác nhận đăng ký' : 'Đăng ký'}
              </Button>
            </Form.Item>

            {/* CHUYỂN HƯỚNG ĐĂNG NHẬP */}
            <div style={{ display: 'flex', justifyContent: 'center', fontSize: '13px', color: '#9ca3af' }}>
              <span>
                Đã có tài khoản?{' '}
                <Link to="/login" style={{ color: ACCENT_COLOR, fontWeight: 500 }} className="hover:underline">Đăng nhập</Link>
              </span>
            </div>
            
          </Form>
        </div>
      </div>

       {/* Custom Styles for Antd Dark Mode */}
       <style>{`
            /* Custom dark input styles - Đồng bộ với Login.tsx */
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

            /* Custom button in AddonAfter */
            .ant-input-group-addon button {
                height: 40px !important; /* Adjust height to match input size="large" */
                border-radius: 0 6px 6px 0 !important;
            }

            /* Override antd form item margin-bottom */
            .ant-form-item {
                margin-bottom: 20px !important; 
            }

            /* Resetting default form item layout if needed */
            .ant-form-item-dark .ant-form-item-label > label {
                color: #9ca3af !important; /* Label color in dark mode */
            }
        `}</style>
    </div>
  );
};

export default Register;