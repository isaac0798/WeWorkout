import { useRouter } from 'next/router'
import { useState } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"


import { createFEClient } from '@/utils/supabase/component'

const formSchema = z.object({
	firstName: z.string().min(2, {
		message: 'First name must be at least 2 characters.',
	}),
	lastName: z.string().min(2, {
		message: 'Last name must be at least 2 characters.',
	}),
	email: z.string().email({
		message: 'Please enter a valid email address.',
	}),
	password: z
		.string()
		.min(8, {
			message: 'Password must be at least 8 characters.',
		})
		.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
			message:
				'Password must contain at least one uppercase letter, one lowercase letter, and one number.',
		}),
})

export default function LoginPage() {
	const router = useRouter()
	const supabase = createFEClient()

  const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			firstName: '',
			lastName: '',
			email: '',
			password: '',
		},
	})

	async function signUp(values: z.infer<typeof formSchema>) {
		const { error } = await supabase.auth.signUp({
			email: values.email,
			password: values.password,
			options: {
				data: {
					first_name: values.firstName,
					last_name: values.lastName,
				},
			},
		})
		if (error) {
			console.error(error)
		}
		router.push('/')
	}

	return (
		<div className='min-h-screen bg-black flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
			<div className='sm:mx-auto sm:w-full sm:max-w-md'>
				<h2 className='mt-6 text-center text-3xl font-extrabold text-white'>
					Create your account
				</h2>
			</div>

			<div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
				<div className='bg-gray-900 py-8 px-4 shadow sm:rounded-lg sm:px-10'>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(signUp)} className='space-y-6'>
							<div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
								<FormField
									control={form.control}
									name='firstName'
									render={({ field }) => (
										<FormItem>
											<FormLabel className='block text-sm font-medium text-gray-200'>
												First name
											</FormLabel>
											<FormControl>
												<Input
													className='mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 bg-gray-800 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm'
													placeholder='John'
													{...field}
												/>
											</FormControl>
											<FormMessage className='mt-2 text-sm text-red-400' />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name='lastName'
									render={({ field }) => (
										<FormItem>
											<FormLabel className='block text-sm font-medium text-gray-200'>
												Last name
											</FormLabel>
											<FormControl>
												<Input
													className='mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 bg-gray-800 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm'
													placeholder='Doe'
													{...field}
												/>
											</FormControl>
											<FormMessage className='mt-2 text-sm text-red-400' />
										</FormItem>
									)}
								/>
							</div>
							<FormField
								control={form.control}
								name='email'
								render={({ field }) => (
									<FormItem>
										<FormLabel className='block text-sm font-medium text-gray-200'>
											Email address
										</FormLabel>
										<FormControl>
											<Input
												type='email'
												className='mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 bg-gray-800 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm'
												placeholder='you@example.com'
												{...field}
											/>
										</FormControl>
										<FormMessage className='mt-2 text-sm text-red-400' />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name='password'
								render={({ field }) => (
									<FormItem>
										<FormLabel className='block text-sm font-medium text-gray-200'>
											Password
										</FormLabel>
										<FormControl>
											<Input
												type='password'
												className='mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 bg-gray-800 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm'
												placeholder='********'
												{...field}
											/>
										</FormControl>
										<FormDescription className='mt-2 text-sm text-gray-400'>
											Must be at least 8 characters and include uppercase,
											lowercase, and numbers.
										</FormDescription>
										<FormMessage className='mt-2 text-sm text-red-400' />
									</FormItem>
								)}
							/>
							<div>
								<Button
									type='submit'
									className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-cyan-400 hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-400'
								>
									Sign up
								</Button>
							</div>
						</form>
					</Form>
				</div>
			</div>
		</div>
	)
}
