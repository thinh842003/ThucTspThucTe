import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import { Button, message, Modal, Form, Input, Popconfirm } from 'antd';
// ĐÃ SỬA: Thay thế Zap và TrendingUpOutlined bằng các icon có sẵn
import { EditOutlined, DeleteOutlined, PlusOutlined, RocketOutlined, DollarCircleOutlined, SettingOutlined, CheckCircleOutlined, LineChartOutlined, ThunderboltOutlined, ApiOutlined } from '@ant-design/icons'; 
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// Import assets
import info6 from "/src/assets/info6.png";
import info1 from "/src/assets/info1.png";
import info2 from "/src/assets/info2.png";
import info3 from "/src/assets/info3.png";
import PriceCardsSection from '../components/PriceCardsSection'; // Import component chung
const HOME_ACCENT_COLOR = '#ec4899'; // pink-500/600 (Sử dụng màu hồng làm điểm nhấn)
const HOME_PRIMARY_CARD_BG = '#1e293b'; // slate-800 (Sử dụng màu nền tối của section)

// Import services and types
import { contentService, Content, ContentCreateDTO, ContentUpdateDTO } from '../services/contentService';
import { authService } from '../services/authService'; // Cần import authService để kiểm tra đăng nhập

// Dữ liệu cho Carousel
const carouselImages = [
    info6,
    info1,
    info2,
    info3,
];

// Chiều cao linh hoạt cho Carousel
const carouselHeightClass = "h-[300px] sm:h-[400px] md:h-[500px]";

interface SimpleImageCarouselProps {
    images: string[];
    heightClass?: string;
    autoPlayInterval?: number;
}

/**
 * Component Carousel đơn giản
 */
const SimpleImageCarousel: React.FC<SimpleImageCarouselProps> = ({
    images,
    heightClass = 'h-64',
    autoPlayInterval,
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const goToNext = useCallback(() => {
        setCurrentIndex(prevIndex => {
            const isLastSlide = prevIndex === images.length - 1;
            return isLastSlide ? 0 : prevIndex + 1;
        });
    }, [images.length]);

    useEffect(() => {
        if (autoPlayInterval && autoPlayInterval > 0 && images.length > 1) {
            const timer = setInterval(() => {
                goToNext();
            }, autoPlayInterval);

            return () => clearInterval(timer);
        }
    }, [currentIndex, autoPlayInterval, images.length, goToNext]);


    if (!images || images.length === 0) {
        return <div className={`w-full ${heightClass} bg-gray-700 flex items-center justify-center text-gray-400 rounded-lg`}>No images to display.</div>;
    }

    return (
        <div className={`relative w-full ${heightClass} rounded-3xl overflow-hidden shadow-2xl`}>
            {/* Thêm hiệu ứng fade/opacity cho ảnh */}
            <img
                key={currentIndex} // Dùng key để force re-render, giúp useEffect chạy lại nếu cần
                src={images[currentIndex]}
                alt={`slide-${currentIndex}`}
                className="w-full h-full object-cover object-center transition-opacity duration-1000 ease-in-out opacity-100"
                style={{ minHeight: 120, background: '#e5e7eb' }}
                onError={e => { e.currentTarget.src = '/assets/info1.png'; }}
            />
        </div>
    );
};

//--------------------------------------------------------------------------------------------------


/**
 * Component Thẻ Bước Quy Trình với thiết kế độc đáo hơn
 */
interface ProcessStepCardProps {
    icon: React.ReactNode;
    title: string;
    content: string;
    index: number; // Thêm index để tạo màu sắc độc đáo
}

const colorMap = {
    0: 'text-indigo-600 border-indigo-200',
    1: 'text-pink-600 border-pink-200',
    2: 'text-green-600 border-green-200',
    3: 'text-yellow-600 border-yellow-200',
    4: 'text-blue-600 border-blue-200',
    default: 'text-gray-600 border-gray-200',
};

const ProcessStepCard: React.FC<ProcessStepCardProps> = ({ icon, title, content, index }) => {
    const colorClass = colorMap[index % 5 as keyof typeof colorMap] || colorMap.default;

    return (
        <div className={`relative bg-white p-6 md:p-8 rounded-2xl shadow-xl border-t-4 ${colorClass.replace(/text-|border-/, 'border-')} w-full transform transition-all duration-500 hover:shadow-2xl hover:scale-[1.02]`}>
            <div className="flex items-start space-x-4 md:space-x-5">
                {/* Icon lớn và nổi bật hơn */}
                <div className={`flex-shrink-0 ${colorClass.replace(/border-/, 'bg-')} bg-opacity-10 text-4xl w-12 h-12 flex items-center justify-center rounded-full mt-1 border border-dashed ${colorClass}`}>
                    {icon}
                </div>
                <div className="flex-1">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">{title}</h3>
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed text-justify">{content}</p>
                </div>
            </div>
        </div>
    );
};


//--------------------------------------------------------------------------------------------------

const HomePage: React.FC = () => {
    const navigate = useNavigate(); // Khai báo navigate
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const autoPlayTime = 3000;

    // State for dynamic content
    const [contents, setContents] = useState<Content[]>([]);
    const [contentLoading, setContentLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingContent, setEditingContent] = useState<Content | null>(null);
    const [form] = Form.useForm();
    const [isAdmin, setIsAdmin] = useState(false);

    /**
     * Tải nội dung
     */
    const fetchContents = useCallback(async () => {
        try {
            setContentLoading(true);
            const data = await contentService.getContentsByPage('home');
            // Sắp xếp: ưu tiên id=999 lên đầu, các id còn lại sắp xếp theo id tăng dần
            const sortedData = data.sort((a, b) => {
                if (a.id === 999) return -1;
                if (b.id === 999) return 1;
                return (a.id as number) - (b.id as number);
            });
            setContents(sortedData);
        } catch (error) {
            console.error('Lỗi khi tải nội dung:', error);
            message.error('Không thể tải nội dung trang chủ.');
        } finally {
            setContentLoading(false);
        }
    }, []);

    useEffect(() => {
        const user = authService.getCurrentUser();
        setIsLoggedIn(!!user);
        setIsAdmin(user?.roles?.includes('Admin') || false);
        fetchContents(); // Tải nội dung khi component mount
    }, [fetchContents]);


    //------------------ Admin Content Management Handlers ----------------------

    const handleAddContent = () => {
        setEditingContent(null);
        form.resetFields();
        // Set mặc định cho trường 'page' là 'home'
        form.setFieldsValue({ page: 'home' });
        setIsModalVisible(true);
    };

    const handleEditContent = (content: Content) => {
        setEditingContent(content);
        form.setFieldsValue({
            title: content.title,
            content: content.content,
            page: 'home' // Đảm bảo trường này luôn là 'home'
        });
        setIsModalVisible(true);
    };

    const handleDeleteContent = async (id: string) => {
        try {
            await contentService.deleteContent(id);
            message.success('Xóa nội dung thành công');
            await fetchContents(); // Refetch
        } catch (error) {
            console.error('Error deleting content:', error);
            message.error('Không thể xóa nội dung');
        }
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            const { title, content, page } = values; // page nên luôn là 'home'

            if (editingContent) {
                const updateDto: ContentUpdateDTO = { title, content, page };
                await contentService.updateContent(editingContent.id.toString(), updateDto);
                message.success('Cập nhật nội dung thành công');
            } else {
                const createDto: ContentCreateDTO = { title, content, page };
                await contentService.createContent(createDto);
                message.success('Thêm nội dung thành công');
            }
            setIsModalVisible(false);
            await fetchContents(); // Refetch
        } catch (error) {
            console.error('Error saving content:', error);
            message.error('Không thể lưu nội dung. Vui lòng kiểm tra lại.');
        }
    };

    // Lọc nội dung cho cột trái (giả sử có id đặc biệt, ví dụ 999) và cột phải (các thẻ tính năng)
    const leftColumnContent = contents.find(item => item.id === 999);
    // Lọc và đảm bảo không có item nào có id=999, sau đó sắp xếp theo id
    const rightColumnContents = contents
        .filter(item => item.id !== 999)
        .sort((a, b) => (a.id as number) - (b.id as number));


    // Icon map cho các thẻ tính năng (chỉ là giả định/mặc định)
    const getIconForIndex = (index: number) => {
        const icons = [
            <RocketOutlined />, // Tự động giao dịch
            <DollarCircleOutlined />, // Quản lý vốn
            <LineChartOutlined />, // Hiệu suất/Phân tích
            <ApiOutlined />, // Kết nối/Tích hợp
            <ThunderboltOutlined />, // Tốc độ
            <SettingOutlined />, // Tùy chỉnh
        ];
        return icons[index % icons.length];
    };

    //------------------ JSX Render ----------------------

    return (
        <div className="font-sans min-h-screen bg-white">

            {/* Header/Hero Section - Nổi bật hơn */}
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-20 md:py-32 flex items-center min-h-[75vh] relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('/src/assets/bg-pattern.svg')]"></div> {/* Thêm họa tiết nền */}
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

                        {/* Bên trái: Text và CTA */}
                        <div className="lg:w-1/2 text-center lg:text-left">
                            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold leading-tight mb-4 text-white">
                                Tối Ưu Hóa <span className="text-pink-500">Lợi Nhuận</span> Đầu Tư
                            </h1>
                            <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-xl mx-auto lg:mx-0 font-light">
                                Nền tảng Bot Trading Phái Sinh tự động, hiệu suất cao, giúp bạn giao dịch thông minh và an toàn.
                            </p>
                            {!isLoggedIn && (
                                <div className="flex justify-center lg:justify-start gap-4">
                                    <Link to="/register">
                                        <Button
                                            size="large"
                                            className="bg-pink-600 border-pink-600 hover:bg-pink-700 hover:border-pink-700 text-white font-extrabold py-3 px-8 rounded-full text-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-xl shadow-pink-500/50"
                                        >
                                            Đăng ký ngay
                                        </Button>
                                    </Link>
                                    <Link to="/login">
                                        <Button
                                            size="large"
                                            className="bg-transparent border-2 border-pink-500 text-pink-500 hover:text-white hover:bg-pink-600 hover:border-pink-600 font-bold py-3 px-8 rounded-full text-lg transition duration-300 ease-in-out transform hover:scale-105"
                                        >
                                            Đăng nhập
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Bên phải: Carousel */}
                        <div className="lg:w-1/2 w-full mt-10 lg:mt-0">
                            <div className="p-2 md:p-4 bg-gray-900 border border-gray-700 rounded-3xl shadow-2xl shadow-pink-500/20">
                                <SimpleImageCarousel images={carouselImages} heightClass={carouselHeightClass} autoPlayInterval={autoPlayTime} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            {/* Tính Năng Hệ Thống (Feature Section) */}
            <section className="py-20 lg:py-32 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-center text-4xl md:text-5xl font-extrabold text-gray-900 mb-16 relative">
                        <span className="relative z-10 p-2 bg-gray-50">Tính Năng Hệ Thống</span>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/4 max-w-xl h-2 bg-pink-300 opacity-30 rounded-full"></div>
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">

                        {/* Cột Trái: Giới thiệu chung */}
                        <div className="lg:sticky lg:top-10 lg:h-fit bg-white p-8 rounded-2xl shadow-2xl border-l-4 border-pink-500 transform hover:scale-[1.01] transition-transform duration-300">
                            {contentLoading ? (
                                <p className="text-center text-gray-700 text-lg animate-pulse">Đang tải giới thiệu...</p>
                            ) : leftColumnContent ? (
                                <>
                                    <h3 className="text-left text-3xl sm:text-4xl font-bold text-gray-900 mb-4 border-b-2 border-pink-100 pb-2">
                                        {leftColumnContent.title}
                                    </h3>
                                    <p className="text-left text-gray-700 text-base md:text-lg leading-relaxed text-justify">
                                        {leftColumnContent.content}
                                    </p>
                                    {isAdmin && (
                                        <div className="mt-6 flex justify-end">
                                            <Button
                                                type="primary"
                                                icon={<EditOutlined />}
                                                onClick={() => handleEditContent(leftColumnContent)}
                                                className="bg-pink-500 border-pink-500 hover:bg-pink-600"
                                            >
                                                Chỉnh sửa giới thiệu
                                            </Button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p className="text-center text-gray-700 text-lg">Không tìm thấy nội dung giới thiệu.</p>
                            )}
                        </div>

                        {/* Cột Phải: Các thẻ tính năng */}
                        <div className="w-full relative">
                            <div className="flex justify-between items-center mb-8 border-b-2 border-gray-200 pb-4">
                                <h3 className="text-2xl font-semibold text-gray-800">Các Ưu Điểm Nổi Bật</h3>
                                {isAdmin && (
                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        onClick={handleAddContent}
                                        className="bg-indigo-600 border-indigo-600 hover:bg-indigo-700"
                                    >
                                        Thêm Tính Năng
                                    </Button>
                                )}
                            </div>
                            {contentLoading ? (
                                <p className="text-center text-gray-700 text-lg animate-pulse">Đang tải tính năng...</p>
                            ) : rightColumnContents.length > 0 ? (
                                <div className="space-y-6">
                                    {rightColumnContents.map((step, index) => (
                                        <div key={step.id} className="relative group">
                                            <ProcessStepCard
                                                icon={getIconForIndex(index)}
                                                title={step.title}
                                                content={step.content}
                                                index={index}
                                            />
                                            {/* Admin Controls Overlay */}
                                            {isAdmin && (
                                                <div className="absolute top-2 right-2 flex space-x-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    <Button
                                                        type="default"
                                                        icon={<EditOutlined />}
                                                        onClick={() => handleEditContent(step)}
                                                        size="small"
                                                        className="bg-white shadow-md border-gray-300 hover:border-blue-500 hover:text-blue-500"
                                                        title="Chỉnh sửa"
                                                    />
                                                    <Popconfirm
                                                        title="Bạn có chắc chắn muốn xóa nội dung này?"
                                                        onConfirm={() => handleDeleteContent(step.id.toString())}
                                                        okText="Có"
                                                        cancelText="Không"
                                                    >
                                                        <Button
                                                            type="default"
                                                            danger
                                                            icon={<DeleteOutlined />}
                                                            size="small"
                                                            className="bg-white shadow-md"
                                                            title="Xóa"
                                                        />
                                                    </Popconfirm>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-700 text-lg italic">Chưa có nội dung tính năng nào được thêm.</p>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Bảng giá dịch vụ (Pricing Section) */}
            <section className="bg-gray-900 py-20 lg:py-24 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-5 bg-[url('/src/assets/bg-dots.svg')]"></div> {/* Thêm họa tiết nền */}
                <div className="container mx-auto px-4 relative z-10">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-16 relative">
                        <span className="bg-gray-900 p-2 rounded-lg">Bảng Giá Dịch Vụ</span>
                        <div className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 w-20 h-1 bg-pink-500 rounded-full"></div>
                    </h2>

                    {/* SỬ DỤNG COMPONENT CHUNG */}
                    <PriceCardsSection 
                      homeMode={true}
                      accentColor={HOME_ACCENT_COLOR} 
                      primaryColor={HOME_PRIMARY_CARD_BG} />

                    {/* Thêm một câu kêu gọi hành động nhỏ */}
                    <p className="mt-12 text-gray-300 text-lg font-light">
                        Bắt đầu hành trình đầu tư thông minh của bạn ngay hôm nay! <Link to="/service-rate" className="text-pink-400 hover:text-pink-300 font-semibold underline transition-colors">Xem chi tiết các gói.</Link>
                    </p>
                </div>
            </section>

            {/* Modal Quản lý Nội dung */}
            <Modal
                title={editingContent ? 'Chỉnh sửa Nội Dung' : 'Thêm Nội Dung Mới'}
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={() => {
                    setIsModalVisible(false);
                }}
                width={800}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                >
                    <Form.Item
                        name="title"
                        label="Tiêu đề"
                        rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
                    >
                        <Input placeholder="Tiêu đề nội dung/tính năng" />
                    </Form.Item>
                    <Form.Item
                        name="content"
                        label="Nội dung"
                        rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
                    >
                        <Input.TextArea rows={6} placeholder="Nội dung chi tiết" />
                    </Form.Item>
                    {/* Hidden field for page, always 'home' */}
                    <Form.Item
                        name="page"
                        initialValue="home"
                        hidden
                    >
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>

        </div>
    );
};
export default HomePage;