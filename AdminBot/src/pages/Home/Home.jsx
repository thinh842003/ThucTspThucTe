import { ArrowDownOutlined, MoneyCollectFilled, DollarTwoTone, BarChartOutlined, LineChartOutlined } from '@ant-design/icons'
import { DatePicker, Card, Statistic, Table, Skeleton, Divider } from 'antd'
import locale from 'antd/es/date-picker/locale/vi_VN'
import statisticService from '../../service/statisticService'
import { formatDate, formatVND, getISOString } from '../../service/commonService'
import { useLayoutEffect, useState } from 'react'
import React from 'react' // Thêm import React

const { RangePicker } = DatePicker

// MÀU SẮC CHỦ ĐẠO
const ACCENT_COLOR = '#ec4899'; // pink-500
const BACKGROUND_COLOR = '#0f172a'; // slate-900 (Nền tối)
const CARD_BG = '#1e293b'; // slate-800 (Nền khối chính)

// --- COLUMN DEFINITIONS (GIỮ NGUYÊN LOGIC) ---
const purchaseColumns = [
  {
    title: 'Tên',
    dataIndex: 'userId',
  },
  {
    title: 'Phương thức',
    dataIndex: 'paymentMethod',
  },
  {
    title: 'Ngày mua',
    dataIndex: 'date',
    render: (value) => formatDate(value),
  },
  {
    title: 'Ngày kết thúc',
    dataIndex: 'endDate',
    render: (value) => formatDate(value),
  },
  {
    title: 'Số tiền',
    dataIndex: 'priceBot',
    render: (value) => formatVND(value),
    sorter: (a, b) => a.priceBot - b.priceBot,
  },
]

const expenseColumns = [
  {
    title: 'Loại chi',
    dataIndex: 'name',
    render: (value) => value ?? 'Lương nhân viên',
  },
  {
    title: 'Ngày',
    dataIndex: 'date',
    render: (value, record) => (value ? formatDate(value) : record.month + '/' + record.year),
  },
  {
    title: 'Số tiền',
    dataIndex: 'price',
    render: (value) => formatVND(value),
    sorter: (a, b) => a.price - b.price,
  },
  {
    title: 'Mô tả',
    dataIndex: 'description',
  },
]

const salaryColumns = [
  {
    title: 'Tên nhân viên',
    dataIndex: 'fullName',
  },
  {
    title: 'Tháng',
    dataIndex: 'month',
    sorter: (a, b) => a.month - b.month,
  },
  {
    title: 'Lương',
    dataIndex: 'price',
    render: (value) => formatVND(value),
    sorter: (a, b) => a.price - b.price,
  },
  {
    title: 'Thưởng',
    dataIndex: 'bonus',
    render: (value) => formatVND(value),
    sorter: (a, b) => a.bonus - b.bonus,
  },
  {
    title: 'Tổng lương',
    render: (_, record) => formatVND(record.price + record.bonus),
    sorter: (a, b) => a.bonus - b.bonus, 
  },
  {
    title: 'Mô tả',
    dataIndex: 'description',
  },
]

// --- HOME COMPONENT (ADMIN DASHBOARD) ---
const Home = () => {
  const [expenseData, setExpenseData] = useState([])
  const [salaryData, setSalaryData] = useState([])
  const [purchaseData, setPurchaseData] = useState([])

  const [totalObj, setTotalObj] = useState({})
  const [totalThisMonth, setTotalThisMonth] = useState({})
  const [total, setTotal] = useState(0)

  const [loading, setLoading] = useState(false)
  const [totalLoading, setTotalLoading] = useState(false)

  // LOGIC: Lấy thống kê tháng hiện tại (Giữ nguyên)
  useLayoutEffect(() => {
    const today = new Date()
    const start = getISOString(new Date(today.getFullYear(), today.getMonth(), 1))
    const end = getISOString(new Date(today.getFullYear(), today.getMonth() + 1, 0))

    setTotalLoading(true)
    statisticService
      .getStatistics(start, end)
      .then((res) => {
        setTotalThisMonth({
          expense: res.data.expense.total,
          salary: res.data.salary.total,
          purchaseHistory: res.data.purchaseHistory.total,
        })
      })
      .finally(() => setTotalLoading(false))
  }, [])

  // LOGIC: Lấy thống kê theo RangePicker (Giữ nguyên)
  const handleStatistic = (rangeDate) => {
    if (rangeDate) {
      setLoading(true)
      setExpenseData([])
      setSalaryData([])
      setPurchaseData([])

      const start = getISOString(rangeDate[0].format())
      const end = getISOString(rangeDate[1].format())

      statisticService
        .getStatistics(start, end)
        .then((res) => {
          setExpenseData(res.data.expense.expenseList)
          setSalaryData(res.data.salary.salaryList)
          setPurchaseData(res.data.purchaseHistory.purchases)
          setTotalObj({
            expense: res.data.expense.total,
            salary: res.data.salary.total,
            purchaseHistory: res.data.purchaseHistory.total,
          })
          setTotal(res.data.total) // Giữ nguyên logic lấy total từ backend
        })
        .finally(() => setLoading(false))
    }
  }

  // Tính lợi nhuận ròng tháng hiện tại
  const currentMonthProfit = totalThisMonth.purchaseHistory - (totalThisMonth.expense + totalThisMonth.salary);
  const currentMonthProfitColor = currentMonthProfit > 0 ? '#4ade80' /* green-400 */ : '#ef4444' /* red-500 */;

  return (
    // Áp dụng nền tối cho toàn bộ trang
    <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: BACKGROUND_COLOR }}>
      <div className="space-y-8">
        
        {/* --- PHẦN 1: THỐNG KÊ THÁNG HIỆN TẠI --- */}
        <Divider className="!border-gray-700">
          <span className="text-gray-400 text-lg font-bold flex items-center gap-2">
            <LineChartOutlined /> THỐNG KÊ TỔNG QUAN THÁNG HIỆN TẠI
          </span>
        </Divider>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Doanh thu (Màu chủ đạo Pink) */}
          <Card 
            className="shadow-2xl border-b-4 rounded-xl transition duration-300 hover:scale-[1.02]" 
            bordered={false}
            style={{ backgroundColor: CARD_BG, borderColor: ACCENT_COLOR }}
          >
            <Statistic
              title={<span className="text-gray-300 font-medium text-sm">DOANH THU</span>}
              value={formatVND(totalThisMonth.purchaseHistory)}
              valueStyle={{ color: ACCENT_COLOR, fontWeight: 'bold', fontSize: '1.2rem' }}
              loading={totalLoading}
              prefix={<DollarTwoTone twoToneColor={ACCENT_COLOR} className="text-3xl" />}
            />
          </Card>
          
          {/* Card 2: Chi tiêu (Màu Rose/Đỏ) */}
          <Card 
            className="shadow-2xl border-b-4 rounded-xl transition duration-300 hover:scale-[1.02]" 
            bordered={false}
            style={{ backgroundColor: CARD_BG, borderColor: '#f43f5e' /* rose-500 */ }}
          >
            <Statistic
              title={<span className="text-gray-300 font-medium text-sm">CHI PHÍ KHÁC</span>}
              value={formatVND(totalThisMonth.expense)}
              valueStyle={{ color: '#f43f5e', fontWeight: 'bold', fontSize: '1.2rem' }}
              loading={totalLoading}
              prefix={<ArrowDownOutlined className="text-3xl" style={{ color: '#f43f5e' }} />}
            />
          </Card>
          
          {/* Card 3: Lương nhân viên (Màu Amber/Vàng) */}
          <Card 
            className="shadow-2xl border-b-4 rounded-xl transition duration-300 hover:scale-[1.02]" 
            bordered={false}
            style={{ backgroundColor: CARD_BG, borderColor: '#f59e0b' /* amber-500 */ }}
          >
            <Statistic
              title={<span className="text-gray-300 font-medium text-sm">LƯƠNG/PHỤ CẤP</span>}
              value={formatVND(totalThisMonth.salary)}
              valueStyle={{ color: '#f59e0b', fontWeight: 'bold', fontSize: '1.2rem' }}
              loading={totalLoading}
              prefix={<MoneyCollectFilled className="text-3xl" style={{ color: '#f59e0b' }} />}
            />
          </Card>
          
          {/* Card 4: Lợi nhuận ròng (Màu Dynamic) */}
          <Card 
            className="shadow-2xl border-b-4 rounded-xl transition duration-300 hover:scale-[1.02] transform" 
            bordered={false}
            style={{ backgroundColor: CARD_BG, borderColor: currentMonthProfitColor }}
          >
            <Statistic
              title={<span className="text-white font-extrabold text-sm">LỢI NHUẬN RÒNG</span>}
              valueStyle={{
                color: currentMonthProfitColor,
                fontWeight: 'extrabold',
                fontSize: '1.5rem', // Tăng kích thước
              }}
              value={formatVND(currentMonthProfit)}
              loading={totalLoading}
              prefix={<BarChartOutlined className="text-3xl" style={{ color: currentMonthProfitColor }} />}
            />
          </Card>
        </div>

        {/* --- PHẦN 2: THỐNG KÊ THEO NGÀY --- */}
        <Divider className="!border-gray-700">
          <span className="text-gray-400 text-lg font-bold flex items-center gap-2">
            <BarChartOutlined /> XEM THỐNG KÊ THEO KHOẢNG THỜI GIAN
          </span>
        </Divider>
        
        <Card className="shadow-2xl rounded-xl" style={{ backgroundColor: CARD_BG, border: '1px solid #374151' }}>
          <div className="space-y-6">
            <RangePicker 
                onChange={handleStatistic} 
                className="w-full custom-range-picker-dark" 
                locale={locale} 
                size="large"
                style={{ height: '45px' }}
            />
            {loading && <Skeleton active />}
            
            {/* Tổng lợi nhuận theo Range Picker */}
            {total !== 0 && !loading && (
              <Card 
                bordered={false} 
                className="shadow-md rounded-xl"
                style={{ backgroundColor: '#0f172a', border: `1px solid ${total > 0 ? '#4ade80' : '#ef4444'}` }}
              >
                <Statistic
                  title={<span className="text-gray-400 font-semibold">TỔNG LỢI NHUẬN RÒNG</span>}
                  valueStyle={{
                    color: total > 0 ? '#4ade80' : '#ef4444',
                    fontWeight: 'bold',
                    fontSize: '1.3rem',
                  }}
                  value={formatVND(total)}
                  prefix={<DollarTwoTone twoToneColor={total > 0 ? '#4ade80' : '#ef4444'} />}
                />
              </Card>
            )}

            {/* Bảng Doanh thu */}
            {purchaseData.length > 0 && (
              <div className="overflow-x-auto custom-table-dark">
                <Table
                  title={() => <span className="text-xl font-semibold text-white">DOANH THU</span>}
                  className="shadow-lg"
                  columns={purchaseColumns}
                  dataSource={purchaseData}
                  rowKey={(record) => record.id}
                  pagination={{ pageSize: 5 }}
                  footer={() => (
                    <span className="text-lg font-bold text-white">
                      Tổng cộng: {formatVND(totalObj.purchaseHistory)}
                    </span>
                  )}
                />
              </div>
            )}
            
            {/* Bảng Chi tiêu */}
            {expenseData.length > 0 && (
              <div className="overflow-x-auto custom-table-dark">
                <Table
                  title={() => <span className="text-xl font-semibold text-white">CHI PHÍ KHÁC</span>}
                  className="shadow-lg"
                  columns={expenseColumns}
                  dataSource={expenseData}
                  rowKey={(record) => record.id}
                  pagination={{ pageSize: 5 }}
                  footer={() => (
                    <span className="text-lg font-bold text-white">
                      Tổng cộng: {formatVND(totalObj.expense)}
                    </span>
                  )}
                />
              </div>
            )}
            
            {/* Bảng Lương nhân viên */}
            {salaryData.length > 0 && (
              <div className="overflow-x-auto custom-table-dark">
                <Table
                  title={() => <span className="text-xl font-semibold text-white">LƯƠNG NHÂN VIÊN</span>}
                  className="shadow-lg"
                  columns={salaryColumns}
                  dataSource={salaryData}
                  rowKey={(record) => record.month + record.year + record.userId}
                  pagination={{ pageSize: 5 }}
                  footer={() => (
                    <span className="text-lg font-bold text-white">
                      Tổng cộng: {formatVND(totalObj.salary)}
                    </span>
                  )}
                />
              </div>
            )}
          </div>
        </Card>
      </div>

       {/* Custom Styles for Antd Dark Mode */}
       <style>{`
            /* DatePicker styles */
            .custom-range-picker-dark.ant-picker {
                background-color: #374151; /* gray-700 */
                border-color: #4b5563; /* gray-600 */
                color: white;
            }
            .custom-range-picker-dark.ant-picker-focused,
            .custom-range-picker-dark.ant-picker:hover {
                border-color: ${ACCENT_COLOR} !important;
                box-shadow: 0 0 0 2px ${ACCENT_COLOR}40 !important;
            }
            .custom-range-picker-dark .ant-picker-input > input {
                color: white !important;
            }
            .custom-range-picker-dark .ant-picker-range-separator {
                color: #9ca3af; /* gray-400 */
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
            
            /* Footer */
            .custom-table-dark .ant-table-footer {
                background: #111827 !important; /* slate-900 đậm hơn */
                color: white;
                border-top: 1px solid #374151;
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
        `}</style>
    </div>
  )
}

export default Home