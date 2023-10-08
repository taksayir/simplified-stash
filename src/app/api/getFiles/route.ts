import { getDb } from '@/database/getDb'
import { getFiles } from '@/database/getFiles';
import knex from 'knex'
import type { NextApiRequest, NextApiResponse } from 'next'
import sharp from 'sharp';
const glob = require('glob');

type ResponseData = {
    message: string
}



export async function GET() {
    const files = await getFiles()
    return Response.json({ data: files })
}