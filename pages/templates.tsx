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
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
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
import { addExerciseToSupabase } from "@/lib/addExerciseToDB";

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

	const handleRemoveExercise = (id: string) => {
		setSelectedExercises(
			selectedExercises.filter((exercise) => exercise !== id),
		);
	};

	const handleCreateTemplate = async () => {
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
	}, [isSuccess]);

	const handleAddOption = async () => {
		const newOptionName = (
			document.getElementById('newExerciseName') as HTMLInputElement
		).value
		if (newOptionName.trim()) {
			const newOption = {
				id: uuidv4(),
				name: newOptionName.replace(/\s+/g, '-'),
			}

			const { error } = await addExerciseToSupabase(newOption.name)
 			if (error) {
				alert('Exercise exists')
			}
		}
	}

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
								<Button
									variant='ghost'
									size='icon'
									className='mt-5'
									onClick={() => {
										handleRemoveExercise(exerciseId)
									}}
								>
									<i className='bi bi-trash3'></i>
								</Button>
								<SelectContent>
									{allExercises.map((exercise) => {
										return (
											<>
												<SelectItem key={exercise.id} value={exercise.id}>
													{exercise.name}
												</SelectItem>
											</>
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
				</div>
				<div className='flex flex-col'>
					<Button
						className={cn(
							'transition-colors duration-300',
							isSuccess && 'bg-green-500 hover:bg-green-600',
						)}
						onClick={handleCreateTemplate}
					>
						Save
					</Button>
					<Button className='mt-5' variant='link'>
						<Link href='/viewtemplates'>View All Templates</Link>
					</Button>
					<Popover>
						<PopoverTrigger asChild>
							<Button
								variant='ghost'
								size='icon'
								className='w-full justify-start'
							>
								<i className='bi bi-plus-lg'></i>
								Add New Exercise
							</Button>
						</PopoverTrigger>
						<PopoverContent className='w-80'>
							<div className='flex flex-col space-y-2'>
								<Input
									id='newExerciseName'
									placeholder='New option name'
									onKeyDown={(e) => e.stopPropagation()}
								/>
								<Button onClick={handleAddOption}>Add</Button>
							</div>
						</PopoverContent>
					</Popover>
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
