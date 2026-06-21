import VideoList from '@/components/VideoList';
import { client } from '@/sanity/lib/client';

export default async function VideoPage() {
    const video = await client.fetch(`
        *[_type == "video"] | order(data desc) {
            _id,
            titolo,
            url,
            data
        }
    `);

    return <VideoList initialVideos={video} />;
}