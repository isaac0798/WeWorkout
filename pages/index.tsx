import { useState } from 'react'
import type { User } from '@supabase/supabase-js'
import type { GetServerSidePropsContext } from 'next'

import { createClient } from '@/utils/supabase/server-props'
import { createFEClient } from '@/utils/supabase/component'
import { Calendar } from '@/components/ui/calendar'
import Page from '@/components/page'
import Section from '@/components/section'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useEffect } from 'react'

const Index = ({ user, workout }: { user: User, workout: any}) => {
	const supabase = createFEClient()
	const [date, setDate] = useState<Date | undefined>(new Date())
	const [workoutDescription, setWorkoutDescription] = useState(workout.description || 'yo')

	useEffect(() => {
		async function saveWorkout() {
			const existingWorkout = await supabase.from('Workouts').select().eq('user_id', user.id).eq('date', date?.toDateString());

			console.log(existingWorkout)

			if (!existingWorkout.data?.length) {
				const { error } = await supabase
					.from('Workouts')
					.insert({
						user_id: user.id,
						name: 'this is a workout',
						date: date?.toDateString(),
						description: workoutDescription,
					})
			}

			const { error } = await supabase
				.from('Workouts')
				.update({
					description: workoutDescription,
				})
				.eq('user_id', user.id)
				.eq('date', date?.toDateString())
		}

		saveWorkout();
	}, [workoutDescription])

	return (
		<Page>
			<Section>
				<Calendar
					mode='single'
					selected={date}
					onSelect={setDate}
					className='rounded-md border'
				/>
			</Section>
			<Section>
				<Textarea
					value={workoutDescription}
					onChange={(e) => {
						console.log(e.target.value)
						setWorkoutDescription(e.target.value)
					}}
				/>
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

	const workoutDetails = await supabase
		.from('Workouts')
		.select()
		.eq('user_id', data.user?.id)

	console.log(workoutDetails)

	return {
		props: {
			user: data.user,
			workout: workoutDetails.data
		},
	}
}

export default Index
