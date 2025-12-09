import { NextRequest, NextResponse } from 'next/server';
import { getRegistrationOptions } from '@lib/register';
import { getRpID, getOrigin } from '@lib/webauthn-helpers';

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { email, username } = body as { email?: string; username?: string };

		if (!email) {
			return NextResponse.json({ error: 'Email là bắt buộc' }, { status: 400 });
		}

		const hostname = request.headers.get('host') || 'localhost';
		const originHeader = request.headers.get('origin') || undefined;
		const rpID = getRpID(hostname, originHeader);
		const expectedOrigin = getOrigin(originHeader, hostname);

		const options = await getRegistrationOptions(email.toLowerCase().trim(), username ?? '', rpID, expectedOrigin);

		return NextResponse.json({ success: true, options });
	} catch (error) {
		console.error('Error in register-challenge:', error);
		const message = error instanceof Error ? error.message : 'Unknown error';
		return NextResponse.json(
			{ error: message, details: error instanceof Error ? error.stack : undefined },
			{ status: 500 }
		);
	}
}
