// 数据结构定义

// 航班信息
export interface Flight {
  flightNumber: string;        // 航班号
  departureCity: string;       // 起飞城市
  arrivalCity: string;         // 到达城市
  departureTime: string;       // 起飞时间
  arrivalTime: string;         // 到达时间
  price: number;              // 票价
  discount: number;           // 折扣 (0-1)
  totalSeats: number;         // 总座位数
  availableSeats: number;     // 可用座位数
  status: 'active' | 'cancelled' | 'delayed'; // 航班状态
}

// 客户信息
export interface Customer {
  id: string;                 // 客户ID
  name: string;               // 姓名
  idCard: string;             // 证件号
  phone: string;              // 电话
  email: string;              // 邮箱
}

// 订单信息
export interface Order {
  orderId: string;            // 订单编号
  customerId: string;         // 客户ID
  flightNumber: string;       // 航班号
  passengerCount: number;     // 订票数量
  totalPrice: number;         // 总价
  orderTime: string;          // 订票时间
  status: 'confirmed' | 'cancelled' | 'refunded'; // 订单状态
  passengers: Passenger[];    // 乘客信息
}

// 乘客信息
export interface Passenger {
  name: string;               // 乘客姓名
  idCard: string;             // 证件号
  seatNumber?: string;        // 座位号
}

// 查询条件
export interface FlightQuery {
  flightNumber?: string;
  departureCity?: string;
  arrivalCity?: string;
  departureDate?: string;
}

// API 响应类型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}