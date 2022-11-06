import '../styles/global.css'
import React, {useState, useEffect} from 'react'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { SessionContextProvider, Session } from '@supabase/auth-helpers-react'
import { supabase } from '../utils/db';

function MyApp({ 
  Component, 
  pageProps 
}: AppProps<{
  initialSession : Session
}>) {
  
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null);

	useEffect(() => {
		// for testing - log out the user.
		// supabase.auth.signOut();

		let mounted = true;

		async function getInitialSession() {
			const supabaseSession = await supabase.auth.getSession();

			// only update the react state if the component is still mounted
			if (mounted && supabaseSession) {
				setSession(supabaseSession);
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

	return <Component {...pageProps} session={session} user={session?.user} />;
}

export default MyApp