import { createFEClient } from "@/utils/supabase/component";

const supabase = createFEClient();

const handleSave = async (workout, isSuccessFN, user) => {
	const unFilledExercise = workout.exercises?.some(
		(exercise) => exercise.name === "N/A",
	);
	if (unFilledExercise) {
		alert("Fill in all exercises pls");
		return;
	}

	try {
		const { data, error } = await supabase.functions.invoke("insert_workout", {
			body: JSON.stringify({
				workoutData: workout,
				userId: user.id,
			}),
		});

		if (error) throw error;

		console.log("Success:", data);
		isSuccessFN(true);
		setTimeout(() => isSuccessFN(false), 2000); // Reset after 2 seconds
	} catch (error) {
		console.error("Error:", error);
	}
};

export default handleSave;
