import { getDb } from '@/database/getDb'
import createApolloClient from '@/gql/createApolloClient';
import knex from 'knex'
import type { NextApiRequest, NextApiResponse } from 'next'
import sharp from 'sharp';
const glob = require('glob');
import QUERY_SCENE from './query_scene.graphql';
import { useQuery, useSuspenseQuery } from '@apollo/client';
import { gql } from '@/__generated__/gql';


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



export interface Root {
  data: Data
}

export interface Data {
  findSceneByFingerprint: FindSceneByFingerprint[]
}

export interface FindSceneByFingerprint {
  id: string
  deleted: boolean
  created: string
  updated: string
  title: string
  details: string
}

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
  if(data?.findSceneByFingerprint.length < 1) {
    return Response.json({ data: null })
  }

  const firstMatch = data.findSceneByFingerprint[0]
  const knex = getDb()
  const hash = firstMatch.fingerprints.filter((x: any) => x.algorithm == "PHASH")[0].hash
  const existingRecord = await knex.select().from('scenes').where('phash', '=', hash)
  if(existingRecord.length > 0) {
    return Response.json({ data: firstMatch })
  }

  await knex.insert({
    phash: firstMatch.fingerprints.filter((x: any) => x.algorithm == "PHASH")[0].hash,
    title: firstMatch.title,
    detail: firstMatch.details,
  }).into('scenes')

  return Response.json({ data: firstMatch })
}