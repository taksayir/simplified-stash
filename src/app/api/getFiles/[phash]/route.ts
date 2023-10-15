import { getFiles } from '@/database/getFiles';

export async function GET(
    request: Request,
    { params }: { params: { phash: string } }
) {
    const phash = params.phash
    const files = await getFiles(1, phash)
    return Response.json({ data: files[0] })
}