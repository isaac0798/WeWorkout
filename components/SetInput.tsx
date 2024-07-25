import { cn } from "@/lib/utils";
import type { Exercise, ExerciseSet, WorkoutData } from "@/pages";
import { useState } from "react";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const SetInput = ({
	set,
	i,
	updateSet,
	workout,
	exercise,
	setWorkout,
	removeSetFromExercise,
}: {
	set: ExerciseSet;
	i: number;
	updateSet: any;
	workout: WorkoutData;
	exercise: Exercise;
	setWorkout: any;
	removeSetFromExercise: any;
}) => {
	const [checked, setIsChecked] = useState(set.isChecked);

	return (
		<div className="flex items-center mt-5" key={set.id}>
			<div className="flex flex-col justify-center items-start w-1/3 pr-5">
				<Label htmlFor="reps">Reps</Label>
				<Input
					className={cn(
						"mt-2",
						!checked ? "border-red-700" : "border-green-600",
					)}
					value={set.reps}
					onChange={(e) => {
						const newWorkout = updateSet(
							workout,
							exercise.id,
							i,
							"reps",
							e.target.value,
						);
						setWorkout(newWorkout);
					}}
				/>
			</div>
			<div className="flex flex-col justify-center items-start w-1/3 pr-5">
				<Label htmlFor="weights">Weight</Label>
				<Input
					className={cn(
						"mt-2",
						!checked ? "border-red-700" : "border-green-600",
					)}
					value={set.weight}
					onChange={(e) => {
						const newWorkout = updateSet(
							workout,
							exercise.id,
							i,
							"weight",
							e.target.value,
						);
						setWorkout(newWorkout);
					}}
				/>
			</div>
			<Button
				variant="ghost"
				size="icon"
				className="mt-5"
				onClick={() => removeSetFromExercise(exercise.id, i)}
			>
				<i className="bi bi-trash3"></i>
			</Button>
			<Checkbox
				checked={checked}
				onCheckedChange={(checked) => {
					const newWorkout = updateSet(
						workout,
						exercise.id,
						i,
						"isChecked",
						checked,
					);
					setWorkout(newWorkout);
					setIsChecked(checked as boolean);
				}}
				className="mt-5 ml-5"
				id="terms"
			/>
		</div>
	);
};

export default SetInput;
