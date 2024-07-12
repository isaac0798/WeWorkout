import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createFEClient } from "@/utils/supabase/component";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import * as z from "zod";

const loginSchema = z.object({
	email: z.string().email({ message: "Please enter a valid email address." }),
	password: z.string().min(1, { message: "Password is required." }),
});

export default function LoginForm() {
	const router = useRouter();
	const supabase = createFEClient();

	const form = useForm<z.infer<typeof loginSchema>>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	async function onSubmit(values: z.infer<typeof loginSchema>) {
		console.log(values);
		const { error } = await supabase.auth.signInWithPassword({
			email: values.email,
			password: values.password,
		});
		if (error) {
			console.error(error);
		}
		router.push("/");
	}

	return (
		<div className="min-h-screen bg-black flex flex-col justify-center py-12 sm:px-6 lg:px-8 items-center">
			<div className="sm:mx-auto sm:w-full sm:max-w-md">
				<h2 className="mt-6 text-center text-3xl font-extrabold text-white">
					Log in to your account
				</h2>
			</div>

			<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
				<div className="bg-gray-900 py-8 px-4 shadow sm:rounded-lg sm:px-10">
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="block text-sm font-medium text-gray-200">
											Email address
										</FormLabel>
										<FormControl>
											<Input
												type="email"
												className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 bg-gray-800 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
												placeholder="you@example.com"
												{...field}
											/>
										</FormControl>
										<FormMessage className="mt-2 text-sm text-red-400" />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="block text-sm font-medium text-gray-200">
											Password
										</FormLabel>
										<FormControl>
											<Input
												type="password"
												className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 bg-gray-800 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
												placeholder="********"
												{...field}
											/>
										</FormControl>
										<FormMessage className="mt-2 text-sm text-red-400" />
									</FormItem>
								)}
							/>
							<div>
								<Button
									type="submit"
									className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-cyan-400 hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-400"
								>
									Log in
								</Button>
							</div>
						</form>
					</Form>
				</div>
			</div>
			<Button
				asChild
				className="bg-black mt-8 sm:mx-auto sm:w-full sm:max-w-md text-white"
			>
				<Link href="/signup">Dont have an account?</Link>
			</Button>
		</div>
	);
}
