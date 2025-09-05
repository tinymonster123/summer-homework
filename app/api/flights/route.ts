
import { NextResponse } from 'next/server';
import { FlightService } from '../../../lib/flightService';
import { Flight } from '../../../types';

const flightService = new FlightService();

export const GET = async () => {
  try {
    const flights = flightService.getAllFlights();
    return NextResponse.json({ success: true, data: flights });
  } catch (error) {
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}

export const POST = async (request: Request) => {
    try {
        const flightData = await request.json() as Pick<Flight, 'flightNumber' | 'departureCity' | 'arrivalCity' | 'departureTime' | 'arrivalTime' | 'price' | 'discount' | 'totalSeats'>;
        const newFlight = flightService.addFlight(flightData);
        return NextResponse.json({ success: true, data: newFlight });
    } catch (error) {
        return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
    }
}
