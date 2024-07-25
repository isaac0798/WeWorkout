import { createFEClient } from "@/utils/supabase/component";

export async function addExerciseToSupabase(
	exerciseName: string,
): Promise<{ data: any; error: any }> {
	const supabase = createFEClient();

	const { data, error } = await supabase
		.from("Exercise")
		.insert({ name: exerciseName })
		.select()
		.single();

	return { data, error };
}
