import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Define types
interface Set {
	weight: number
	reps: number
}

interface Exercise {
	name: string
	sets: Set[]
}

interface WorkoutData {
	name: string
	date: string
	exercises: Exercise[]
}

Deno.serve(async (req) => {
	// Create a Supabase client with the Admin key
	const supabaseClient = createClient(
		Deno.env.get('http://127.0.0.1:54321') ?? '',
		Deno.env.get('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU') ?? '',
	)

	if (req.method === 'OPTIONS') {
		return new Response('ok', {
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'POST, OPTIONS',
				'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
			}
		})
	}

	// Get the request body
	const { workoutData, userId } = await req.json()

	// Start a database transaction
	const { data, error } = await supabaseClient.rpc('insert_workout_data', {
		p_workout_data: workoutData,
		p_user_id: userId,
	})

	if (error) {
		return new Response(JSON.stringify({ error: error.message }), {
			status: 400,
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*', // Or your specific origin
				'Access-Control-Allow-Methods': 'POST, OPTIONS',
				'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
			},
		})
	}

	return new Response(JSON.stringify({ success: true, data }), {
		status: 200,
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*', // Or your specific origin
			'Access-Control-Allow-Methods': 'POST, OPTIONS',
			'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
			},
	})
})
