import { cn } from "@/lib/utils"; // Assuming you're using shadcn's utility for class merging
import { useState } from "react";
import { Button } from "./ui/button";
import handleSave from "@/lib/saveWorkout";

const SaveButton = ({ workout, user, supabase }) => {
	const [isSuccess, setIsSuccess] = useState(false);

	return (
		<Button
			className={cn(
				"ml-5 transition-colors duration-300",
				isSuccess && "bg-green-500 hover:bg-green-600",
			)}
			onClick={() => {
				handleSave(workout, setIsSuccess, user)
			}}
		>
			{isSuccess ? "Saved!" : "Save"}
		</Button>
	);
};

export default SaveButton;
