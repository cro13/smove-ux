import Resend from '@auth/core/providers/resend'
import { Password } from '@convex-dev/auth/providers/Password'
import { convexAuth } from '@convex-dev/auth/server'

export const { auth, signIn, signOut, store } = convexAuth({
	providers: [
		Resend({
			from: process.env.AUTH_EMAIL_FROM ?? 'Smove <onboarding@resend.dev>',
		}),
		Password({
			profile(params) {
				const name = params.name as string | undefined

				return {
					email: params.email as string,
					...(name ? { name } : {}),
				}
			},
		}),
	],
})
