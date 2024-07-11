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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import getAllExercisesForUser from '@/lib/getAllExerciseForUsers'

const defaultWorkoutData: WorkoutData = {
	name: 'New Workout',
	date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
	exercises: [
		{
			name: 'Squats',
			sets: [
				{ weight: 0, reps: 0 }],
		}
	],
}

interface ExerciseSet {
	weight: number
	reps: number
}

interface Exercise {
	name: string
	sets: ExerciseSet[]
}

interface WorkoutData {
	name: string
	date: string
	exercises: Exercise[]
}

const Index = ({ user }: { user: User }) => {
	const supabase = createFEClient()
	const [date, setDate] = useState<Date | undefined>(new Date())
	const [workout, setWorkout] = useState<WorkoutData>()
	const [allExercises, setAllExercises] = useState<string[]>([])

	const addSetToExercise = (exerciseName: string, newSet: ExerciseSet) => {
		setWorkout((prevState) => {
			// Map over the exercises to find the one we want to update
			const updatedExercises = prevState.exercises.map((exercise) => {
				if (exercise.name === exerciseName) {
					// Create a new sets array with the new set added
					console.log(exercise.sets)
					const updatedSets = [...exercise.sets, newSet]
					console.log(updatedSets)
					// Return the updated exercise object
					return { ...exercise, sets: updatedSets }
				}
				// Return the original exercise object if it doesn't match
				return exercise
			})
			// Return the new state object with the updated exercises array
			return { ...prevState, exercises: updatedExercises }
		})
	}

	useEffect(() => {
		getAllExercisesForUser(user.id, supabase).then((res) => setAllExercises(res))
	}, [])

	console.log('all exercises', allExercises)

	useEffect(() => {
		async function getWorkoutForDate() {
			const { data, error } = await supabase.rpc(
				'get_workout_for_user_on_date',
				{
					p_user_id: user.id,
					p_date: date?.toDateString(),
				},
			)

			if (error) {
				console.error('Error fetching workout:', error)
				return null
			}

			setWorkout(data.workout)
		}

		getWorkoutForDate()
	}, [date])

	console.log('workout', workout)

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
				{workout?.exercises?.map((exercise) => {
					return (
						<div className='mt-5'>
							<Select>
								<SelectTrigger className='w-[180px]'>
									<SelectValue placeholder={exercise.name} />
								</SelectTrigger>
 								<SelectContent>
									{allExercises
										.filter((exercise) => exercise !== 'New Exercise')
										.map((exercise) => (
											<SelectItem value={exercise.name}>
												{exercise.name}
											</SelectItem>
										))}
								</SelectContent>
							</Select>

							{exercise.sets.map((set) => {
								return (
									<div className='flex items-center mt-5'>
										<div className='flex flex-col justify-center items-start w-1/3 pr-5'>
											<Label htmlFor='reps'>Reps</Label>
											<Input className='mt-2' value={set.reps} />
										</div>
										<div className='flex flex-col justify-center items-start w-1/3 pr-5'>
											<Label htmlFor='weights'>Weight</Label>
											<Input className='mt-2' value={set.weight} />
										</div>
									</div>
								)
							})}

							<Button
								className='mt-5'
								onClick={() => {
									const newSet = { weight: 0, reps: 0 }

									addSetToExercise(exercise.name, newSet)
								}}
							>
								Add Set
							</Button>
						</div>
					)
				})}
			</Section>
			<Section>
				<Button>
					Add Exercise
				</Button>
				<Button
					className='ml-5'
					onClick={async () => {
						const { data, error } = await supabase.functions.invoke(
							'insert_workout',
							{
								body: JSON.stringify({
									workoutData: workout,
									userId: user.id,
								}),
							},
						)

						if (error) console.error('Error:', error)
						else console.log('Success:', data)
					}}
				>
					Save
				</Button>
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
			workout: workoutDetails.data,
		},
	}
}

export default Index
