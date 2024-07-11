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

const fakeData: WorkoutData = {
	name: 'Chest Day',
	date: 'Tue Jul 09 2024',
	exercises: [
		{
			name: 'Bench',
			exercise: 'exercise_id',
			sets: [
				{
					weight: 100,
					reps: 5,
				},
				{
					weight: 100,
					reps: 3,
				},
			],
		},
		{
			name: 'Shoulder Press',
			exercise: 'exercise_id',
			sets: [
				{
					weight: 100,
					reps: 5,
				},
				{
					weight: 100,
					reps: 3,
				},
			],
		},
	],
}

type WorkoutData = {
	name: string
	date: string
	exercises: {
		name: string
		exercise: string
		sets: ExerciseSet[]
	}[]
}

type ExerciseSet = {
	weight: number
	reps: number
}

const Index = ({ user }: { user: User }) => {
	const supabase = createFEClient()
	const [date, setDate] = useState<Date | undefined>(new Date())
	const [workout, setWorkout] = useState<any>(fakeData)

	const addSetToExercise = (exerciseName, newSet) => {
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
		async function getWorkoutForDate() {
			const existingWorkout = await supabase
				.from('Workouts')
				.select()
				.eq('user_id', user.id)
				.eq('date', date?.toDateString())

			if (existingWorkout.data?.length) {
				setWorkout(fakeData)
			} else {
				setWorkout(fakeData)
			}
		}

		getWorkoutForDate()
	}, [])

	/* useEffect(() => {
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
						description: value,
					})
			}

			const { error } = await supabase
				.from('Workouts')
				.update({
					description: value,
				})
				.eq('user_id', user.id)
				.eq('date', date?.toDateString())
		}

		saveWorkout();
	}, [value]) */

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
				{/* 				<Textarea
					rows={10}
					value={value}
					placeholder='yooo add something'
					onChange={(e) => {
						console.log(e.target.value)
						setValue(e.target.value)
					}} 
				/>*/}
				{workout.exercises.map((exercise) => {
					return (
						<div className='mt-5'>
							<Select>
								<SelectTrigger className='w-[180px]'>
									<SelectValue placeholder={exercise.name} />
								</SelectTrigger>
								<SelectContent>
									{workout.exercises
										.filter((exercise) => exercise.name !== 'New Exercise')
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
									const newSet = {weight: 0, reps: 0}
									
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
				<Button
					onClick={() => {
						setWorkout({
							...workout,
							exercises: [
								...workout.exercises,
								{
									name: 'New Exercise',
									sets: [{ weight: 0, reps: 0 }],
								},
							],
						})
					}}
				>
					Add Exercise
				</Button>
				<Button className='ml-5'>Save</Button>
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
