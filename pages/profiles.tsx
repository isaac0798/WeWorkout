import Page from "@/components/page";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { createFEClient } from "@/utils/supabase/component";
import { createClient } from "@/utils/supabase/server-props";
import type { User } from "@supabase/supabase-js";
import type { GetServerSidePropsContext } from "next";
import { useEffect, useState } from "react";
import {
	CartesianGrid,
	Legend,
	Scatter,
	ScatterChart,
	XAxis,
	YAxis,
} from "recharts";

import { type ChartConfig, ChartContainer } from "@/components/ui/chart";

interface Workout {
	id: string;
	name: string;
	date: string;
	exercises: Array<{
		id: string;
		name: string;
		sets: Array<{
			id: string;
			weight: number;
			reps: number;
			completed: boolean;
		}>;
	}>;
}

interface Exercise {
	id: string;
	name: string;
}

const Index = ({ user }: { user: User }) => {
	const supabase = createFEClient();
	const [profile, setProfile] = useState<{
		id: string;
		first_name: string;
		last_name: string;
	}>();

	const [workouts, setWorkouts] = useState<Workout[]>([]);
	const [uniqueExercises, setUniqueExericses] = useState<Exercise[]>([]);
	const [selectedExercise, setSelectedExercise] = useState<Exercise>();
	const [chartData, setChartData] =
		useState<{ date: string; weight: string }[]>();

	const chartConfig = {
		weight: {
			label: "Weight",
			color: "#2563eb",
		},
	} satisfies ChartConfig;

	useEffect(() => {
		supabase
			.from("profiles")
			.select()
			.eq("id", user.id)
			.single()
			.then(({ data, error }) => {
				if (error) {
					console.error("error fetching profile:", error);
				}

				setProfile(data);
			});

		const fetchUserWorkouts = async (userId: string) => {
			const { data, error } = await supabase
				.from("Workout")
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
				.eq("user_id", userId)
				.order("date", { ascending: true });

			if (error) {
				console.error("Error fetching workouts:", error);
				throw error;
			}

			const formattedWorkouts = data.map((workout) => ({
				id: workout.id,
				name: workout.name,
				date: workout.date,
				exercises: workout.WorkoutExercise.map((we: any) => ({
					id: we.Exercise.id,
					name: we.Exercise.name,
					sets: we.Sets,
				})),
			}));

			return formattedWorkouts;
		};

		try {
			fetchUserWorkouts(user.id).then((workouts) => {
				setWorkouts(workouts);
				setUniqueExericses(getUniqueExercises(workouts));
			});
		} catch (error) {
			console.error("Failed to fetch workouts:", error);
		}
	}, []);

	function getUniqueExercises(workouts: Workout[]): Exercise[] {
		const exerciseSet = new Set<string>();
		const uniqueExercises: Exercise[] = [];

		workouts.forEach((workout) => {
			workout.exercises.forEach((exercise) => {
				if (!exerciseSet.has(exercise.id)) {
					exerciseSet.add(exercise.id);
					uniqueExercises.push({
						id: exercise.id,
						name: exercise.name
					});
				}
			});
		});

		return uniqueExercises;
	}

	useEffect(() => {
		if (!selectedExercise) {
			return;
		}

		const formattedHighestWeightsForExerciseInWorkout: {
			date: string
			weight: string
		}[] = []

		workouts.forEach(workout => {
			let highestWeight = 0;

			workout.exercises.find((exercise) => {
				if (exercise.id !== selectedExercise.id) {
					return
				}

				exercise.sets.forEach(set => {
					if (set.weight > highestWeight && set.completed) {
						highestWeight = set.weight
					}
				});

			})

			if (!highestWeight) {
				return;
			}

			formattedHighestWeightsForExerciseInWorkout.push(
				{
					date: workout.date,
					weight: String(highestWeight)
				}
			)
		})

		setChartData(formattedHighestWeightsForExerciseInWorkout)
	}, [selectedExercise]);

	return (
		<Page>
			<h2>Strength Tracker</h2>
			<div>
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
				{chartData && (
					<ChartContainer
						config={chartConfig}
						className='min-h-[200px] w-full mt-5'
					>
						<ScatterChart accessibilityLayer data={chartData}>
							<CartesianGrid strokeDasharray='3 3' />
							<XAxis
								dataKey='date'
								tickLine={false}
								tickMargin={10}
								axisLine={false}
								label={'Date'}
							/>
							<YAxis dataKey='weight' label={'Weight'} tickMargin={5}/>
							<Scatter dataKey='reps' fill='var(--color-weight)' radius={4} />
							<Legend />
						</ScatterChart>
					</ChartContainer>
				)}
			</div>
		</Page>
	)
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
	const supabase = createClient(context);

	const { data, error } = await supabase.auth.getUser();

	if (error || !data) {
		return {
			redirect: {
				destination: "/login",
				permanent: false,
			},
		};
	}

	return {
		props: {
			user: data.user,
		},
	};
}

export default Index;
