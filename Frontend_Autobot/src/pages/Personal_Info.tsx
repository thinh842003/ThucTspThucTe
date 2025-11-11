import React, { useState, useEffect, useCallback, useMemo } from "react";
import iconBot from "/src/assets/iconbot.png";
import { Select, DatePicker, Skeleton, Button, Tooltip } from "antd";
import { UserOutlined, HomeOutlined, QuestionCircleOutlined, SyncOutlined, SettingOutlined } from "@ant-design/icons"; // Import các Icon Antd thay thế cho Feather/Lucide
import { Link } from "react-router-dom";
import { authService } from "../services/authService";
import { api } from "../services/api";
import moment from "moment";
import UnifiedTable from "../components/UnifiedTable";

const { Option } = Select;

// MÀU SẮC CHỦ ĐẠO
const ACCENT_COLOR = '#ec4899'; // pink-500 (Màu điểm nhấn Neon)
const PRIMARY_CARD_BG = '#1e293b'; // slate-800 (Màu nền các Card lớn)
const BACKGROUND_COLOR = '#0f172a'; // slate-900 (Màu nền trang)

function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
  let timeout: NodeJS.Timeout | null = null;
  const debounced = (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
  debounced.cancel = () => timeout && clearTimeout(timeout);
  return debounced as T & { cancel: () => void };
}

interface UserInfo {
  userId: string;
  name?: string;
  phoneNumber?: string;
  email: string;
}

interface ProfitLoss {
  date: string;
  price: number;
}

interface Service {
  date: string;
  priceBot: number;
  startDate: string;
  endDate: string;
  status: "PAID" | "UNPAID";
}

const PersonalInfomation: React.FC = () => {
  const [profitFilterType, setProfitFilterType] = useState("all");
  const [profitDate, setProfitDate] = useState<moment.Moment | null>(null);
  const [serviceFilterType, setServiceFilterType] = useState("all");
  const [serviceDate, setServiceDate] = useState<moment.Moment | null>(null);
  const [profitList, setProfitList] = useState<ProfitLoss[]>([]);
  const [totalProfit, setTotalProfit] = useState(0);
  const [serviceList, setServiceList] = useState<Service[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState({ user: true, profit: false, service: false });
  const [error, setError] = useState({ user: null, profit: null, service: null } as {
    user: string | null;
    profit: string | null;
    service: string | null;
  });

  const profitColumns = useMemo(
    () => [
      {
        title: <Tooltip title="Ngày thực hiện giao dịch lợi nhuận">Ngày giao dịch</Tooltip>,
        dataIndex: "date",
        key: "date",
        render: (date: string) => moment(date).format("DD/MM/YYYY HH:mm:ss"),
      },
      {
        title: <Tooltip title="Số tiền lợi nhuận">Giá</Tooltip>,
        dataIndex: "price",
        key: "price",
        render: (price: number) => <span className="text-green-400 font-bold">{`${price.toLocaleString("vi-VN")} VND`}</span>,
      },
    ],
    []
  );

  const serviceColumns = useMemo(
    () => [
      {
        title: <Tooltip title="Ngày thanh toán gói dịch vụ">Ngày thanh toán</Tooltip>,
        dataIndex: "date",
        key: "date",
        render: (date: string) => moment(date).format("DD/MM/YYYY"),
      },
      {
        title: <Tooltip title="Giá của gói dịch vụ">Giá</Tooltip>,
        dataIndex: "priceBot",
        key: "priceBot",
        render: (price: number) => `${price.toLocaleString("vi-VN")} VND`,
      },
      {
        title: <Tooltip title="Ngày bắt đầu hiệu lực gói">Ngày bắt đầu</Tooltip>,
        dataIndex: "startDate",
        key: "startDate",
        render: (date: string) => moment(date).format("DD/MM/YYYY"),
      },
      {
        title: <Tooltip title="Ngày hết hạn gói">Ngày kết thúc</Tooltip>,
        dataIndex: "endDate",
        key: "endDate",
        render: (date: string) => moment(date).format("DD/MM/YYYY"),
      },
      {
        title: <Tooltip title="Trạng thái thanh toán của gói">Trạng thái thanh toán</Tooltip>,
        dataIndex: "status",
        key: "status",
        render: (status: "PAID" | "UNPAID") => (
          <Tooltip title={status === "PAID" ? "Gói đã được thanh toán" : "Chưa thanh toán gói"}>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${status === "PAID" ? "bg-green-600" : "bg-orange-500"
                } text-white`}
            >
              {status === "PAID" ? "Đã Thanh Toán" : "Chưa Thanh Toán"}
            </span>
          </Tooltip>
        ),
      },
      {
        title: <Tooltip title="Trạng thái hiệu lực của gói">Trạng thái gói</Tooltip>,
        dataIndex: "endDate",
        key: "statusPackage",
        render: (endDate: string) => (
          <Tooltip title={moment().isBefore(endDate) ? "Gói còn hiệu lực" : "Gói đã hết hạn"}>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${moment().isBefore(endDate) ? "bg-cyan-600" : "bg-red-500"
                } text-white`}
            >
              {moment().isBefore(endDate) ? "Hoạt Động" : "Hết Hạn"}
            </span>
          </Tooltip>
        ),
      },
    ],
    []
  );

  const fetchData = useCallback(
    async <T,>(url: string, params: any, setData: (data: T) => void, errorKey: keyof typeof error, loadingKey: keyof typeof loading) => {
      try {
        setLoading((prev) => ({ ...prev, [loadingKey]: true }));
        setError((prev) => ({ ...prev, [errorKey]: null }));
        const res = await api.get(url, { headers: { Authorization: `Bearer ${authService.getAccessToken()}` }, params });
        setData(res.data);
      } catch (err: any) {
        console.error(`Error fetching ${errorKey}: `, { url, params, error: err?.response?.data || err.message });
        setError((prev) => ({ ...prev, [errorKey]: "Không thể tải dữ liệu. Vui lòng thử lại." }));
      } finally {
        setLoading((prev) => ({ ...prev, [loadingKey]: false }));
      }
    },
    []
  );

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setLoading((prev) => ({ ...prev, user: true }));
        const currentUser = authService.getCurrentUser();
        if (!currentUser) throw new Error("No user logged in");
        setUserInfo(currentUser);
        setError((prev) => ({ ...prev, user: null }));
      } catch (error: any) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
        setError((prev) => ({ ...prev, user: "Không thể tải thông tin người dùng." }));
      } finally {
        setLoading((prev) => ({ ...prev, user: false }));
      }
    };
    fetchUserInfo();
  }, []);

  const fetchProfitData = useCallback(() => {
    if (!userInfo) return;
    const params: any = { user: userInfo.userId };
    let url = "/api/profitLoss/GetProfitLossAll";
    if (profitFilterType === "year" && profitDate) {
      url = "/api/profitLoss/GetProfitLossYear";
      params.year = profitDate.year();
    } else if (profitFilterType === "month" && profitDate) {
      url = "/api/profitLoss/GetProfitLossMoth";
      params.month = profitDate.month() + 1;
      params.year = profitDate.year();
    } else if (profitFilterType === "day" && profitDate) {
      url = "/api/profitLoss/GetProfitLossDay";
      params.day = profitDate.date();
      params.month = profitDate.month() + 1;
      params.year = profitDate.year();
    }
    fetchData(url, params, (data: { profitLossDTOList: ProfitLoss[]; total: number }) => {
      setProfitList(Array.isArray(data.profitLossDTOList) ? data.profitLossDTOList : []);
      setTotalProfit(data.total || 0);
    }, "profit", "profit");
  }, [profitFilterType, profitDate, userInfo, fetchData]);

  const fetchServiceData = useCallback(() => {
    if (!userInfo) return;
    const params: any = { userId: userInfo.userId };
    let url = "/api/purchaseHistory/getPurchaseAllByUser";
    if (serviceFilterType === "year" && serviceDate) {
      url = "/api/purchaseHistory/getPurchaseYearByUser";
      params.year = serviceDate.year();
    } else if (serviceFilterType === "month" && serviceDate) {
      url = "/api/purchaseHistory/getPurchaseMonthByUser";
      params.month = serviceDate.month() + 1;
      params.year = serviceDate.year();
    }
    fetchData(url, params, (data: { purchases: Service[] }) => {
      setServiceList(Array.isArray(data.purchases) ? data.purchases : []);
    }, "service", "service");
  }, [serviceFilterType, serviceDate, userInfo, fetchData]);

  const debouncedFetchProfitData = useMemo(() => debounce(fetchProfitData, 500), [fetchProfitData]);
  const debouncedFetchServiceData = useMemo(() => debounce(fetchServiceData, 500), [fetchServiceData]);

  useEffect(() => {
    debouncedFetchProfitData();
    return () => debouncedFetchProfitData.cancel();
  }, [debouncedFetchProfitData]);

  useEffect(() => {
    debouncedFetchServiceData();
    return () => debouncedFetchServiceData.cancel();
  }, [debouncedFetchServiceData]);

  const handleProfitFilterChange = useCallback((value: string) => {
    setProfitFilterType(value);
    setProfitDate(null);
  }, []);

  const handleProfitDateChange = useCallback((date: moment.Moment | null) => setProfitDate(date), []);

  const handleServiceFilterChange = useCallback((value: string) => {
    setServiceFilterType(value);
    setServiceDate(null);
  }, []);

  const handleServiceDateChange = useCallback((date: moment.Moment | null) => setServiceDate(date), []);

  const onRetryProfit = useCallback(() => fetchProfitData(), [fetchProfitData]);
  const onRetryService = useCallback(() => fetchServiceData(), [fetchServiceData]);

  // Hàm renderTable đảm bảo UnifiedTable hiển thị tiêu đề cột ngay cả khi data rỗng
  const renderTable = (type: "profit" | "service", columns: any[], data: any[], total?: number, loading: boolean = false, error: string | null = null, onRetry: () => void = () => { }) => {
    if (loading) {
      return (
        <div className="p-6">
          <Skeleton
            active
            round
            paragraph={{ rows: 6, width: ["60%", "80%", "40%", "70%", "30%", "90%"] }}
            className="animate-pulse"
            // Giữ cho Skeleton có màu nền tương đồng với card
            style={{
              background: PRIMARY_CARD_BG,
              '--antd-wave-shadow-color': ACCENT_COLOR, // Thay đổi màu sóng Antd
              '--antd-skeleton-color': '#374151' // Màu nền các thanh skeleton
            } as React.CSSProperties}
          />
        </div>
      );
    }
    if (error) {
      return (
        <div className="text-center py-4 text-white">
          <p className="text-red-500 mb-2">{error}</p>
          <Button onClick={onRetry}
            type="primary"
            className="rounded-md border border-transparent py-2 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ backgroundColor: ACCENT_COLOR, borderColor: ACCENT_COLOR, color: 'white', transition: 'background-color 0.3s' }}
          >
            <SyncOutlined className="mr-1" /> Thử lại
          </Button>
        </div>
      );
    }
    // LOẠI BỎ primaryColor và accentColor ĐỂ KHẮC PHỤC LỖI TYPESCRIPT
    return <UnifiedTable
      type={type}
      columns={columns}
      data={data}
      total={total}
      loading={loading}
      error={error}
      onRetry={onRetry}
    />;
  };

  return (
    <div
      className="min-h-screen relative"
      style={{ backgroundColor: BACKGROUND_COLOR, fontFamily: "'Roboto', sans-serif" }}
    >
      {/* HIỆU ỨNG BACKGROUND MỜ (tạo cảm giác công nghệ) */}
      <div
        className="absolute top-0 left-0 w-80 h-80 rounded-full opacity-10 blur-3xl"
        style={{ background: '#3b82f6', filter: 'blur(100px)', zIndex: 0 }}
      ></div>

      {/* Navigation */}
      <nav className="shadow-lg relative z-10" style={{ backgroundColor: PRIMARY_CARD_BG, borderBottom: `1px solid ${ACCENT_COLOR}30` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <span
                className="text-2xl font-extrabold uppercase tracking-wider transition-all duration-300"
                style={{
                  color: 'white',
                  fontFamily: 'Saira, sans-serif',
                  // Hiệu ứng phát sáng Neon
                  textShadow: `0 0 3px ${ACCENT_COLOR}AA`
                }}
              >
                <span style={{ color: ACCENT_COLOR }}>HỒ SƠ</span> NGƯỜI DÙNG
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/" className="text-gray-400 hover:text-white transition flex items-center font-medium">
                <HomeOutlined className="mr-2" style={{ color: ACCENT_COLOR }} /> Về Trang Chủ
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div
              className="rounded-xl shadow-2xl overflow-hidden border border-gray-700/50"
              style={{ backgroundColor: PRIMARY_CARD_BG }}
            >
              <div className="p-6 text-center border-b border-gray-700">
                <div
                  className="mx-auto h-24 w-24 rounded-full overflow-hidden border-4 mb-4 shadow-lg"
                  style={{ borderColor: ACCENT_COLOR }}
                >
                  <img src={iconBot} alt="Profile" className="h-full w-full object-cover" />
                </div>
                <h2 className="text-xl font-bold text-white font-montserrat">
                  {userInfo?.name ?? "Không có tên"}
                </h2>
                <p className="text-sm text-gray-400">Thành Viên BOT AI</p>
              </div>
              <div className="p-4">
                <ul className="space-y-2">
                  <li>
                    <a href="#"
                      className="flex items-center px-4 py-3 text-white rounded-xl font-semibold transition-all duration-300"
                      style={{ backgroundColor: `${ACCENT_COLOR}20`, color: ACCENT_COLOR }}
                    >
                      <UserOutlined className="mr-3 text-lg" /> Hồ Sơ & Thống Kê
                    </a>
                  </li>
                  <li>
                    <a href="#" className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700/50 rounded-xl transition-colors">
                      <QuestionCircleOutlined className="mr-3 text-lg" style={{ color: ACCENT_COLOR }} /> Trợ Giúp
                    </a>
                  </li>
                  <li>
                    <Link to="/user-bot-webhook" className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700/50 rounded-xl transition-colors">
                      <SettingOutlined className="mr-3 text-lg" style={{ color: ACCENT_COLOR }} /> Cài đặt Bot
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Main Panel */}
          <div className="md:col-span-3 space-y-8">
            {/* User Info */}
            <div
              className="rounded-xl shadow-2xl overflow-hidden border border-gray-700/50"
              style={{ backgroundColor: PRIMARY_CARD_BG }}
            >
              <div className="p-6 border-b border-gray-700">
                <h3 className="text-xl font-medium text-white font-montserrat" style={{ color: ACCENT_COLOR }}>
                  Thông Tin Tài Khoản
                </h3>
                <p className="mt-1 text-sm text-gray-400">Xem thông tin cơ bản và địa chỉ email của bạn.</p>
              </div>
              <div className="p-6">
                {loading.user ? (
                  <Skeleton
                    active
                    round
                    title={false}
                    paragraph={{ rows: 3, width: ["60%", "40%", "80%"] }}
                    className="animate-pulse"
                    style={{
                      background: PRIMARY_CARD_BG,
                      '--antd-wave-shadow-color': ACCENT_COLOR,
                      '--antd-skeleton-color': '#374151'
                    } as React.CSSProperties}
                  />
                ) : error.user ? (
                  <div className="text-center">
                    <p className="text-red-500 text-sm mb-4">{error.user}</p>
                    <Button
                      type="primary"
                      className="rounded-md border border-transparent py-2 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2"
                      style={{ backgroundColor: ACCENT_COLOR, borderColor: ACCENT_COLOR, color: 'white' }}
                      onClick={() => {
                        setLoading((prev) => ({ ...prev, user: true }));
                        setError((prev) => ({ ...prev, user: null }));
                        const fetchUserInfo = async () => {
                          try {
                            const currentUser = authService.getCurrentUser();
                            if (!currentUser) throw new Error("No user logged in");
                            setUserInfo(currentUser);
                            setError((prev) => ({ ...prev, user: null }));
                          } catch (error: any) {
                            setError((prev) => ({ ...prev, user: "Không thể tải thông tin người dùng." }));
                          } finally {
                            setLoading((prev) => ({ ...prev, user: false }));
                          }
                        };
                        fetchUserInfo();
                      }}
                    >
                      <SyncOutlined className="mr-1" /> Thử lại
                    </Button>
                  </div>
                ) : userInfo ? (
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    {/* Tên */}
                    <div className="sm:col-span-3">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-300">Tên</label>
                      <input
                        type="text"
                        id="name"
                        value={userInfo.name ?? "Không có tên"}
                        readOnly
                        aria-readonly="true"
                        className="mt-1 block w-full rounded-md shadow-sm sm:text-sm text-gray-200 p-2"
                        style={{ backgroundColor: '#374151', border: '1px solid #4b5563' }}
                      />
                    </div>
                    {/* Số điện thoại */}
                    <div className="sm:col-span-3">
                      <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-300">Số điện thoại</label>
                      <input
                        type="text"
                        id="phoneNumber"
                        value={userInfo.phoneNumber ?? "Không có số điện thoại"}
                        readOnly
                        aria-readonly="true"
                        className="mt-1 block w-full rounded-md shadow-sm sm:text-sm text-gray-200 p-2"
                        style={{ backgroundColor: '#374151', border: '1px solid #4b5563' }}
                      />
                    </div>
                    {/* Email */}
                    <div className="sm:col-span-6">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
                      <input
                        type="text"
                        id="email"
                        value={userInfo.email}
                        readOnly
                        aria-readonly="true"
                        className="mt-1 block w-full rounded-md shadow-sm sm:text-sm text-gray-200 p-2"
                        style={{ backgroundColor: '#374151', border: '1px solid #4b5563' }}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-gray-400 text-sm">Không tìm thấy thông tin người dùng</p>
                )}
              </div>
            </div>

            {/* Profit Section */}
            <div
              className="rounded-xl shadow-2xl overflow-hidden border border-gray-700/50"
              style={{ backgroundColor: PRIMARY_CARD_BG }}
            >
              <div className="p-6 border-b border-gray-700">
                <h3 className="text-xl font-medium text-white font-montserrat" style={{ color: ACCENT_COLOR }}>
                  Lợi Nhuận
                </h3>
                <p className="mt-1 text-sm text-gray-400">Theo dõi lợi nhuận chi tiết theo thời gian.</p>
              </div>
              <div className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                  <Select
                    value={profitFilterType}
                    onChange={handleProfitFilterChange}
                    className="w-full sm:w-40 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 custom-select-dark"
                    size="large"
                    aria-label="Chọn loại lọc lợi nhuận"
                    style={{ color: 'white' }}
                  >
                    <Option value="all">Tất cả</Option>
                    <Option value="year">Theo năm</Option>
                    <Option value="month">Theo tháng</Option>
                    <Option value="day">Theo ngày</Option>
                  </Select>
                  {profitFilterType !== "all" && (
                    <DatePicker
                      picker={profitFilterType === "year" ? "year" : profitFilterType === "month" ? "month" : "date"}
                      onChange={handleProfitDateChange}
                      size="large"
                      className="w-full sm:w-auto rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 custom-datepicker-dark"
                      aria-label={`Chọn ${profitFilterType === "year" ? "năm" : profitFilterType === "month" ? "tháng" : "ngày"} để lọc lợi nhuận`}
                    />
                  )}
                </div>
                {renderTable("profit", profitColumns, profitList, totalProfit, loading.profit, error.profit, onRetryProfit)}
              </div>
            </div>

            {/* Service Section */}
            <div
              className="rounded-xl shadow-2xl overflow-hidden border border-gray-700/50"
              style={{ backgroundColor: PRIMARY_CARD_BG }}
            >
              <div className="p-6 border-b border-gray-700">
                <h3 className="text-xl font-medium text-white font-montserrat" style={{ color: ACCENT_COLOR }}>
                  Gói Dịch Vụ
                </h3>
                <p className="mt-1 text-sm text-gray-400">Xem lịch sử thanh toán và trạng thái của các gói dịch vụ bạn đã mua.</p>
              </div>
              <div className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                  <Select
                    value={serviceFilterType}
                    onChange={handleServiceFilterChange}
                    className="w-full sm:w-40 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 custom-select-dark"
                    size="large"
                    aria-label="Chọn loại lọc gói dịch vụ"
                    style={{ color: 'white' }}
                  >
                    <Option value="all">Tất cả</Option>
                    <Option value="year">Theo năm</Option>
                    <Option value="month">Theo tháng</Option>
                  </Select>
                  {serviceFilterType !== "all" && (
                    <DatePicker
                      picker={serviceFilterType === "year" ? "year" : "month"}
                      onChange={handleServiceDateChange}
                      size="large"
                      className="w-full sm:w-auto rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 custom-datepicker-dark"
                      aria-label={`Chọn ${serviceFilterType === "year" ? "năm" : "tháng"} để lọc gói dịch vụ`}
                    />
                  )}
                </div>
                {renderTable("service", serviceColumns, serviceList, undefined, loading.service, error.service, onRetryService)}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Tailwind & Ant Design Custom Dark Styles (Cần thêm vào CSS chung nếu không dùng PostCSS) */}
      <style>{`
        /* Ant Design Select Dark Theme Overrides */
        .custom-select-dark .ant-select-selector,
        .custom-select-dark .ant-select-arrow {
            background-color: #374151 !important; /* slate-700 */
            border-color: #4b5563 !important; /* gray-600 */
            color: white !important;
        }
        .custom-select-dark .ant-select-selection-item {
            color: white !important;
        }

        /* Ant Design DatePicker Dark Theme Overrides */
        .custom-datepicker-dark.ant-picker {
            background-color: #374151 !important; /* slate-700 */
            border-color: #4b5563 !important; /* gray-600 */
        }
        .custom-datepicker-dark .ant-picker-input > input {
            color: white !important;
        }
        .custom-datepicker-dark .ant-picker-suffix {
            color: ${ACCENT_COLOR} !important;
        }

        /* Tăng cường hiệu ứng Neon cho nút */
        .ant-btn-primary {
            box-shadow: 0 0 5px ${ACCENT_COLOR}90;
        }
      `}</style>
    </div>
  );
};

export default PersonalInfomation;