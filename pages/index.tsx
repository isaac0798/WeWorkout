import { useState } from 'react'
import type { User } from '@supabase/supabase-js'
import type { GetServerSidePropsContext } from 'next'

import { createClient } from '@/utils/supabase/server-props'
import { Calendar } from '@/components/ui/calendar'
import Page from '@/components/page'
import Section from '@/components/section'

const Index = ({ user }: { user: User }) => {
	const [date, setDate] = useState<Date | undefined>(new Date())
	console.log(date)

	return (
		<Page>
			<Section>
				<h1>Hello, {user.email || 'user'}!</h1>
				<Calendar
					mode='single'
					selected={date}
					onSelect={setDate}
					className='rounded-md border'
				/>
				{date?.toDateString()}
			</Section>
			<Section>
				Dump workout text here
			</Section>
		</Page>
	)
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
	const supabase = createClient(context)

	const { data, error } = await supabase.auth.getUser()

	if (error || !data) {
		return {
			redirect: {
				destination: '/login',
				permanent: false,
			},
		}
	}

	return {
		props: {
			user: data.user,
		},
	}
}

export default Index
