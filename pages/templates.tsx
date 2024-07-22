import Page from '@/components/page'
import { createClient } from '@/utils/supabase/static-props'

export default function PublicPage({ data }: { data?: any[] }) {
	return <Page>{data && JSON.stringify(data, null, 2)}</Page>
}

export async function getStaticProps() {
	const supabase = createClient()

	const { data, error } = await supabase.from('countries').select()

	if (error || !data) {
		return { props: {} }
	}

	return { props: { data } }
}
