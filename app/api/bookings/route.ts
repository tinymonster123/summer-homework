
import { NextResponse } from 'next/server';
import { FlightService } from '../../../lib/flightService';
import { Passenger } from '../../../types';

const flightService = new FlightService();

export const POST = async (request: Request) => {
  try {
    const { flightNumber, customerId, passengers } = await request.json() as { flightNumber: string, customerId: string, passengers: Passenger[] };
    const order = flightService.bookTicket(flightNumber, customerId, passengers);
    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}
