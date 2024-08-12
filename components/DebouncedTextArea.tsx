import { Textarea } from "@/components/ui/textarea";
import handleSave from "@/lib/saveWorkout";
import React, { useState, useCallback, useEffect } from "react";

const DebouncedTextarea = ({ initalValue, workout, user, setWorkout }) => {
	const [value, setValue] = useState(initalValue);

	const handleDebouncedChange = (text) => {
		console.log("User finished typing:", text);
		handleSave({ ...workout, notes: text }, (p) => console.log("p", p), user);
		setWorkout({ ...workout, notes: text })
	};

	const debounce = (func, wait) => {
		let timeout;
		return (...args) => {
			clearTimeout(timeout);
			timeout = setTimeout(() => func(...args), wait);
		};
	};

	const debouncedCallback = useCallback(
		debounce(handleDebouncedChange, 1000),
		[],
	);

	useEffect(() => {
		debouncedCallback(value);
	}, [value, debouncedCallback]);

	return (
		<Textarea
			value={value}
			onChange={(e) => setValue(e.target.value)}
			placeholder="Lets add a note!"
			rows={10}
		/>
	);
};

export default DebouncedTextarea;
