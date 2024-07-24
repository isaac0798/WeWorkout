import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { WorkoutData } from "@/pages";
import type { Template } from "@/pages/templates";
import { createFEClient } from "@/utils/supabase/component";
import { User } from "@supabase/supabase-js";
import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Label } from "./ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface EditableHeaderProps {
	initialText: string;
	onSave: (newText: string) => void;
	templates: Template[];
	setWorkout: any;
	workout: WorkoutData;
}

export function EditableHeader({
	initialText,
	onSave,
	templates,
	setWorkout,
	workout,
}: EditableHeaderProps) {
	const supabase = createFEClient();
	const [isEditing, setIsEditing] = useState(false);

	const handleSave = () => {
		onSave((document.getElementById("workoutName") as HTMLInputElement).value);
		setIsEditing(false);
	};

	return (
		<div className="flex items-center bg-black-100">
			{isEditing ? (
				<div className="mr-2">
					<Input
						id="workoutName"
						defaultValue={initialText}
						className="text-2xl font-bold"
					/>
				</div>
			) : (
				<h1 className="text-2xl font-bold">{initialText}</h1>
			)}

			{isEditing ? (
				<Button onClick={handleSave}>Save</Button>
			) : (
				<Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
					<i className="bi bi-pencil"></i>
				</Button>
			)}
			<Popover>
				<PopoverTrigger>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => console.log("load templates")}
					>
						<i className="bi bi-cloud-arrow-down"></i>
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-80">
					<Card>
						<CardHeader>
							<CardTitle>Templates</CardTitle>
							<CardDescription>List of all your templates</CardDescription>
						</CardHeader>
						<CardContent>
							{templates.map((template) => (
								<Button
									variant="outline"
									onClick={() => {
										const exercises = template.exercises.map((exercise) => {
											return {
												id: uuidv4(),
												name: exercise.name,
												sets: [],
											};
										});

										setWorkout({
											...workout,
											name: template.name,
											exercises: exercises,
										});
									}}
								>
									Load: {template.name}
								</Button>
							))}
						</CardContent>
					</Card>
				</PopoverContent>
			</Popover>
		</div>
	);
}
