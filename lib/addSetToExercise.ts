import { ExerciseSet } from "@/pages";

const addSetToExercise = (exerciseId: string, newSet: ExerciseSet, setWorkout) => {
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

export default addSetToExercise;