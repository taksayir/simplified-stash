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
import { downloadImageToBlob } from './utils';


type ResponseData = {
  message: string
}

const GET_SCENE_BY_FINGERPRINT = gql(/* GraphQL */ `  
  query FindSceneByFingerprint($hash: String!) {
      findSceneByFingerprint(
          fingerprint: { hash: $hash, algorithm: PHASH }
      ) 
      {
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
        performers {
          performer {
            id
            name
            disambiguation
            aliases
            gender
            country
            created
            updated
            birthdate {
                date
                accuracy
            }
            images {
                url
            }
          }
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


  const image = firstMatch.images[0]
  const cover_id = image ? await downloadImageToBlob(image.url, knex) : null
  let scene_id = null
  if (existingRecord.length > 0) {
    await knex.update({
      phash: firstMatch.fingerprints.filter((x: any) => x.algorithm == "PHASH")[0].hash,
      title: firstMatch.title,
      details: firstMatch.details,
      cover_id: cover_id,
    }).where('id', '=', existingRecord[0].id).into('scenes')
    scene_id = existingRecord[0].id
  } else {
    const inserted_scene = await knex.insert({
      phash: firstMatch.fingerprints.filter((x: any) => x.algorithm == "PHASH")[0].hash,
      title: firstMatch.title,
      details: firstMatch.details,
      cover_id: cover_id,
    }).into('scenes')
    scene_id = inserted_scene[0]
  }


  console.log(firstMatch.performers)

  for (let performer of firstMatch.performers) {
    let existingPerformer = await knex.select().from('performers').where('id', '=', performer.performer.id)
    let performer_id = null
    if (existingPerformer.length == 0) {
      const performerImage = performer.performer.images[0]
      const performerCoverId = performerImage ? await downloadImageToBlob(performerImage.url, knex) : null
      const insertedPerformer = await knex.insert({
        name: performer.performer.name,
        gender: performer.performer.gender,
        birth_year: new Date(performer.performer.birthdate?.date).getFullYear(),
        country: performer.performer.country,
        cover_id: performerCoverId,
      }).into('performers')
      performer_id = insertedPerformer[0]
    } else {
      performer_id = existingPerformer[0].id
    }
    await knex.insert({
      scene_id: scene_id,
      performer_id: performer_id
    }).into('scene_performers')

  }


  const fileData = await getFiles(1, phash)
  return Response.json({ status: 'ok', data: fileData[0] })
}