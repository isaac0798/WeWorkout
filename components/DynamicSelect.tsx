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
	const [newOptionName, setNewOptionName] = useState("");

	const handleAddOption = () => {
		if (newOptionName.trim()) {
			const newOption = {
				id: uuidv4(),
				name: newOptionName.replace(/\s+/g, "-"),
			};

			addExerciseToSupabase(newOption.name);
			onAddOption(newOption);
		}
	};

	return (
		<div className="space-y-2 w-3/5">
			<Select onValueChange={onSelect}>
				<SelectTrigger>
					<SelectValue placeholder={placeholder} />
				</SelectTrigger>
				<SelectContent>
					{options.map((option) => (
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
									value={newOptionName}
									onChange={(e) => setNewOptionName(e.target.value)}
									placeholder="New option name"
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
