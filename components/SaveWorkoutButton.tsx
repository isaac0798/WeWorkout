import handleSave from "@/lib/saveWorkout";
import { cn } from "@/lib/utils"; // Assuming you're using shadcn's utility for class merging
import { useState } from "react";
import { Button } from "./ui/button";

const SaveButton = ({ workout, user, supabase }) => {
	const [isSuccess, setIsSuccess] = useState(false);

	return (
		<Button
			className={cn(
				"ml-5 transition-colors duration-300",
				isSuccess && "bg-green-500 hover:bg-green-600",
			)}
			onClick={() => {
				handleSave({ ...workout, completed: true }, setIsSuccess, user);
			}}
		>
			{isSuccess ? "Completed!" : "Complete"}
		</Button>
	);
};

export default SaveButton;
