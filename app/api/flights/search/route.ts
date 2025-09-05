
import { NextResponse } from 'next/server';
import { FlightService } from '../../../../lib/flightService';
import { FlightQuery } from '../../../../types';

const flightService = new FlightService();

export const POST = async (request: Request) => {
  try {
    const query = await request.json() as FlightQuery;
    const flights = flightService.searchFlights(query);
    return NextResponse.json({ success: true, data: flights });
  } catch (error) {
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}
