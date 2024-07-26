import Page from '@/components/page'
import { createFEClient } from '@/utils/supabase/component'
import { createClient } from '@/utils/supabase/server-props'
import { User } from '@supabase/supabase-js'
import { GetServerSidePropsContext } from 'next'
import { useEffect, useState } from 'react'

interface Workout {
	id: string
	name: string
	date: string
	exercises: Array<{
		id: string
		name: string
		sets: Array<{
			id: string
			weight: number
			reps: number
			completed: boolean
		}>
	}>
}

const Index = ({ user }: { user: User }) => {
	const supabase = createFEClient()
	const [profile, setProfile] = useState<{
		id: string
		first_name: string
    last_name: string
	}>();

  const [workouts, setWorkouts] = useState<Workout[]>([])

	useEffect(() => {
		supabase
			.from('profiles')
			.select()
			.eq('id', user.id)
      .single()
			.then(({ data, error }) => {
				if (error) {
					console.error('error fetching profile:', error)
				}

				setProfile(data)
			})

    const fetchUserWorkouts = async (userId: string) => {
			const { data, error } = await supabase
				.from('Workout')
				.select(
					`
      id,
      name,
      date,
      WorkoutExercise (
        id,
        Exercise (
          id,
          name
        ),
        Sets (
          id,
          weight,
          reps,
          completed
        )
      )
    `,
				)
				.eq('user_id', userId)
				.order('date', { ascending: false })

			if (error) {
				console.error('Error fetching workouts:', error)
				throw error
			}

			// Restructure the data for easier use
			const formattedWorkouts = data?.map((workout) => ({
				id: workout.id,
				name: workout.name,
				date: workout.date,
				exercises: workout.WorkoutExercise.map((we) => ({
					id: we.Exercise.id,
					name: we.Exercise.name,
					sets: we.Sets,
				})),
			}))

			return formattedWorkouts
		}

		// Usage
		try {
			fetchUserWorkouts(user.id).then((workouts) => {
        setWorkouts(workouts)
      })
		} catch (error) {
			console.error('Failed to fetch workouts:', error)
		}
	}, [])

	return (
		<Page>
			<h1>
				{profile?.first_name} {profile?.last_name}
			</h1>
			<div>
				{workouts.map((workout) => (
					<div key={workout.id}>
						<h2>
							{workout.name} - {workout.date}
						</h2>
						{workout.exercises.map((exercise) => (
							<div key={exercise.id}>
								<h3>{exercise.name}</h3>
								<ul>
									{exercise.sets.map((set) => (
										<li key={set.id}>
											{set.weight}kg x {set.reps} reps
											{set.completed ? ' (Completed)' : ''}
										</li>
									))}
								</ul>
							</div>
						))}
					</div>
				))}
			</div>
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
