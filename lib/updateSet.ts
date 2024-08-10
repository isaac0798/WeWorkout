import { WorkoutData } from "@/pages";

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

export default updateSet;