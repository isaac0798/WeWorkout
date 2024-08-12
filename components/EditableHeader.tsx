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
import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import handleSave from "@/lib/saveWorkout";
import { User } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";

interface EditableHeaderProps {
	initialText: string;
	onSave: (newText: string) => void;
	templates: Template[];
	setWorkout: any;
	workout: WorkoutData;
	user: User;
}

export function EditableHeader({
	initialText,
	onSave,
	templates,
	setWorkout,
	workout,
	user
}: EditableHeaderProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false)

	const saveName = () => {
		onSave((document.getElementById("workoutName") as HTMLInputElement).value);
		setIsEditing(false);
	};

	return (
		<div className='flex items-center bg-black-100'>
			{isEditing ? (
				<div className='mr-2'>
					<Input
						id='workoutName'
						defaultValue={initialText}
						className='text-2xl font-bold'
					/>
				</div>
			) : (
				<h1 className='text-2xl font-bold'>{initialText}</h1>
			)}

			{isEditing ? (
				<Button onClick={saveName}>Save</Button>
			) : (
				<Button variant='ghost' size='icon' onClick={() => setIsEditing(true)}>
					<i className='bi bi-pencil'></i>
				</Button>
			)}
			<Popover>
				<PopoverTrigger>
					<i className='bi bi-cloud-arrow-down'></i>
				</PopoverTrigger>
				<PopoverContent className='w-80'>
					<Card>
						<CardHeader>
							<CardTitle>Templates</CardTitle>
							<CardDescription>List of all your templates</CardDescription>
						</CardHeader>
						<CardContent>
							{templates.map((template) => (
								<Button
									className='my-2'
									key={template.id}
									variant='outline'
									onClick={() => {
										const exercises = template.exercises.map((exercise) => {
											return {
												id: uuidv4(),
												name: exercise.name,
												sets: [],
											}
										})

										setWorkout({
											...workout,
											name: template.name,
											exercises: exercises,
										})
									}}
								>
									Load: {template.name}
								</Button>
							))}
						</CardContent>
					</Card>
				</PopoverContent>
			</Popover>
			<Button
				variant='ghost'
				size='icon'
				className={cn(
					'ml-5 transition-colors duration-300',
					isSuccess && 'bg-green-500 hover:bg-green-600',
				)}
				onClick={() =>
					handleSave(
						workout,
						(p) => {
							setIsSuccess(p)
						},
						user,
					)
				}
			>
				<i className='bi bi-floppy'></i>
			</Button>
		</div>
	)
}
