
import { DataManager } from './dataManager';
import { Flight, Customer, Order, FlightQuery, Passenger } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class FlightService {
  private dataManager: DataManager;

  constructor() {
    this.dataManager = new DataManager();
  }

  // 1. 添加航班
  addFlight(flightData: Pick<Flight, 'flightNumber' | 'departureCity' | 'arrivalCity' | 'departureTime' | 'arrivalTime' | 'price' | 'discount' | 'totalSeats'>): Flight {
    const flights = this.dataManager.getFlights();
    if (flights.some(f => f.flightNumber === flightData.flightNumber)) {
      throw new Error('Flight number already exists.');
    }
    const newFlight: Flight = {
      ...flightData,
      availableSeats: flightData.totalSeats,
      status: 'active',
    };
    flights.push(newFlight);
    this.dataManager.saveFlights(flights);
    return newFlight;
  }

  // 2. 查询航班
  searchFlights(query: FlightQuery): Flight[] {
    const flights = this.dataManager.getFlights();
    return flights.filter(f => {
      let match = true;
      if (query.flightNumber && f.flightNumber !== query.flightNumber) {
        match = false;
      }
      if (query.departureCity && f.departureCity !== query.departureCity) {
        match = false;
      }
      if (query.arrivalCity && f.arrivalCity !== query.arrivalCity) {
        match = false;
      }
      // Can add date check if departureTime includes date
      return match && f.status === 'active';
    });
  }

  // 3. 预订机票
  bookTicket(flightNumber: string, customerId: string, passengers: Passenger[]): Order {
    const flights = this.dataManager.getFlights();
    const flight = flights.find(f => f.flightNumber === flightNumber && f.status === 'active');

    if (!flight) {
      throw new Error('Flight not found or not active.');
    }

    if (flight.availableSeats < passengers.length) {
        // Find alternative flights
        const alternativeFlights = this.searchFlights({
            departureCity: flight.departureCity,
            arrivalCity: flight.arrivalCity,
        }).filter(f => f.flightNumber !== flightNumber && f.availableSeats >= passengers.length);

        let errorMessage = 'Not enough available seats.';
        if (alternativeFlights.length > 0) {
            errorMessage += ' Alternative flights available: ' + alternativeFlights.map(f => f.flightNumber).join(', ');
        }
      throw new Error(errorMessage);
    }

    // Update flight seats
    flight.availableSeats -= passengers.length;
    this.dataManager.saveFlights(flights);

    // Create order
    const orders = this.dataManager.getOrders();
    const newOrder: Order = {
      orderId: uuidv4(),
      customerId,
      flightNumber,
      passengerCount: passengers.length,
      totalPrice: flight.price * passengers.length * (flight.discount || 1),
      orderTime: new Date().toISOString(),
      status: 'confirmed',
      passengers,
    };
    orders.push(newOrder);
    this.dataManager.saveOrders(orders);

    return newOrder;
  }

  // 4. 退票
  refundTicket(orderId: string): boolean {
    const orders = this.dataManager.getOrders();
    const orderIndex = orders.findIndex(o => o.orderId === orderId);

    if (orderIndex === -1 || orders[orderIndex].status !== 'confirmed') {
      throw new Error('Order not found or cannot be refunded.');
    }

    const order = orders[orderIndex];
    order.status = 'refunded';
    this.dataManager.saveOrders(orders);

    // Restore flight seats
    const flights = this.dataManager.getFlights();
    const flight = flights.find(f => f.flightNumber === order.flightNumber);
    if (flight) {
      flight.availableSeats += order.passengerCount;
      this.dataManager.saveFlights(flights);
    }

    return true;
  }

  // 5. 客户信息管理
  addCustomer(customerData: Omit<Customer, 'id'>): Customer {
      const customers = this.dataManager.getCustomers();
      const newCustomer: Customer = {
          id: uuidv4(),
          ...customerData,
      };
      customers.push(newCustomer);
      this.dataManager.saveCustomers(customers);
      return newCustomer;
  }

  getCustomer(id: string): Customer | undefined {
      return this.dataManager.getCustomers().find(c => c.id === id);
  }
  
  getCustomerOrders(customerId: string): Order[] {
      return this.dataManager.getOrders().filter(o => o.customerId === customerId);
  }

  // 6. 修改航班信息
  updateFlight(flightNumber: string, updates: Partial<Omit<Flight, 'flightNumber'>>): Flight {
    const flights = this.dataManager.getFlights();
    const flightIndex = flights.findIndex(f => f.flightNumber === flightNumber);

    if (flightIndex === -1) {
      throw new Error('Flight not found.');
    }

    const updatedFlight = { ...flights[flightIndex], ...updates };
    flights[flightIndex] = updatedFlight;
    this.dataManager.saveFlights(flights);
    return updatedFlight;
  }

  // Helper to get a flight by number
  getFlightByNumber(flightNumber: string): Flight | undefined {
    return this.dataManager.getFlights().find(f => f.flightNumber === flightNumber);
  }
  
  // Get all flights
  getAllFlights(): Flight[] {
    return this.dataManager.getFlights();
  }

  // Get all orders
  getAllOrders(): Order[] {
    return this.dataManager.getOrders();
  }

  // Get all customers
  getAllCustomers(): Customer[] {
    return this.dataManager.getCustomers();
  }
}
