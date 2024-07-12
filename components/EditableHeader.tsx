import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";

interface EditableHeaderProps {
	initialText: string;
	onSave: (newText: string) => void;
}

export function EditableHeader({ initialText, onSave }: EditableHeaderProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [text, setText] = useState(initialText);

	const handleSave = () => {
		onSave(text);
		setIsEditing(false);
	};

	return (
		<div className="flex items-center bg-black-100">
			{isEditing ? (
				<div className="mr-2">
					<Input
						value={text}
						onChange={(e) => setText(e.target.value)}
						className="text-2xl font-bold"
					/>
				</div>
			) : (
				<h1 className="text-2xl font-bold">{text}</h1>
			)}

			{isEditing ? (
				<Button onClick={handleSave}>Save</Button>
			) : (
				<Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
					<i className="bi bi-pencil"></i>
				</Button>
			)}
		</div>
	);
}
