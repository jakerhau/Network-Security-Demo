import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticationOptionsJSON } from '@lib/login';
import { getRpID } from '@lib/webauthn-helpers';

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { email } = body as { email?: string };

		if (!email) {
			return NextResponse.json({ error: 'Email là bắt buộc' }, { status: 400 });
		}

		const hostname = request.headers.get('host') || 'localhost';
		const originHeader = request.headers.get('origin') || undefined;
		const rpID = getRpID(hostname, originHeader);

		const options = await getAuthenticationOptionsJSON(email.toLowerCase().trim(), rpID);

		return NextResponse.json({ success: true, options });
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown error';
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
