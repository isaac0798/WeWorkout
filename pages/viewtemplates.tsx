import Page from "@/components/page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { createFEClient } from "@/utils/supabase/component";
import { createClient } from "@/utils/supabase/server-props";
import type { User } from "@supabase/supabase-js";
import { GetServerSideProps, type GetServerSidePropsContext } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import type { Exercise } from ".";

export interface Template {
	id: string;
	name: string;
	exercises: Exercise[];
}

const TEMPLATES: Template[] = [];

const defaultTemplate = {
	name: "New Workout",
	exercises: [],
};

export default function PublicPage({ user }: { user: User }) {
	const supabase = createFEClient();

	const [allExercises, setAllExercises] = useState<
		{ id: string; name: string }[]
	>([]);

	/* 	const [isSuccess, setIsSuccess] = useState(false);

	const [templateName, setTemplateName] = useState("");
	const [selectedExercises, setSelectedExercises] = useState<string[]>([]); */

	const [templates, setTemplates] = useState<Template[]>([]);

	/* 	const handleAddExercise = (exerciseId: string) => {
		setSelectedExercises([...selectedExercises, exerciseId]);
	};

	const handleRemoveExercise = (id: string) => {
		setSelectedExercises(
			selectedExercises.filter((exercise) => exercise !== id),
		);
	};

	const handleCreateTemplate = async () => {
		// Here you would call your backend to create the template
		console.log("Creating template:", {
			name: templateName,
			exercises: selectedExercises,
		});

		if (!templateName || !selectedExercises.length) {
			return;
		}

		const newTemplate = {
			userId: user.id,
			templateId: uuidv4(),
			name: templateName,
			exercises: selectedExercises,
		};

		const { data, error } = await supabase.functions.invoke("upsert-template", {
			body: JSON.stringify(newTemplate),
		});

		if (error) throw error;
		setIsSuccess(true);
		setTimeout(() => {
			setIsSuccess(false);
			setTemplateName("");
			setSelectedExercises([]);
		}, 2000);
	}; */

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
			const { data, error } = await supabase.rpc("get_templates_for_user", {
				p_user_id: user.id,
			});

			if (error) {
				console.log(error);

				return;
			}

			setTemplates(data);
		}

		getAllTemplatesForUser();
	}, []);

	return (
		<Page>
			<div className="flex flex-col justify-between">
				<h1>Existing Templates:</h1>
				<div className="flex flex-col">
					{templates?.map((template, i) => {
						return (
							<div className="mt-5">
								<div className="flex items-center">
									{i + 1}. {template.name}
									<Button className="w-2/5" variant="ghost" size="icon">
										<i className="bi bi-pencil">
											<Link href={`/templates/${template.id}`}>
												Edit Template
											</Link>
										</i>
									</Button>
								</div>
								<div className="flex">
									{template?.exercises?.map((exercise) => (
										<div className="flex">
											<div>{exercise.name}</div>
											<Separator className="mx-4" orientation="vertical" />
										</div>
									))}
								</div>
							</div>
						);
					})}
					<Button className="mt-5" variant="link">
						<Link href="/templates">Back</Link>
					</Button>
				</div>
			</div>
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
