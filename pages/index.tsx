import Page from "@/components/page";
import Section from "@/components/section";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { createFEClient } from "@/utils/supabase/component";
import { createClient } from "@/utils/supabase/server-props";
import type { User } from "@supabase/supabase-js";
import type { GetServerSidePropsContext } from "next";
import { useState } from "react";
import { Suspense } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

import { DynamicSelect } from "@/components/DynamicSelect";
import { EditableHeader } from "@/components/EditableHeader";
import SaveButton from "@/components/SaveWorkoutButton";
import SetInput from "@/components/SetInput";
import { Checkbox } from "@/components/ui/checkbox";
import getAllExercisesForUser from "@/lib/getAllExerciseForUsers";
import removeExercise from "@/lib/removeExercise";
import type { Template } from "./templates";

const defaultWorkoutData: WorkoutData = {
	id: uuidv4(),
	name: "New Workout",
	date: new Date().toISOString().split("T")[0], // Today's date in YYYY-MM-DD format
	exercises: [],
};

export interface ExerciseSet {
	id: string;
	weight: number;
	reps: number;
	isChecked: boolean;
}

export interface Exercise {
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

	const [templates, setTemplates] = useState<Template[]>([]);

	function updateSet(
		workoutData: WorkoutData,
		exerciseId: string,
		setIndex: number,
		field: "weight" | "reps",
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
		};
	}

	const addSetToExercise = (exerciseId: string, newSet: ExerciseSet) => {
		setWorkout((prevState) => {
			const updatedExercises = prevState?.exercises.map((exercise) => {
				if (exercise.id === exerciseId) {
					const updatedSets = [...exercise.sets, newSet];
					return { ...exercise, sets: updatedSets };
				}
				return exercise;
			});
			return { ...prevState, exercises: updatedExercises };
		});
	};

	const removeSetFromExercise = (exerciseId: string, setIndex: number) => {
		setWorkout((prevState) => {
			if (!prevState) return prevState; // Handle case where prevState is null or undefined

			const updatedExercises = prevState.exercises.map((exercise) => {
				if (exercise.id === exerciseId) {
					const updatedSets = exercise.sets.filter(
						(_, index) => index !== setIndex,
					);
					return { ...exercise, sets: updatedSets };
				}
				return exercise;
			});

			return { ...prevState, exercises: updatedExercises };
		});
	};

	useEffect(() => {
		supabase
			.from("Exercise")
			.select("id, name")
			.order("name")
			.then(({ data, error }) => {
				if (error) {
					console.error("Error fetching exercises:", error);
					throw error;
				}
				setAllExercises(data);
			});

		async function getAllTemplatesForUser() {
			const { data, error } = await supabase.rpc("get_templates_for_user", {
				p_user_id: user.id,
			});

			if (error) {
				console.log(error);

				return;
			}

			setTemplates(data);
		}

		getAllTemplatesForUser();
	}, []);

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

			if (!data.workout) {
				setWorkout(defaultWorkoutData);

				return;
			}

			setWorkout(data.workout);
		}

		getWorkoutForDate();
	}, [date]);

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
			<Suspense fallback={<h1>Loading....</h1>}>
				<Section>
					<EditableHeader
						initialText={workout?.name || "New Workout"}
						onSave={(newWorkoutName) => {
							setWorkout({
								...workout,
								name: newWorkoutName,
							});
						}}
						templates={templates}
						setWorkout={setWorkout}
						workout={workout}
					/>
					{workout?.exercises?.map((exercise) => {
						return (
							<>
								<div className="mt-5" key={exercise.id}>
									<div className="flex">
										<DynamicSelect
											options={allExercises}
											placeholder={exercise.name}
											onAddOption={(newExercise) => {
												setAllExercises([...allExercises, newExercise]);
											}}
											onSelect={(value) => {
												const newExercises = workout.exercises.map(
													(exercise) => {
														if (exercise.name === "N/A") {
															exercise.name = value;
														}

														return exercise;
													},
												);

												setWorkout({ ...workout, exercises: newExercises });
											}}
										/>
										<Button
											variant="ghost"
											size="icon"
											className="ml-5"
											onClick={() => handleRemoveExercise(exercise.id)}
										>
											<i className="bi bi-trash3"></i>
										</Button>
									</div>

									{exercise.sets.map((set, i) => {
										return (
											<SetInput
												key={set.id}
												set={set}
												i={i}
												updateSet={updateSet}
												workout={workout}
												setWorkout={setWorkout}
												exercise={exercise}
												removeSetFromExercise={removeSetFromExercise}
											/>
										);
									})}

									<Button
										className="mt-5"
										onClick={() => {
											const newSet = {
												id: uuidv4(),
												weight: 0,
												reps: 0,
												isChecked: false,
											};

											addSetToExercise(exercise.id, newSet);
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
							if (!workout) {
								setWorkout(defaultWorkoutData);

								return;
							}

							const unFilledExercise = workout.exercises?.some(
								(exercise) => exercise.name === "N/A",
							);

							if (unFilledExercise) {
								alert("Fill in all exercises pls before adding more");

								return;
							}

							setWorkout({
								...workout,
								exercises: [
									...workout.exercises,
									{
										id: uuidv4(),
										name: "N/A",
										sets: [
											{ id: uuidv4(), weight: 0, reps: 0, isChecked: false },
										],
									},
								],
							});
						}}
					>
						Add Exercise
					</Button>
					<SaveButton workout={workout} user={user} supabase={supabase} />
				</Section>
			</Suspense>
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
