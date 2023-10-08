import { getDb } from '@/database/getDb'
import createApolloClient from '@/gql/createApolloClient';
import knex from 'knex'
import type { NextApiRequest, NextApiResponse } from 'next'
import sharp from 'sharp';
const glob = require('glob');
import QUERY_SCENE from './query_scene.graphql';
import { useQuery } from '@apollo/client';
import { gql } from '@/__generated__/gql';


type ResponseData = {
  message: string
}

const GET_SCENE_BY_FINGERPRINT = gql(/* GraphQL */ `  
  query FindSceneByFingerprint {
      findSceneByFingerprint(
          fingerprint: { hash: "d06d38d2c83d3a6d", algorithm: PHASH }
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
  const { loading, data } = useQuery(
    GET_SCENE_BY_FINGERPRINT,
  );


  const knex = getDb()

  return Response.json({ data })
}