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
	sets: {
		id: string;
		weight: number;
		reps: number;
		completed: boolean;
	}[];
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
	console.log(selectedExercise);

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
				.order("date", { ascending: false });

			if (error) {
				console.error("Error fetching workouts:", error);
				throw error;
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
			}));

			return formattedWorkouts;
		};

		// Usage
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
						name: exercise.name,
						sets: exercise.sets,
					});
				}
			});
		});

		return uniqueExercises;
	}

	return (
		<Page>
			<h1>
				{profile?.first_name} {profile?.last_name}
			</h1>
			<div>
				<h1>Rep Max Finder: </h1>
				<Select
					onValueChange={(value) =>
						setSelectedExercise(
							uniqueExercises.find((exercise) => value === exercise.id),
						)
					}
				>
					<SelectTrigger>
						<SelectValue placeholder="Pick an Exercise" />
					</SelectTrigger>
					<SelectContent>
						{uniqueExercises.map((exercise) => {
							return (
								<SelectItem value={exercise.id}>{exercise.name}</SelectItem>
							);
						})}
					</SelectContent>
				</Select>
				{/*         {getUniqueExercises(workouts).map((exercise) => {
          console.log(exercise)
          return (
             <Select
              value={exercise.id}
              key={exercise.id}
              onValueChange={(value) => {
                console.log(value)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={exercise.name}/>
              </SelectTrigger>
              <SelectContent>
                 <Select
                  value={String(Math.min(...exercise.sets.map(set => set.reps)))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={String(Math.min(...exercise.sets.map(set => set.reps)))} />
                  </SelectTrigger>
                  <SelectContent>
                    {exercise.sets.map(set => set.reps).filter(function(item, pos, self) {
                      return self.indexOf(item) == pos;
                    }).map((rep) => {
                      return (
                        <SelectItem value={String(rep)} key={rep}>
                          {rep}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                 </Select>
              </SelectContent>
            </Select>
          )
        })} */}
				<h1>Reps:</h1>
				{selectedExercise && (
					<div>
						{!selectedExercise.sets.length && (
							<div>No Sets found for this exercise</div>
						)}
						{Object.entries(
							selectedExercise.sets.reduce((acc, set) => {
								if (set.reps in acc) {
									if (set.weight > acc[set.reps]) {
										acc[set.reps] = set.weight;

										return acc;
									}
								} else {
									acc[set.reps] = set.weight || 0;
								}

								return acc;
							}, {}),
						).map(([rep, weight]) => {
							return (
								<div className="flex flex-col">
									<div>Rep: {rep}</div>
									<div>Weight: {weight}</div>
								</div>
							);
						})}
					</div>
				)}
			</div>
		</Page>
	);
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
