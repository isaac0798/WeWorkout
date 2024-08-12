import Link from "next/link";
import { useRouter } from "next/router";

const Appbar = () => {
	const router = useRouter();

	return (
		<div className='fixed top-0 left-0 z-20 w-full bg-zinc-900 pt-safe'>
			<header className='border-b bg-zinc-100 px-safe dark:border-zinc-800 dark:bg-zinc-900'>
				<div className='mx-auto flex h-20 max-w-screen-md items-center justify-between px-6'>
					<Link href='/'>
						<h1 className='font-medium'>WeWorkout</h1>
					</Link>

					<nav className='flex items-center space-x-6'>
						<div className='hidden sm:block'>
							<div className='flex items-center space-x-6'>
								{links.map(({ label, href }) => (
									<Link
										key={label}
										href={href}
										className={`text-sm ${
											router.pathname === href
												? 'text-indigo-500 dark:text-indigo-400'
												: 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50'
										}`}
									>
										{label}
									</Link>
								))}
							</div>
						</div>
					</nav>
				</div>
			</header>
		</div>
	)
};

const links = [
	{
		label: "Templates",
		href: "/templates",
		icon: (
			<svg
				viewBox="0 0 15 15"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				width="18"
				height="18"
			>
				<path
					d="M7.5.5l.325-.38a.5.5 0 00-.65 0L7.5.5zm-7 6l-.325-.38L0 6.27v.23h.5zm5 8v.5a.5.5 0 00.5-.5h-.5zm4 0H9a.5.5 0 00.5.5v-.5zm5-8h.5v-.23l-.175-.15-.325.38zM1.5 15h4v-1h-4v1zm13.325-8.88l-7-6-.65.76 7 6 .65-.76zm-7.65-6l-7 6 .65.76 7-6-.65-.76zM6 14.5v-3H5v3h1zm3-3v3h1v-3H9zm.5 3.5h4v-1h-4v1zm5.5-1.5v-7h-1v7h1zm-15-7v7h1v-7H0zM7.5 10A1.5 1.5 0 019 11.5h1A2.5 2.5 0 007.5 9v1zm0-1A2.5 2.5 0 005 11.5h1A1.5 1.5 0 017.5 10V9zm6 6a1.5 1.5 0 001.5-1.5h-1a.5.5 0 01-.5.5v1zm-12-1a.5.5 0 01-.5-.5H0A1.5 1.5 0 001.5 15v-1z"
					fill="currentColor"
				/>
			</svg>
		),
	},
	{
		label: "Profiles",
		href: "/profiles",
		icon: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				fill="currentColor"
				className="bi bi-person-circle"
				viewBox="0 0 16 16"
			>
				<path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
				<path
					fillRule="evenodd"
					d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"
				/>
			</svg>
		),
	},
];

export default Appbar;
