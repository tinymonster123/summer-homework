
import { NextResponse } from 'next/server';
import { FlightService } from '../../../../lib/flightService';
import { Flight } from '../../../../types';

const flightService = new FlightService();

export const PUT = async (request: Request, { params }: { params: { flightNumber: string } }) => {
    try {
        const { flightNumber } = params;
        const updates = await request.json() as Partial<Omit<Flight, 'flightNumber'>>;
        const updatedFlight = flightService.updateFlight(flightNumber, updates);
        return NextResponse.json({ success: true, data: updatedFlight });
    } catch (error) {
        return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
    }
}
