import { useRouter } from 'next/router'
import { useState } from 'react'

import { createClient } from '@/utils/supabase/component'

export default function LoginPage() {
	const router = useRouter()
	const supabase = createClient()

	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

	async function logIn() {
		const { error } = await supabase.auth.signInWithPassword({
			email,
			password
		})
		if (error) {
			console.error(error)
		}
		router.push('/')
	}

	async function signUp() {
		const { error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: {
					first_name: firstName,
					last_name: lastName,
				},
			},
		})
		if (error) {
			console.error(error)
		}
		router.push('/')
	}

	return (
		<main>
			<form className='flex flex-col'>
				<label htmlFor='firstname'>first name:</label>
				<input
					id='firstName'
					type='string'
					value={firstName}
					onChange={(e) => setFirstName(e.target.value)}
				/>
				<label htmlFor='lastname'>lastname:</label>
				<input
					id='lastName'
					type='string'
					value={lastName}
					onChange={(e) => setLastName(e.target.value)}
				/>
				<label htmlFor='email'>Email:</label>
				<input
					id='email'
					type='email'
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>
				<label htmlFor='password'>Password:</label>
				<input
					id='password'
					type='password'
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
				<button type='button' onClick={logIn}>
					Log in
				</button>
				<button type='button' onClick={signUp}>
					Sign up
				</button>
			</form>
		</main>
	)
}
