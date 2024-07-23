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
	exercises: Exercise[];
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

	const [templates, setTemplates] = useState<Template[]>([]);

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

      async function getAllTemplatesForUser() {
        const { data, error} =
					await supabase.rpc('get_templates_for_user', {
						p_user_id: user.id,
					})

        if (error) {
          console.log(error)

          return;
        }

        setTemplates(data)
      }

      getAllTemplatesForUser();
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
                templateId: uuidv4(),
                name: 'test-templates',
                exercises: allExercises.map(exercise => exercise.id)
							}),
						},
					)
				}}
			>
				Add New Template
			</Button>
			<p>Existing Templates:</p>
			{templates.map((template, i) => {
				return (
          <>
            <div>Template: {template.name}</div>
            {template.exercises.map(template => <div>{template.name}</div>)}
          </>
        )
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
