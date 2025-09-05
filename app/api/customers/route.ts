
import { NextResponse } from 'next/server';
import { FlightService } from '../../../lib/flightService';
import { Customer } from '../../../types';

const flightService = new FlightService();

export const GET = async () => {
    try {
        const customers = flightService.getAllCustomers();
        return NextResponse.json({ success: true, data: customers });
    } catch (error) {
        return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
    }
}

export const POST = async (request: Request) => {
  try {
    const customerData = await request.json() as Omit<Customer, 'id'>;
    const customer = flightService.addCustomer(customerData);
    return NextResponse.json({ success: true, data: customer });
  } catch (error) {
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}
