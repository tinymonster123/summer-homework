"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Flight, Order, Customer, Passenger } from '../types';

const API_URL = '/api';

const FlightSearchTab = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [searchQuery, setSearchQuery] = useState({
    flightNumber: '',
    departureCity: '',
    arrivalCity: '',
  });
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [passengers, setPassengers] = useState<Passenger[]>([{ name: '', idCard: '' }]);
  const [customerId, setCustomerId] = useState('customer1'); // Mock customer

  const handleSearch = async () => {
    const response = await fetch(`${API_URL}/flights/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(searchQuery),
    });
    const result = await response.json();
    if (result.success) {
      setFlights(result.data);
    }
  };

  const handleBooking = async () => {
    if (!selectedFlight) return;
    const response = await fetch(`${API_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        flightNumber: selectedFlight.flightNumber,
        customerId,
        passengers,
      }),
    });
    const result = await response.json();
    if (result.success) {
      alert('Booking successful!');
      setSelectedFlight(null);
      handleSearch();
    } else {
      alert(`Booking failed: ${result.message}`);
    }
  };

  const addPassenger = () => {
    setPassengers([...passengers, { name: '', idCard: '' }]);
  };
  
  const handlePassengerChange = (index: number, field: keyof Passenger, value: string) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[index] = { ...updatedPassengers[index], [field]: value };
    setPassengers(updatedPassengers);
  };

  useEffect(() => {
    const fetchFlights = async () => {
        const response = await fetch(`${API_URL}/flights`);
        const result = await response.json();
        if (result.success) {
            setFlights(result.data);
        }
    };
    fetchFlights();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Flight Search & Booking</CardTitle>
        <CardDescription>Find and book your next flight.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-4">
          <Input placeholder="Flight Number" value={searchQuery.flightNumber} onChange={(e) => setSearchQuery({ ...searchQuery, flightNumber: e.target.value })} />
          <Input placeholder="Departure City" value={searchQuery.departureCity} onChange={(e) => setSearchQuery({ ...searchQuery, departureCity: e.target.value })} />
          <Input placeholder="Arrival City" value={searchQuery.arrivalCity} onChange={(e) => setSearchQuery({ ...searchQuery, arrivalCity: e.target.value })} />
          <Button onClick={handleSearch}>Search</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Flight No.</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Departure</TableHead>
              <TableHead>Arrival</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Seats</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {flights.map((flight) => (
              <TableRow key={flight.flightNumber}>
                <TableCell>{flight.flightNumber}</TableCell>
                <TableCell>{flight.departureCity}</TableCell>
                <TableCell>{flight.arrivalCity}</TableCell>
                <TableCell>{flight.departureTime}</TableCell>
                <TableCell>{flight.arrivalTime}</TableCell>
                <TableCell>${flight.price}</TableCell>
                <TableCell>{flight.availableSeats}</TableCell>
                <TableCell>
                  <DialogTrigger asChild>
                    <Button onClick={() => setSelectedFlight(flight)}>Book</Button>
                  </DialogTrigger>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Book Flight: {selectedFlight?.flightNumber}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
            {passengers.map((p, index) => (
                <div key={index} className="flex space-x-2">
                    <Input placeholder="Passenger Name" value={p.name} onChange={(e) => handlePassengerChange(index, 'name', e.target.value)} />
                    <Input placeholder="ID Card" value={p.idCard} onChange={(e) => handlePassengerChange(index, 'idCard', e.target.value)} />
                </div>
            ))}
            <Button onClick={addPassenger} variant="outline">Add Passenger</Button>
        </div>
        <DialogFooter>
          <Button onClick={handleBooking}>Confirm Booking</Button>
        </DialogFooter>
      </DialogContent>
    </Card>
  );
};

const MyBookingsTab = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [customerId, setCustomerId] = useState('customer1'); // Mock customer

    const fetchOrders = async () => {
        const response = await fetch(`${API_URL}/orders`);
        const result = await response.json();
        if (result.success) {
            setOrders(result.data.filter((o: Order) => o.customerId === customerId));
        }
    };

    const handleRefund = async (orderId: string) => {
        const response = await fetch(`${API_URL}/bookings/refund`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId }),
        });
        const result = await response.json();
        if (result.success) {
            alert('Refund successful!');
            fetchOrders();
        } else {
            alert(`Refund failed: ${result.message}`);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>My Bookings</CardTitle>
                <CardDescription>View and manage your bookings.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Flight No.</TableHead>
                            <TableHead>Passengers</TableHead>
                            <TableHead>Total Price</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order.orderId}>
                                <TableCell>{order.orderId}</TableCell>
                                <TableCell>{order.flightNumber}</TableCell>
                                <TableCell>{order.passengerCount}</TableCell>
                                <TableCell>${order.totalPrice}</TableCell>
                                <TableCell>{order.status}</TableCell>
                                <TableCell>
                                    {order.status === 'confirmed' && (
                                        <Button variant="destructive" onClick={() => handleRefund(order.orderId)}>Refund</Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

const ManageFlightsTab = () => {
    const [flights, setFlights] = useState<Flight[]>([]);
    const [newFlight, setNewFlight] = useState<Partial<Flight>>({});

    const fetchFlights = async () => {
        const response = await fetch(`${API_URL}/flights`);
        const result = await response.json();
        if (result.success) {
            setFlights(result.data);
        }
    };

    const handleAddFlight = async () => {
        const response = await fetch(`${API_URL}/flights`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newFlight),
        });
        const result = await response.json();
        if (result.success) {
            alert('Flight added!');
            fetchFlights();
        } else {
            alert(`Failed to add flight: ${result.message}`);
        }
    };

    useEffect(() => {
        fetchFlights();
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Flights</CardTitle>
                <CardDescription>Add or modify flight information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex space-x-2">
                    <Input placeholder="Flight Number" onChange={(e) => setNewFlight({ ...newFlight, flightNumber: e.target.value })} />
                    <Input placeholder="From" onChange={(e) => setNewFlight({ ...newFlight, departureCity: e.target.value })} />
                    <Input placeholder="To" onChange={(e) => setNewFlight({ ...newFlight, arrivalCity: e.target.value })} />
                    <Input placeholder="Departure Time" onChange={(e) => setNewFlight({ ...newFlight, departureTime: e.target.value })} />
                    <Input placeholder="Arrival Time" onChange={(e) => setNewFlight({ ...newFlight, arrivalTime: e.target.value })} />
                    <Input type="number" placeholder="Price" onChange={(e) => setNewFlight({ ...newFlight, price: Number(e.target.value) })} />
                    <Input type="number" placeholder="Discount" onChange={(e) => setNewFlight({ ...newFlight, discount: Number(e.target.value) })} />
                    <Input type="number" placeholder="Total Seats" onChange={(e) => setNewFlight({ ...newFlight, totalSeats: Number(e.target.value) })} />
                    <Button onClick={handleAddFlight}>Add Flight</Button>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Flight No.</TableHead>
                            <TableHead>From</TableHead>
                            <TableHead>To</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Total Seats</TableHead>
                            <TableHead>Available</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {flights.map((flight) => (
                            <TableRow key={flight.flightNumber}>
                                <TableCell>{flight.flightNumber}</TableCell>
                                <TableCell>{flight.departureCity}</TableCell>
                                <TableCell>{flight.arrivalCity}</TableCell>
                                <TableCell>${flight.price}</TableCell>
                                <TableCell>{flight.totalSeats}</TableCell>
                                <TableCell>{flight.availableSeats}</TableCell>
                                <TableCell>{flight.status}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

const ManageCustomersTab = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [newCustomer, setNewCustomer] = useState<Omit<Customer, 'id'> | {}>({});

    const fetchCustomers = async () => {
        const response = await fetch(`${API_URL}/customers`);
        const result = await response.json();
        if (result.success) {
            setCustomers(result.data);
        }
    };

    const handleAddCustomer = async () => {
        const response = await fetch(`${API_URL}/customers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newCustomer),
        });
        const result = await response.json();
        if (result.success) {
            alert('Customer added!');
            fetchCustomers();
        } else {
            alert(`Failed to add customer: ${result.message}`);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Customers</CardTitle>
                <CardDescription>Add or view customer information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex space-x-2">
                    <Input placeholder="Name" onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })} />
                    <Input placeholder="ID Card" onChange={(e) => setNewCustomer({ ...newCustomer, idCard: e.target.value })} />
                    <Input placeholder="Phone" onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })} />
                    <Input placeholder="Email" onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })} />
                    <Button onClick={handleAddCustomer}>Add Customer</Button>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>ID Card</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Email</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {customers.map((customer) => (
                            <TableRow key={customer.id}>
                                <TableCell>{customer.id}</TableCell>
                                <TableCell>{customer.name}</TableCell>
                                <TableCell>{customer.idCard}</TableCell>
                                <TableCell>{customer.phone}</TableCell>
                                <TableCell>{customer.email}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};


const Home = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Airline Ticket Booking System</h1>
      <Dialog>
        <Tabs defaultValue="search">
          <TabsList>
            <TabsTrigger value="search">Flight Search & Booking</TabsTrigger>
            <TabsTrigger value="bookings">My Bookings</TabsTrigger>
            <TabsTrigger value="flights">Manage Flights</TabsTrigger>
            <TabsTrigger value="customers">Manage Customers</TabsTrigger>
          </TabsList>
          <TabsContent value="search">
            <FlightSearchTab />
          </TabsContent>
          <TabsContent value="bookings">
            <MyBookingsTab />
          </TabsContent>
          <TabsContent value="flights">
            <ManageFlightsTab />
          </TabsContent>
          <TabsContent value="customers">
            <ManageCustomersTab />
          </TabsContent>
        </Tabs>
      </Dialog>
    </div>
  );
};

export default Home;