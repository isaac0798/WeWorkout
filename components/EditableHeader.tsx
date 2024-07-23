import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";

interface EditableHeaderProps {
	initialText: string;
	onSave: (newText: string) => void;
}

export function EditableHeader({ initialText, onSave }: EditableHeaderProps) {
	const [isEditing, setIsEditing] = useState(false);

	const handleSave = () => {
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
				<Button onClick={handleSave}>Save</Button>
			) : (
				<Button variant='ghost' size='icon' onClick={() => setIsEditing(true)}>
					<i className='bi bi-pencil'></i>
				</Button>
			)}
			<Button variant='ghost' size='icon' onClick={() => console.log('load templates')}>
				<i className='bi bi-cloud-arrow-down'></i>
			</Button>
		</div>
	)
}
