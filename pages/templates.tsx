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
import { createFEClient } from "@/utils/supabase/component";
import { createClient } from "@/utils/supabase/server-props";
import type { User } from "@supabase/supabase-js";
import { GetServerSideProps, type GetServerSidePropsContext } from "next";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import type { Exercise } from ".";
import { cn } from "@/lib/utils";

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


	const [isSuccess, setIsSuccess] = useState(false);

	const [templateName, setTemplateName] = useState("");
	const [selectedExercises, setSelectedExercises] = useState<string[]>([]);

	const [templates, setTemplates] = useState<Template[]>([]);

	const handleAddExercise = (exerciseId: string) => {
		setSelectedExercises([...selectedExercises, exerciseId]);
	};

	const handleRemoveExercise = (index: number) => {
		setSelectedExercises(selectedExercises.filter((_, i) => i !== index));
	};

	const handleCreateTemplate = async () => {
		// Here you would call your backend to create the template
		console.log("Creating template:", {
			name: templateName,
			exercises: selectedExercises,
		});

    const newTemplate = {
			userId: user.id,
			templateId: uuidv4(),
			name: templateName,
			exercises: selectedExercises,
		}

     const { data, error } = await supabase.functions.invoke(
				'upsert-template',
				{
					body: JSON.stringify(newTemplate),
				},
			)

        if (error) throw error;
        setIsSuccess(true)
				setTimeout(() => setIsSuccess(false), 2000) 
	};

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
			<h1>Templates</h1>
			<div className='flex justify-between'>
				<div className='flex flex-col'>
					<Input
						placeholder='Template Name'
						value={templateName}
						onChange={(e) => setTemplateName(e.target.value)}
					/>
					{selectedExercises.map((exerciseId, index) => (
						<div key={index} className='flex items-center space-x-2'>
							<Select
								value={exerciseId}
								onValueChange={(value) => {
									const newExercises = [...selectedExercises]
									newExercises[index] = value
									setSelectedExercises(newExercises)
								}}
							>
								<SelectTrigger className='w-[180px] mt-5'>
									<SelectValue placeholder='Pick an Exercise' />
								</SelectTrigger>
								<SelectContent>
									{allExercises.map((exercise) => {
										return (
											<SelectItem value={exercise.id}>
												{exercise.name}
											</SelectItem>
										)
									})}
								</SelectContent>
							</Select>
						</div>
					))}
					<Button
						variant='outline'
						onClick={() => handleAddExercise('')}
						className='w-full my-5'
					>
						Add Exercise
					</Button>
					<Button
						className={cn(
							'transition-colors duration-300',
							isSuccess && 'bg-green-500 hover:bg-green-600',
						)}
						onClick={handleCreateTemplate}
					>
						Save
					</Button>
				</div>
				<div>
					<h1>Existing Templates:</h1>
					{templates?.map((template, i) => {
						return (
							<>
								<div>
									{i + 1}. {template.name}
								</div>
								<div className='flex'>
									{template?.exercises?.map((exercise) => (
										<div className='flex'>
											<div>{exercise.name}</div>
											<Separator className='mx-4' orientation='vertical' />
										</div>
									))}
								</div>
							</>
						)
					})}
				</div>
			</div>
		</Page>
	)
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
