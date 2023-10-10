import { getDb } from '@/database/getDb'

type ResponseData = {
  message: string
}


export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id
  const knex = getDb()
  const data = await knex('blob').select('data').where('id', id)
  if (data.length === 0) return new Response('Not found', { status: 404 })
  const base64Blob = data[0].data
  const buffer = Buffer.from(base64Blob, 'base64')
  const headers = new Headers()
  headers.set('Content-Type', 'image/jpeg')
  return new Response(buffer, { headers })

}