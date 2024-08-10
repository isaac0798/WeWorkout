const removeSetFromExercise = (exerciseId: string, setIndex: number, setWorkout) => {
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

export default removeSetFromExercise