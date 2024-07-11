async function getAllExercisesForUser(userId, supabase): Promise<string[]> {
  const { data, error } = await supabase
    .from('Workout')
    .select(`
      id,
      WorkoutExercise (
        exercise_id,
        Exercise (
          id,
          name
        )
      )
    `)
    .eq('user_id', userId)

  if (error) {
    console.error('Error fetching exercises:', error)
    return null
  }

  // Extract unique exercises
  const uniqueExercises = new Map()
  data.forEach(workout => {
    workout.WorkoutExercise.forEach(we => {
      const exercise = we.Exercise
      if (!uniqueExercises.has(exercise.id)) {
        uniqueExercises.set(exercise.id, exercise)
      }
    })
  })

  return Array.from(uniqueExercises.values())
}

export default getAllExercisesForUser;