import type { User } from '@supabase/supabase-js'
import type { GetServerSidePropsContext } from 'next'
import { useState } from 'react'
import { Suspense } from 'react'
import Page from '@/components/page'
import Section from '@/components/section'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { createFEClient } from '@/utils/supabase/component'
import { createClient } from '@/utils/supabase/server-props'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { EditableHeader } from '@/components/EditableHeader'
import getAllExercisesForUser from '@/lib/getAllExerciseForUsers'
import removeExercise from '@/lib/removeExercise'
import { DynamicSelect } from '@/components/DynamicSelect'

const defaultWorkoutData: WorkoutData = {
	id: uuidv4(),
	name: 'New Workout',
	date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
	exercises: [
		{
			id: uuidv4(),
			name: 'N/A',
			sets: [{ id: uuidv4(), weight: 0, reps: 0 }],
		},
	],
}

interface ExerciseSet {
	id: string
	weight: number
	reps: number
}

interface Exercise {
	id: string
	name: string
	sets: ExerciseSet[]
}

export interface WorkoutData {
	id: string
	name: string
	date: string
	exercises: Exercise[]
}

const Index = ({ user }: { user: User }) => {
	console.log('render home page')
	const supabase = createFEClient()
	const [date, setDate] = useState<Date | undefined>(new Date())
	const [workout, setWorkout] = useState<WorkoutData>(defaultWorkoutData)
	const [allExercises, setAllExercises] = useState<
		{ id: string; name: string }[]
	>([])

	function updateSet(
		workoutData: WorkoutData,
		exerciseId: string,
		setIndex: number,
		field: 'weight' | 'reps',
		value: string,
	): WorkoutData {
		return {
			...workoutData,
			exercises: workoutData.exercises.map((exercise) =>
				exercise.id === exerciseId
					? {
							...exercise,
							sets: exercise.sets.map((set, index) =>
								index === setIndex ? { ...set, [field]: value } : set,
							),
						}
					: exercise,
			),
		}
	}

	const addSetToExercise = (exerciseId: string, newSet: ExerciseSet) => {
		setWorkout((prevState) => {
			const updatedExercises = prevState?.exercises.map((exercise) => {
				if (exercise.id === exerciseId) {
					const updatedSets = [...exercise.sets, newSet]
					return { ...exercise, sets: updatedSets }
				}
				return exercise
			})
			return { ...prevState, exercises: updatedExercises }
		})
	}

	const removeSetFromExercise = (exerciseId: string, setIndex: number) => {
		setWorkout((prevState) => {
			if (!prevState) return prevState // Handle case where prevState is null or undefined

			const updatedExercises = prevState.exercises.map((exercise) => {
				if (exercise.id === exerciseId) {
					const updatedSets = exercise.sets.filter(
						(_, index) => index !== setIndex,
					)
					return { ...exercise, sets: updatedSets }
				}
				return exercise
			})

			return { ...prevState, exercises: updatedExercises }
		})
	}

	useEffect(() => {
		getAllExercisesForUser(user.id, supabase).then((res) => {
			if (res.length) {
				setAllExercises(res)

				return
			}

			supabase
				.from('Exercise')
				.select('id, name')
				.order('name')
				.then(({ data, error }) => {
					if (error) {
						console.error('Error fetching exercises:', error)
						throw error
					}
					setAllExercises(data)
				})
		})
	}, [])

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
				return defaultWorkoutData
			}

			setWorkout(data.workout)
		}

		getWorkoutForDate()
	}, [date])

	const handleRemoveExercise = (exerciseId: string) => {
		setWorkout((currentWorkout) => removeExercise(currentWorkout, exerciseId))
	}

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
			<Suspense fallback={<h1>Loading....</h1>}>
				<Section>
					<EditableHeader
						initialText={workout.name || 'NoName'}
						onSave={(newWorkoutName) => {
							setWorkout({
								...workout,
								name: newWorkoutName,
							})
						}}
					/>
					{workout?.exercises?.map((exercise) => {
						return (
							<>
								<div className='mt-5' key={exercise.id}>
									<DynamicSelect
										options={allExercises}
										placeholder={exercise.name}
										onAddOption={(newExercise) => {
											console.log('hiya', newExercise)
											setAllExercises([...allExercises, newExercise])
										}}
										onSelect={(value) => {
											console.log(value)
										}}
									/>

									{exercise.sets.map((set, i) => {
										return (
											<div className='flex items-center mt-5' key={set.id}>
												<div className='flex flex-col justify-center items-start w-1/3 pr-5'>
													<Label htmlFor='reps'>Reps</Label>
													<Input
														className='mt-2'
														value={set.reps}
														onChange={(e) => {
															const newWorkout = updateSet(
																workout,
																exercise.id,
																i,
																'reps',
																e.target.value,
															)
															setWorkout(newWorkout)
														}}
													/>
												</div>
												<div className='flex flex-col justify-center items-start w-1/3 pr-5'>
													<Label htmlFor='weights'>Weight</Label>
													<Input
														className='mt-2'
														value={set.weight}
														onChange={(e) => {
															const newWorkout = updateSet(
																workout,
																exercise.id,
																i,
																'weight',
																e.target.value,
															)
															setWorkout(newWorkout)
														}}
													/>
												</div>
												<Button
													variant='ghost'
													size='icon'
													className='mt-5'
													onClick={() => removeSetFromExercise(exercise.id, i)}
												>
													<i className='bi bi-trash3'></i>
												</Button>
											</div>
										)
									})}

									<Button
										className='mt-5'
										onClick={() => {
											const newSet = { id: uuidv4(), weight: 0, reps: 0 }

											addSetToExercise(exercise.id, newSet)
										}}
									>
										Add Set
									</Button>
								</div>
							</>
						)
					})}
				</Section>
				<Section>
					<Button
						onClick={() => {
							if (!workout) {
								setWorkout(defaultWorkoutData)

								return
							}

							setWorkout({
								...workout,
								exercises: [
									...workout.exercises,
									{
										id: uuidv4(),
										name: 'N/A',
										sets: [{ id: uuidv4(), weight: 0, reps: 0 }],
									},
								],
							})
						}}
					>
						Add Exercise
					</Button>
					<Button
						className='ml-5'
						onClick={async () => {
							const { data, error } = await supabase.functions.invoke(
								'upsert_workout',
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
			</Suspense>
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
