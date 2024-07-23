import Page from "@/components/page";
import { Button } from "@/components/ui/button";
import { createFEClient } from "@/utils/supabase/component";
import { createClient } from "@/utils/supabase/server-props";
import { GetServerSideProps, type GetServerSidePropsContext } from "next";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import type { Exercise } from ".";
import { User } from "@supabase/supabase-js";

export interface Template {
	id: string;
	name: string;
	exercise: Exercise[];
}

let TEMPLATES: Template[] = [];

const defaultTemplate = {
	name: "New Workout",
	exercises: [],
};

export default function PublicPage({ user }: { user: User }) {
	const supabase = createFEClient();

	const [allExercises, setAllExercises] = useState<
		{ id: string; name: string }[]
	>([]);

	const [templates, setTemplates] = useState([]);

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
				onClick={async () => {
          console.log('template')
          const { data, error } = await supabase.functions.invoke(
						'upsert-template',
						{
							body: JSON.stringify({
								userId: user.id,
							}),
						},
					)
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
