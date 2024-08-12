import React, { useState, useCallback, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import handleSave from '@/lib/saveWorkout'

const DebouncedTextarea = ({initalValue, workout, user}) => {
  const [value, setValue] = useState(initalValue)

	const handleDebouncedChange = (text) => {
		console.log('User finished typing:', text)
    handleSave({...workout, notes: text}, (p) => console.log('p', p), user)
	}

	// Debounce function
	const debounce = (func, wait) => {
		let timeout
		return (...args) => {
			clearTimeout(timeout)
			timeout = setTimeout(() => func(...args), wait)
		}
	}

	const debouncedCallback = useCallback(
		debounce(handleDebouncedChange, 1000),
		[],
	)

	useEffect(() => {
		debouncedCallback(value)
	}, [value, debouncedCallback])

	return (
		<Textarea
			value={value}
			onChange={(e) => setValue(e.target.value)}
			placeholder='Lets add a note!'
			rows={10}
		/>
	)
}

export default DebouncedTextarea
