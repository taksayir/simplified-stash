import { getDb } from '@/database/getDb'
import knex from 'knex'
import type { NextApiRequest, NextApiResponse } from 'next'

type ResponseData = {
  message: string
}


export async function GET() {
  const knex = getDb()
  const data = await knex.select().from('files_fingerprints')
  return Response.json({ data })
}