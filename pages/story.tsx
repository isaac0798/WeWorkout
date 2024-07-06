import type { User } from '@supabase/supabase-js'
import type { GetServerSidePropsContext } from 'next'
import { createClient } from '@/utils/supabase/server-props'
import Page from '@/components/page'
import Section from '@/components/section'

const Story = ({ user }: { user: User }) => (
	<Page>
		<Section>
			<h2 className='text-xl font-semibold'>Story</h2>
			<h1>Hello, {user.email || 'user'}!</h1>

			<div className='mt-2'>
				<p className='text-zinc-600 dark:text-zinc-400'>
					&quot;I confess that when this all started, you were like a picture
					out of focus to me. And it took time for my eyes to adjust to you, to
					make sense of you, to really recognize you.&quot;
				</p>

				<br />

				<p className='text-sm text-zinc-600 dark:text-zinc-400'>
					<a href='https://twosentencestories.com/vision' className='underline'>
						Vision
					</a>
					, a two sentence story
				</p>
			</div>
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

export default Story
