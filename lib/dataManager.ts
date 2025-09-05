// 数据管理类 - 实现文件存储和数据操作
import fs from 'fs';
import path from 'path';
import { Flight, Customer, Order, FlightQuery } from '../types';

export class DataManager {
  private dataDir: string;
  private flightsFile: string;
  private customersFile: string;
  private ordersFile: string;

  constructor() {
    this.dataDir = path.join(process.cwd(), 'data');
    this.flightsFile = path.join(this.dataDir, 'flights.json');
    this.customersFile = path.join(this.dataDir, 'customers.json');
    this.ordersFile = path.join(this.dataDir, 'orders.json');
    this.initializeDataFiles();
  }

  // 初始化数据文件
  private initializeDataFiles(): void {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }

    // 初始化航班数据
    if (!fs.existsSync(this.flightsFile)) {
      const initialFlights: Flight[] = [
        {
          flightNumber: 'CA1234',
          departureCity: '北京',
          arrivalCity: '上海',
          departureTime: '08:00',
          arrivalTime: '10:30',
          price: 800,
          discount: 0.9,
          totalSeats: 180,
          availableSeats: 150,
          status: 'active'
        },
        {
          flightNumber: 'MU5678',
          departureCity: '上海',
          arrivalCity: '广州',
          departureTime: '14:00',
          arrivalTime: '16:45',
          price: 650,
          discount: 0.85,
          totalSeats: 160,
          availableSeats: 120,
          status: 'active'
        }
      ];
      this.saveFlights(initialFlights);
    }

    // 初始化客户数据
    if (!fs.existsSync(this.customersFile)) {
      this.saveCustomers([]);
    }

    // 初始化订单数据
    if (!fs.existsSync(this.ordersFile)) {
      this.saveOrders([]);
    }
  }

  // 航班数据操作
  getFlights(): Flight[] {
    try {
      const data = fs.readFileSync(this.flightsFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('读取航班数据失败:', error);
      return [];
    }
  }

  saveFlights(flights: Flight[]): void {
    try {
      fs.writeFileSync(this.flightsFile, JSON.stringify(flights, null, 2));
    } catch (error) {
      console.error('保存航班数据失败:', error);
      throw new Error('保存航班数据失败');
    }
  }

  // 客户数据操作
  getCustomers(): Customer[] {
    try {
      const data = fs.readFileSync(this.customersFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('读取客户数据失败:', error);
      return [];
    }
  }

  saveCustomers(customers: Customer[]): void {
    try {
      fs.writeFileSync(this.customersFile, JSON.stringify(customers, null, 2));
    } catch (error) {
      console.error('保存客户数据失败:', error);
      throw new Error('保存客户数据失败');
    }
  }

  // 订单数据操作
  getOrders(): Order[] {
    try {
      const data = fs.readFileSync(this.ordersFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('读取订单数据失败:', error);
      return [];
    }
  }

  saveOrders(orders: Order[]): void {
    try {
      fs.writeFileSync(this.ordersFile, JSON.stringify(orders, null, 2));
    } catch (error) {
      console.error('保存订单数据失败:', error);
      throw new Error('保存订单数据失败');
    }
  }
}