import { getDb } from '@/database/getDb'
import createApolloClient from '@/gql/createApolloClient';
import knex from 'knex'
import type { NextApiRequest, NextApiResponse } from 'next'
import sharp from 'sharp';
const glob = require('glob');
import QUERY_SCENE from './query_scene.graphql';
import { useQuery, useSuspenseQuery } from '@apollo/client';
import { gql } from '@/__generated__/gql';
import { getFiles } from '@/database/getFiles';


type ResponseData = {
  message: string
}

const GET_SCENE_BY_FINGERPRINT = gql(/* GraphQL */ `  
  query FindSceneByFingerprint($hash: String!) {
      findSceneByFingerprint(
          fingerprint: { hash: $hash, algorithm: PHASH }
      ) {
          id
          deleted
          created
          updated
          images {
              id
              url
              width
              height
          }
          title
          details
          fingerprints {
            hash
            algorithm
            duration
        }            
      }
  }
`);


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const phash = searchParams.get('phash')
  const client = createApolloClient()
  const { data } = await client.query({
    query: GET_SCENE_BY_FINGERPRINT,
    variables: {
      hash: phash || ''
    }
  })
  if (data?.findSceneByFingerprint.length < 1) {
    return Response.json({ data: null })
  }

  const firstMatch = data.findSceneByFingerprint[0]
  const knex = getDb()
  const hash = firstMatch.fingerprints.filter((x: any) => x.algorithm == "PHASH")[0].hash
  const existingRecord = await knex.select().from('scenes').where('phash', '=', hash)
  if (existingRecord.length > 0) {
    const fileData = await getFiles(1, phash)
    return Response.json({ status: 'exist', data: fileData[0] })
  }

  const image = firstMatch.images[0]
  let blob_id = null
  if (image) {
    const imageUrl = image.url
    const imageBuffer = await (await fetch(imageUrl)).arrayBuffer()
    const cover_data = await sharp(imageBuffer).resize(1280, 1280, {
      fit: sharp.fit.inside,
      withoutEnlargement: true,
    }).jpeg({
      quality: 50,
    }).toBuffer()
    const cover_data_base64 = cover_data.toString('base64')
    const existingBlob = (await knex.select('id').from('blob').where('data', '=', cover_data_base64))
    if (existingBlob.length > 0) {
      blob_id = existingBlob[0].id
    } else {
      const inserted_blob = (await knex.insert({ data: cover_data_base64, }).into('blob'))[0]
      blob_id = inserted_blob
    }
  }

  const inserted_scene = await knex.insert({
    phash: firstMatch.fingerprints.filter((x: any) => x.algorithm == "PHASH")[0].hash,
    title: firstMatch.title,
    details: firstMatch.details,
    cover_id: blob_id,
  }).into('scenes')
  const fileData = await getFiles(1, phash)
  return Response.json({ status: 'ok', data: fileData[0] })
}