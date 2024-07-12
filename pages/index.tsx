import type { User } from "@supabase/supabase-js";
import type { GetServerSidePropsContext } from "next";
import { useState } from "react";

import Page from "@/components/page";
import Section from "@/components/section";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { createFEClient } from "@/utils/supabase/component";
import { createClient } from "@/utils/supabase/server-props";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

import { EditableHeader } from "@/components/EditableHeader";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import getAllExercisesForUser from "@/lib/getAllExerciseForUsers";
import removeExercise from "@/lib/removeExercise";

const defaultWorkoutData: WorkoutData = {
	id: uuidv4(),
	name: "New Workout",
	date: new Date().toISOString().split("T")[0], // Today's date in YYYY-MM-DD format
	exercises: [
		{
			id: uuidv4(),
			name: "N/A",
			sets: [{ id: uuidv4(), weight: 0, reps: 0 }],
		},
	],
};

interface ExerciseSet {
	id: string;
	weight: number;
	reps: number;
}

interface Exercise {
	id: string;
	name: string;
	sets: ExerciseSet[];
}

export interface WorkoutData {
	id: string;
	name: string;
	date: string;
	exercises: Exercise[];
}

const Index = ({ user }: { user: User }) => {
	const supabase = createFEClient();
	const [date, setDate] = useState<Date | undefined>(new Date());
	const [workout, setWorkout] = useState<WorkoutData>(defaultWorkoutData);
	const [allExercises, setAllExercises] = useState<
		{ id: string; name: string }[]
	>([]);

	const addSetToExercise = (exerciseName: string, newSet: ExerciseSet) => {
		setWorkout((prevState) => {
			// Map over the exercises to find the one we want to update
			const updatedExercises = prevState?.exercises.map((exercise) => {
				if (exercise.name === exerciseName) {
					// Create a new sets array with the new set added
					console.log(exercise.sets);
					const updatedSets = [...exercise.sets, newSet];
					console.log(updatedSets);
					// Return the updated exercise object
					return { ...exercise, sets: updatedSets };
				}
				// Return the original exercise object if it doesn't match
				return exercise;
			});
			// Return the new state object with the updated exercises array
			return { ...prevState, exercises: updatedExercises };
		});
	};

	useEffect(() => {
		getAllExercisesForUser(user.id, supabase).then((res) =>
			setAllExercises(res),
		);
	}, []);

	console.log("all exercises", allExercises);

	useEffect(() => {
		async function getWorkoutForDate() {
			const { data, error } = await supabase.rpc(
				"get_workout_for_user_on_date",
				{
					p_user_id: user.id,
					p_date: date?.toDateString(),
				},
			);

			if (error) {
				console.error("Error fetching workout:", error);
				return defaultWorkoutData;
			}

			setWorkout(data.workout);
		}

		getWorkoutForDate();
	}, [date]);

	console.log("workout", workout);

	const handleRemoveExercise = (exerciseId: string) => {
		setWorkout((currentWorkout) => removeExercise(currentWorkout, exerciseId));
	};

	return (
		<Page>
			<Section>
				<Calendar
					mode="single"
					selected={date}
					onSelect={setDate}
					className="rounded-md border"
				/>
			</Section>
			<Section>
				{workout?.exercises?.map((exercise) => {
					return (
						<>
							<EditableHeader
								initialText={workout.name}
								onSave={(newWorkoutName) => {
									setWorkout({
										...workout,
										name: newWorkoutName,
									});
								}}
							/>
							<div className="mt-5" key={exercise.id}>
								<Select>
									<div className="flex">
										<SelectTrigger className="mr-5 w-[180px]">
											<SelectValue placeholder={exercise.name} />
										</SelectTrigger>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => handleRemoveExercise(exercise.id)}
										>
											<i className="bi bi-trash3"></i>
										</Button>
									</div>
									<SelectContent>
										{allExercises
											.filter((exercise) => exercise.name !== "New Exercise")
											.map((exercise, i) => (
												<SelectItem value={exercise.name} key={i}>
													{exercise.name}
												</SelectItem>
											))}
									</SelectContent>
								</Select>

								{exercise.sets.map((set) => {
									return (
										<div className="flex items-center mt-5" key={set.id}>
											<div className="flex flex-col justify-center items-start w-1/3 pr-5">
												<Label htmlFor="reps">Reps</Label>
												<Input className="mt-2" value={set.reps} />
											</div>
											<div className="flex flex-col justify-center items-start w-1/3 pr-5">
												<Label htmlFor="weights">Weight</Label>
												<Input className="mt-2" value={set.weight} />
											</div>
										</div>
									);
								})}

								<Button
									className="mt-5"
									onClick={() => {
										const newSet = { id: uuidv4(), weight: 0, reps: 0 };

										addSetToExercise(exercise.name, newSet);
									}}
								>
									Add Set
								</Button>
							</div>
						</>
					);
				})}
			</Section>
			<Section>
				<Button
					onClick={() => {
						const updateWorkoutData = (newData: Partial<WorkoutData>) => {
							setWorkout((currentData) => {
								if (!currentData) return defaultWorkoutData; // or provide a default WorkoutData object
								return {
									...currentData,
									...newData,
									name: newData.name || currentData.name,
									date: newData.date || currentData.date,
								};
							});
						};

						// Usage
						updateWorkoutData({
							exercises: [
								{
									id: uuidv4(),
									name: "N/A",
									sets: [{ id: uuidv4(), weight: 0, reps: 0 }],
								},
							],
						});
					}}
				>
					Add Exercise
				</Button>
				<Button
					className="ml-5"
					onClick={async () => {
						const { data, error } = await supabase.functions.invoke(
							"insert_workout",
							{
								body: JSON.stringify({
									workoutData: workout,
									userId: user.id,
								}),
							},
						);

						if (error) console.error("Error:", error);
						else console.log("Success:", data);
					}}
				>
					Save
				</Button>
			</Section>
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

	const workoutDetails = await supabase
		.from("Workouts")
		.select()
		.eq("user_id", data.user?.id);

	console.log(workoutDetails);

	return {
		props: {
			user: data.user,
			workout: workoutDetails.data,
		},
	};
}

export default Index;
