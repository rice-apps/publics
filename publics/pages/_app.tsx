import '../styles/global.css'
import { useState, useEffect } from 'react'
import type { AppProps } from 'next/app'
import { Session } from '@supabase/auth-helpers-react'
import Layout from '../components/Layout'
import { supabase } from '../utils/db';

function MyApp({
	Component,
	pageProps
}: AppProps<{
	initialSession: Session
}>) {
	const [session, setSession] = useState<Session | null>(null);

	useEffect(() => {
		// for testing - log out the user.
		// supabase.auth.signOut();

		let mounted = true;

		async function getInitialSession() {
			const supabaseSession = await supabase.auth.getSession();

			// only update the react state if the component is still mounted
			if (mounted && supabaseSession) {
				setSession(supabaseSession.data.session);
			}
		}

		getInitialSession();

		const data = supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
		}).data;

		return () => {
			mounted = false;

			data?.subscription?.unsubscribe();
		};
	}, []);

	return (
		<Layout>
			<Component {...pageProps} session={session} user={session?.user} />
		</Layout>
	)
}

export default MyApp