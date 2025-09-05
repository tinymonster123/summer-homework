
import { NextResponse } from 'next/server';
import { FlightService } from '../../../lib/flightService';

const flightService = new FlightService();

export const GET = async () => {
  try {
    const orders = flightService.getAllOrders();
    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}
