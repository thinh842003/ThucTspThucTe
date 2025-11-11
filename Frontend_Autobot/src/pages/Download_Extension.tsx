import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRobot,
  faBolt,
  faLock,
  faToolbox,
  faArrowTrendUp,
  faEnvelope,
  faScrewdriverWrench,
  faDownload,
  faListOl,
  faEdit,
} from "@fortawesome/free-solid-svg-icons";
import { Modal, Button, Upload, message, Spin } from 'antd';
import { contentService, Content, ContentUpdateDTO } from '../services/contentService';
import { authService } from '../services/authService';
import type { UploadFile } from 'antd/es/upload/interface';

function ExtensionPage() {
  const [bgContent, setBgContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5131';

  useEffect(() => {
    const user = authService.getCurrentUser();
    setIsAdmin(user?.roles?.includes('Admin') || false);
    fetchBgContent();
  }, []);

  const fetchBgContent = async () => {
    setLoading(true);
    try {
      const data = await contentService.getContentsByPage('extension');
      setBgContent(data && data.length > 0 ? data[0] : null);
      if (data && data[0] && data[0].url) {
        setFileList([{
          uid: '-1',
          name: 'current-image',
          status: 'done',
          url: `${API_URL}/assets/images/${data[0].url}`,
        }]);
      } else {
        setFileList([]);
      }
    } catch (error) {
      message.error('Không thể tải background extension');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    if (!bgContent) {
      message.error('Không tìm thấy Content ID để cập nhật.');
      return;
    }
    
    const newFile = fileList.find(f => f.originFileObj);

    if (fileList.length === 0 || !newFile) {
        message.error('Vui lòng chọn ảnh mới!');
        return;
    }

    setIsUploading(true);
    try {
      const updateDto: ContentUpdateDTO = {
        title: bgContent.title,
        content: bgContent.content,
        page: bgContent.page,
        ImageFile: newFile.originFileObj,
      };
      await contentService.updateContent(bgContent.id.toString(), updateDto);
      message.success('Cập nhật background thành công!');
      setIsModalVisible(false);
      fetchBgContent();
    } catch (error) {
      message.error('Không thể cập nhật background!');
    } finally {
      setIsUploading(false);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    if (bgContent && bgContent.url) {
      setFileList([{
        uid: '-1',
        name: 'current-image',
        status: 'done',
        url: `${API_URL}/assets/images/${bgContent.url}`,
      }]);
    } else {
      setFileList([]);
    }
  };

  let bgUrl = '';
  if (loading) {
      // Khi đang tải, sử dụng fallback hoặc màu nền tối
  } else if (bgContent && bgContent.url) {
      bgUrl = `${API_URL}/assets/images/${bgContent.url}`;
  } else {
      bgUrl = '/src/assets/extension_bg.jpg';
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen bg-cover bg-fixed bg-center bg-no-repeat text-white font-sans"
      style={{ backgroundImage: `url('${bgUrl}')` }}
    >
      {/* Overlay gradient và màu tối */}
      <div className="absolute inset-0 bg-gray-900 bg-opacity-70 backdrop-blur-sm"></div>

      {isAdmin && (
        <Button
          type="primary"
          className="absolute top-4 right-4 z-30 bg-blue-500 hover:bg-blue-600 border-none rounded-lg shadow-lg font-semibold"
          icon={<FontAwesomeIcon icon={faEdit} />}
          onClick={handleEdit}
        >
          Sửa background
        </Button>
      )}

      {/* Modal chỉnh sửa */}
      <Modal
        title="Chỉnh sửa background Extension"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText={isUploading ? "Đang tải..." : "Lưu"}
        cancelText="Hủy"
        confirmLoading={isUploading}
        width={400}
      >
        <Upload
          listType="picture-card"
          maxCount={1}
          fileList={fileList}
          beforeUpload={(file) => {
            const isLt5M = file.size / 1024 / 1024 < 5;
            if (!isLt5M) {
              message.error('Ảnh phải nhỏ hơn 5MB!');
              return false;
            }
            const isImage = file.type.startsWith('image/');
            if (!isImage) {
              message.error('Chỉ được upload file ảnh!');
              return false;
            }
            // Thay thế file cũ bằng file mới
            setFileList([{
              uid: file.uid,
              name: file.name,
              status: 'done',
              originFileObj: file, // Lưu file object gốc để upload
              url: URL.createObjectURL(file),
            }]);
            return false;
          }}
          // Logic này xử lý khi người dùng xóa file đã chọn
          onRemove={(file) => {
            if (file.uid !== '-1') {
                setFileList([]);
            } else {
                setFileList([]); // Cho phép xóa ảnh hiện tại để chọn ảnh mới
            }
            return true;
          }}
          onChange={({ fileList: newFileList }) => {
            // Giữ lại chỉ file có originFileObj (file mới được chọn)
            const filteredList = newFileList.filter(f => f.originFileObj || f.uid === '-1');
            setFileList(filteredList);
          }}
        >
          {fileList.length >= 1 ? null : (
            <div>
              <FontAwesomeIcon icon={faDownload} />
              <div style={{ marginTop: 8 }}>Upload</div>
            </div>
          )}
        </Upload>
      </Modal>

      {/* Nội dung chính */}
      <div className="relative z-20 flex flex-col items-center justify-start py-12 px-4 md:py-20">
        
        {/* Phần mô tả tiêu đề (Chủ đạo) */}
        <div className="text-center mb-12 bg-gray-800 bg-opacity-70 p-8 rounded-2xl shadow-2xl backdrop-blur-sm border-2 border-cyan-500 max-w-4xl animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 uppercase tracking-wider">
            <FontAwesomeIcon icon={faRobot} className="mr-3 text-cyan-400 animate-pulse-slow" />
            Giao dịch chứng khoán cùng <span className="text-cyan-400 border-b-4 border-blue-600 pb-1">Autobot</span>
          </h1>
          <p className="text-gray-200 text-lg max-w-2xl mx-auto leading-relaxed">
            Extension Chrome hỗ trợ giao dịch tự động trên nền tảng VPS và các công ty chứng khoán. Tự động đặt lệnh, chốt lời, cắt lỗ theo tín hiệu từ hệ thống. Hiện tại, chúng tôi cung cấp phiên bản cho **Smart Pro/Smart Easy (VPS)** và **Entrade X**. Tích hợp trực tiếp vào giao diện giao dịch, giúp nhà đầu tư **tiết kiệm thời gian** và **tối ưu hóa chiến lược** giao dịch.
          </p>
          {/* KHỐI DOWNLOAD MỚI */}
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6 mt-8">
            <a href={`${API_URL}/ext.rar`} download="Autobot_Extension_VPS.rar">
              <button className="px-8 py-3 text-lg bg-cyan-600 hover:bg-cyan-700 transition duration-300 rounded-full text-white font-bold shadow-xl transform hover:scale-105 w-full" >
                <FontAwesomeIcon icon={faDownload} className="mr-3" />
                Tải Ext (VPS/Smart Pro)
              </button>
            </a>
            <a href={`${API_URL}/ext_entrade.rar`} download="Entrade_Extension.rar">
              <button className="px-8 py-3 text-lg bg-blue-600 hover:bg-blue-700 transition duration-300 rounded-full text-white font-bold shadow-xl transform hover:scale-105 w-full" >
                <FontAwesomeIcon icon={faDownload} className="mr-3" />
                Tải Ext (Entrade X)
              </button>
            </a>
          </div>
        </div>

        {/* Grid Tính năng & Hướng dẫn */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-6xl">
            
          {/* Phần tính năng */}
          <div className="bg-gray-800 bg-opacity-90 p-8 rounded-2xl shadow-xl border border-gray-700 transition-all duration-500 hover:shadow-cyan-500/50 hover:border-cyan-500">
            <h2 className="text-3xl font-bold mb-6 text-cyan-400 flex items-center">
              <FontAwesomeIcon icon={faToolbox} className="mr-3" />
              Tính năng nổi bật
            </h2>
            <ul className="list-none space-y-4 text-gray-200 text-lg">
              <li className="flex items-start">
                <FontAwesomeIcon icon={faArrowTrendUp} className="mt-1 mr-3 text-green-400 w-5 flex-shrink-0" />
                <span>Nhận tín hiệu **mua bán tự động** theo chiến lược cá nhân hoá.</span>
              </li>
              <li className="flex items-start">
                <FontAwesomeIcon icon={faScrewdriverWrench} className="mt-1 mr-3 text-yellow-400 w-5 flex-shrink-0" />
                <span>Tuỳ chỉnh thuật toán giao dịch, phù hợp với mọi phong cách.</span>
              </li>
              <li className="flex items-start">
                <FontAwesomeIcon icon={faLock} className="mt-1 mr-3 text-red-400 w-5 flex-shrink-0" />
                <span>**Bảo mật tuyệt đối**, không lưu trữ thông tin đăng nhập cá nhân.</span>
              </li>
              <li className="flex items-start">
                <FontAwesomeIcon icon={faEnvelope} className="mt-1 mr-3 text-blue-400 w-5 flex-shrink-0" />
                <span>Nhận thông báo qua Telegram **realtime** về mọi giao dịch.</span>
              </li>
              <li className="flex items-start">
                <FontAwesomeIcon icon={faBolt} className="mt-1 mr-3 text-yellow-300 w-5 flex-shrink-0" />
                <span>Tốc độ thực thi cực nhanh, phản ứng **trong tích tắc**.</span>
              </li>
            </ul>
          </div>

          {/* Phần hướng dẫn */}
          <div className="bg-gray-800 bg-opacity-90 p-8 rounded-2xl shadow-xl border border-gray-700 transition-all duration-500 hover:shadow-blue-500/50 hover:border-blue-500">
            <h2 className="text-3xl font-bold mb-6 text-blue-400 flex items-center">
              <FontAwesomeIcon icon={faListOl} className="mr-3" />
              Hướng dẫn cài đặt
            </h2>
            <ol className="list-decimal list-inside space-y-4 text-gray-200 text-lg pl-5">
              <li>Tải file nén extension về máy (chọn phiên bản phù hợp).</li>
              <li>Giải nén file, bạn sẽ nhận được một thư mục **ext**.</li>
              <li>Mở trình duyệt Chrome, truy cập: <code className="bg-gray-700 p-1 rounded">chrome://extensions/</code></li>
              <li>Bật **"Chế độ nhà phát triển"** (Developer Mode) ở góc trên bên phải.</li>
              <li>Bấm **"Tải tiện ích đã giải nén"** (Load unpacked) và chọn thư mục **ext** vừa giải nén.</li>
              <li>Đăng nhập vào nền tảng giao dịch tương ứng để kích hoạt extension hoạt động.</li>
            </ol>
          </div>
        </div>
      </div>
      
      {/* Footer/Contact Placeholder */}
      <div className="text-center py-6 text-gray-400 text-sm border-t border-gray-700 mt-12 relative z-20">
        <p>Hỗ trợ kỹ thuật: liên hệ qua email hoặc Telegram. | &copy; 2025 Autobot Trading.</p>
      </div>
      
      {/* KHỐI LỖI ĐÃ ĐƯỢC THAY THẾ BẰNG THẺ <style> CHUẨN */}
      <style>{`
        /* Keyframe cho hiệu ứng nhẹ */
        @keyframes pulse-slow {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.9;
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s infinite ease-in-out;
        }
        /* Keyframe cho fade in */
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 1s ease-out;
        }
      `}</style>
    </div>
  );
}

export default ExtensionPage;