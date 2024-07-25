import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { addExerciseToSupabase } from "@/lib/addExerciseToDB";
import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";

interface Option {
	name: string;
	id: string;
}

interface DynamicSelectProps {
	options: Option[];
	onAddOption: (newOption: Option) => void;
	onSelect?: (value: string) => void;
	placeholder?: string;
}

export function DynamicSelect({
	options,
	onAddOption,
	onSelect,
	placeholder = "Select an option",
}: DynamicSelectProps) {
	const handleAddOption = async () => {
		const newOptionName = (
			document.getElementById("newExerciseName") as HTMLInputElement
		).value;
		if (newOptionName.trim()) {
			const newOption = {
				id: uuidv4(),
				name: newOptionName.replace(/\s+/g, "-"),
			};

			const { error } = await addExerciseToSupabase(newOption.name);
			if (!error) {
				onAddOption(newOption);
			} else {
				alert("Exercise exists");
			}
		}
	};

	return (
		<div className="space-y-2 w-3/5">
			<Select onValueChange={onSelect}>
				<SelectTrigger>
					<SelectValue placeholder={placeholder} />
				</SelectTrigger>
				<SelectContent>
					{options
						.filter((option) => option.name !== placeholder)
						.map((option) => (
							<SelectItem key={option.name} value={option.name}>
								{option.name}
							</SelectItem>
						))}
					<Popover>
						<PopoverTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="w-full justify-start"
							>
								<i className="bi bi-plus-lg"></i>
								Add New
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-80">
							<div className="flex flex-col space-y-2">
								<Input
									id="newExerciseName"
									placeholder="New option name"
									onKeyDown={(e) => e.stopPropagation()}
								/>
								<Button onClick={handleAddOption}>Add</Button>
							</div>
						</PopoverContent>
					</Popover>
				</SelectContent>
			</Select>
		</div>
	);
}
