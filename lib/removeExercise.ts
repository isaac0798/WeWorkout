import type { WorkoutData } from "@/pages";

export default function removeExercise(
	workout: WorkoutData,
	exerciseIdToRemove: string,
): WorkoutData {
	return {
		...workout,
		exercises: workout.exercises.filter(
			(exercise) => exercise.id !== exerciseIdToRemove,
		),
	};
}
