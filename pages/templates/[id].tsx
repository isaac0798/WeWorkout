import Page from '@/components/page'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { createFEClient } from '@/utils/supabase/component'
import { createClient } from '@/utils/supabase/server-props'
import type { User } from '@supabase/supabase-js'
import { GetServerSideProps, type GetServerSidePropsContext } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

const defaultTemplate = {
	id: '',
	name: 'New Workout',
	exercises: [],
}

interface Template {
	id: string
	name: string
	created_at: string
	updated_at: string
	exercises: Array<{
		id: string
		name: string
		order: number
	}>
}

export default function PublicPage({ user }: { user: User }) {
	const supabase = createFEClient()
	const router = useRouter()

	const [template, setTemplate] = useState<Template>()
	const [error, setError] = useState<string | null>(null)

	const [allExercises, setAllExercises] = useState<
		{ id: string; name: string }[]
	>([])

	useEffect(() => {
		async function getTemplateWithExercises(
			templateId: string | string[] | undefined,
		) {
			if (!templateId) {
				return
			}

			if (Array.isArray(templateId)) {
				return
			}

			const { data, error } = await supabase
				.from('Templates')
				.select(
					`
      id,
      name,
      created_at,
      updated_at,
      TemplateExercises (
        id,
        order_in_template,
        Exercise (
          id,
          name
        )
      )
    `,
				)
				.eq('id', templateId)
				.single()

			if (error) {
				console.error('Error fetching template:', error)
				setError(error.message)
			}

			// Restructure the data to make it more convenient to use
			if (data) {
				setTemplate({
					id: data.id,
					name: data.name,
					created_at: data.created_at,
					updated_at: data.updated_at,
					exercises: data.TemplateExercises.map((te) => ({
						id: te.Exercise.id,
						name: te.Exercise.name,
						order: te.order_in_template,
					})),
				})
			}

			return null
		}

		supabase
			.from('Exercise')
			.select('id, name')
			.order('name')
			.then(({ data, error }) => {
				if (error) {
					console.error('Error fetching exercises:', error)
					throw error
				}
				setAllExercises(data)
			})

		getTemplateWithExercises(router.query.id)
	}, [])

	if (error) return <div>Error: {error}</div>
	if (!template) return <div>Loading...</div>

	return (
		<Page>
			<h1>Edit your template!</h1>
			<h1 className='mt-5'>{template.name}</h1>
			<Separator />
			<ul>
				{template.exercises.map((exercise) => (
					<Select>
						<div className='flex'>
							<SelectTrigger className='w-[180px] mt-5'>
								<SelectValue placeholder={exercise.name} />
							</SelectTrigger>
							<Button
								variant='ghost'
								size='icon'
								className='mt-5'
								onClick={() => {
									console.log('remove exercise')
								}}
							>
								<i className='bi bi-trash3'></i>
							</Button>
						</div>
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
				))}
			</ul>
			<Button
				variant='outline'
				onClick={() => console.log('handle exercise')}
				className='w-full my-5'
			>
				Add Exercise
			</Button>

			<div>
				<Button className='mt-5' variant='link'>
					<Link href='/viewtemplates'>Back</Link>
				</Button>
				<Button
					className={cn(
						'transition-colors duration-300',
						false && 'bg-green-500 hover:bg-green-600',
					)}
					onClick={() => console.log('edit template')}
				>
					Save
				</Button>
			</div>
		</Page>
	)
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
	const supabase = createClient(context)

	const { data, error } = await supabase.auth.getUser()

	if (error || !data) {
		return {
			redirect: {
				destination: '/login',
				permanent: false,
			},
		}
	}

	return {
		props: {
			user: data.user,
		},
	}
}
