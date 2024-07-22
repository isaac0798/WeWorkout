import Page from "@/components/page";
import { Button } from "@/components/ui/button";
import { createFEClient } from "@/utils/supabase/component";
import { createClient } from "@/utils/supabase/server-props";
import { GetServerSideProps, type GetServerSidePropsContext } from "next";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import type { Exercise } from ".";

export interface Template {
	id: string;
	name: string;
	exercise: Exercise[];
}

const TEMPLATES: Template[] = [];

const defaultTemplate = {
	name: "New Workout",
	exercises: [],
};

export default function PublicPage({ data }: { data?: any[] }) {
	const supabase = createFEClient();

	const [allExercises, setAllExercises] = useState<
		{ id: string; name: string }[]
	>([]);

	const [templates, setTemplates] = useState(TEMPLATES);

	useEffect(() => {
		supabase
			.from("Exercise")
			.select("id, name")
			.order("name")
			.then(({ data, error }) => {
				if (error) {
					console.error("Error fetching exercises:", error);
					throw error;
				}
				setAllExercises(data);
			});
	}, []);

	return (
		<Page>
			<h1>Templates</h1>
			<Button
				onClick={() => {
					setTemplates([
						...templates,
						{
							id: uuidv4(),
							name: "New Template",
							exercise: [],
						},
					]);
				}}
			>
				Add New Template
			</Button>
			<p>Existing Templates:</p>
			{TEMPLATES.map((template, i) => {
				return <div>Template {i}</div>;
			})}
		</Page>
	);
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
	const supabase = createClient(context);

	const { data, error } = await supabase.auth.getUser();

	if (error || !data) {
		return {
			redirect: {
				destination: "/login",
				permanent: false,
			},
		};
	}

	return {
		props: {
			user: data.user,
		},
	};
}
