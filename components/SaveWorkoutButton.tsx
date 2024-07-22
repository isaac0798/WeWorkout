import { cn } from "@/lib/utils"; // Assuming you're using shadcn's utility for class merging
import { useState } from "react";
import { Button } from "./ui/button";

const SaveButton = ({ workout, user, supabase }) => {
	const [isSuccess, setIsSuccess] = useState(false);

	const handleSave = async () => {
		const unFilledExercise = workout.exercises?.some(
			(exercise) => exercise.name === "N/A",
		);
		if (unFilledExercise) {
			alert("Fill in all exercises pls");
			return;
		}

		try {
			const { data, error } = await supabase.functions.invoke(
				"insert_workout",
				{
					body: JSON.stringify({
						workoutData: workout,
						userId: user.id,
					}),
				},
			);

			if (error) throw error;

			console.log("Success:", data);
			setIsSuccess(true);
			setTimeout(() => setIsSuccess(false), 2000); // Reset after 2 seconds
		} catch (error) {
			console.error("Error:", error);
		}
	};

	return (
		<Button
			className={cn(
				"ml-5 transition-colors duration-300",
				isSuccess && "bg-green-500 hover:bg-green-600",
			)}
			onClick={handleSave}
		>
			{isSuccess ? "Saved!" : "Save"}
		</Button>
	);
};

export default SaveButton;
