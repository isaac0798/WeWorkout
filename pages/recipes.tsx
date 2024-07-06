import type { User } from '@supabase/supabase-js'
import type { GetServerSidePropsContext } from 'next'

import { createClient } from '@/utils/supabase/server-props'

import Page from '@/components/page'
import Section from '@/components/section'

const Recipes = ({ user }: { user: User }) => (
	<Page>
		<Section>
			<h1>Hello, {user.email || 'user'}!</h1>
			<h2 className='text-xl font-semibold'>Ingredients</h2>

			<div className='mt-2'>
				<p className='text-zinc-600 dark:text-zinc-400'>
					Like any good recipe, we appreciate community offerings to cultivate a
					delicous dish.
				</p>
			</div>
		</Section>

		<Section>
			<h3 className='font-medium'>Thanks to</h3>

			<ul className='list-disc space-y-2 px-6 py-2'>
				<li className='text-sm text-zinc-600 dark:text-zinc-400'>
					<a href='https://unsplash.com' className='underline'>
						Unsplash
					</a>{' '}
					for high quality images
				</li>

				<li className='text-sm text-zinc-600 dark:text-zinc-400'>
					<a href='https://teenyicons.com' className='underline'>
						Teenyicons
					</a>{' '}
					for lovely icons
				</li>
			</ul>
		</Section>
	</Page>
)

export async function getServerSideProps(context: GetServerSidePropsContext) {
	const supabase = createClient(context)

	const { data, error } = await supabase.auth.getUser()
	console.log(error)

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

export default Recipes
