import { NextRequest, NextResponse } from 'next/server';
import { verifyRegistration } from '@lib/register';
import { registerUser } from '@lib/database';
import {
	authenticatedUserIdToCookieStorage,
	consumeChallengeFromCookieStorage,
} from '@lib/cookieActions';
import { getRpID, getOrigin } from '@lib/webauthn-helpers';

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { email, username, credential } = body as {
			email?: string;
			username?: string;
			credential?: unknown;
		};

		if (!email || !credential) {
			return NextResponse.json({ error: 'Thiếu thông tin đăng ký' }, { status: 400 });
		}

		const hostname = request.headers.get('host') || 'localhost';
		const originHeader = request.headers.get('origin') || undefined;
		const rpID = getRpID(hostname, originHeader);
		const expectedOrigin = getOrigin(originHeader, hostname);

		const challenge = await consumeChallengeFromCookieStorage();
		if (!challenge) {
			return NextResponse.json({ error: 'Challenge không tồn tại hoặc đã hết hạn' }, { status: 400 });
		}

		const verification = await verifyRegistration(credential as any, challenge, rpID, expectedOrigin);
		const user = await registerUser(email.toLowerCase().trim(), username ?? '', verification);

		await authenticatedUserIdToCookieStorage(user);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error in register-verify:', error);
		const message = error instanceof Error ? error.message : 'Unknown error';
		return NextResponse.json(
			{ error: message, details: error instanceof Error ? error.stack : undefined },
			{ status: 500 }
		);
	}
}
