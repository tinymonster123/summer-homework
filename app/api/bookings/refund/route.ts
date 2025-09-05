
import { NextResponse } from 'next/server';
import { FlightService } from '../../../../lib/flightService';

const flightService = new FlightService();

export const POST = async (request: Request) => {
  try {
    const { orderId } = await request.json() as { orderId: string };
    const result = flightService.refundTicket(orderId);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}
