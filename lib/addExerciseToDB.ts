import { createFEClient } from "@/utils/supabase/component";


export async function addExerciseToSupabase(exerciseName: string) {
  const supabase = createFEClient();

  const { data, error } = await supabase
    .from('Exercise')
    .insert({ name: exerciseName })
    .select()
    .single()

  if (error) throw error
  return data
}