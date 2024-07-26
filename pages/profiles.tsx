import Page from '@/components/page'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { createFEClient } from '@/utils/supabase/component'
import { createClient } from '@/utils/supabase/server-props'
import type { User } from '@supabase/supabase-js'
import type { GetServerSidePropsContext } from 'next'
import { useEffect, useState } from 'react'
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	Line,
	LineChart,
	Scatter,
	ScatterChart,
	XAxis,
	YAxis,
} from 'recharts'

import { ChartConfig, ChartContainer } from '@/components/ui/chart'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'

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

interface Exercise {
	id: string
	name: string
	sets: {
		id: string
		weight: number
		reps: number
		completed: boolean
	}[]
}

const Index = ({ user }: { user: User }) => {
	const supabase = createFEClient()
	const [profile, setProfile] = useState<{
		id: string
		first_name: string
		last_name: string
	}>()

	const [workouts, setWorkouts] = useState<Workout[]>([])
	const [uniqueExercises, setUniqueExericses] = useState<Exercise[]>([])
	const [selectedExercise, setSelectedExercise] = useState<Exercise>()
	const [chartData, setChartData] =
		useState<{ reps: number; weight: number }[]>()
	const [highlights, setHighlights] = useState<string[]>([])

	const chartConfig = {
		weight: {
			label: 'Weight',
			color: '#2563eb',
		},
	} satisfies ChartConfig

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

			let newdata: any = data

			// Restructure the data for easier use
			const formattedWorkouts = newdata?.map((workout) => ({
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

		try {
			fetchUserWorkouts(user.id).then((workouts) => {
				setWorkouts(workouts)
				setUniqueExericses(getUniqueExercises(workouts))
			})
		} catch (error) {
			console.error('Failed to fetch workouts:', error)
		}

		supabase.storage
			.from('highlights')
			.list(`${user.id}`, {
				limit: 100,
				offset: 0,
				sortBy: { column: 'name', order: 'asc' },
			})
			.then(({ data, error }) => {
				console.log(data)
				data?.map((file) => {
					supabase.storage
						.from('highlights')
						.download(`${user.id}/${file.name}`)
						.then(({data, error}) => {
							if (!data || error) {
								return;
							}

							const blob = new Blob([data], { type: 'video/mp4' })	
							setHighlights([...highlights, URL.createObjectURL(blob)])
						})

				})


			})
	}, [])

	function getUniqueExercises(workouts: Workout[]): Exercise[] {
		const exerciseSet = new Set<string>()
		const uniqueExercises: Exercise[] = []

		workouts.forEach((workout) => {
			workout.exercises.forEach((exercise) => {
				if (!exerciseSet.has(exercise.id)) {
					exerciseSet.add(exercise.id)
					uniqueExercises.push({
						id: exercise.id,
						name: exercise.name,
						sets: exercise.sets,
					})
				}
			})
		})

		return uniqueExercises
	}

	useEffect(() => {
		if (!selectedExercise) {
			return
		}

		const highestWeightForRep: { [key: string]: number } =
			selectedExercise.sets.reduce((acc, set) => {
				if (set.reps in acc) {
					if (set.weight > acc[set.reps]) {
						acc[set.reps] = set.weight

						return acc
					}
				} else {
					acc[set.reps] = set.weight || 0
				}

				return acc
			}, {})

		let formattedHighestWeightsForReps: { reps: number; weight: number }[] = []

		for (const [key, value] of Object.entries(highestWeightForRep)) {
			formattedHighestWeightsForReps.push({
				reps: Number(key),
				weight: value,
			})
		}

		setChartData(
			formattedHighestWeightsForReps.sort((a, b) => a.weight - b.weight),
		)
	}, [selectedExercise])

	return (
		<Page>
			<h1>
				{profile?.first_name} {profile?.last_name}
			</h1>
			<Separator />
			<div className='mt-5'>
				<Select
					onValueChange={(value) =>
						setSelectedExercise(
							uniqueExercises.find((exercise) => value === exercise.id),
						)
					}
				>
					<SelectTrigger>
						<SelectValue placeholder='Pick an Exercise' />
					</SelectTrigger>
					<SelectContent>
						{uniqueExercises.map((exercise) => {
							return (
								<SelectItem key={exercise.id} value={exercise.id}>
									{exercise.name}
								</SelectItem>
							)
						})}
					</SelectContent>
				</Select>
				{selectedExercise && (
					<div>
						{!selectedExercise.sets.length && (
							<div>No Sets found for this exercise</div>
						)}
					</div>
				)}
				{chartData && (
					<ChartContainer
						config={chartConfig}
						className='min-h-[200px] w-full mt-5'
					>
						<ScatterChart accessibilityLayer data={chartData}>
							<XAxis
								dataKey='weight'
								tickLine={false}
								tickMargin={10}
								axisLine={false}
							/>
							<YAxis dataKey='reps' />
							<Scatter dataKey='reps' fill='var(--color-weight)' radius={4} />
						</ScatterChart>
					</ChartContainer>
				)}
			</div>
			<Separator />
			<h1 className='mt-5'>Hightlights</h1>
			<Input
				type='file'
				onChange={async (e) => {
					const file = e.target.files

					if (!file || !file.length) {
						return
					}

					const { data, error } = await supabase.storage
						.from('highlights')
						.upload(`${profile?.id}/${file[0].name}`, file[0])

					if (error) throw error

					console.log('File uploaded successfully:', data.path)
				}}
			/>
			{highlights.map((highlight) => {
					return (
						<video width='200' height='300' controls>
							<source src={highlight} type='video/mp4' />
							Your browser does not support the video tag.
						</video>
					)
				})}
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
