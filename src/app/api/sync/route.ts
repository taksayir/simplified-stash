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
type DatabaseAction = 'UPDATE' | 'INSERT'

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
                id
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
  const knex = getDb()

  const syncOlderThan = new Date();
  syncOlderThan.setDate(syncOlderThan.getDate() - 1);

  const { data } = await client.query({
    query: GET_SCENE_BY_FINGERPRINT,
    variables: {
      hash: phash || ''
    }
  })

  const existingScene = await knex.select().from('scenes').where('phash', '=', phash)
  const sceneDatabaseAction: DatabaseAction = existingScene.length > 0 ? 'UPDATE' : 'INSERT'

  const hasSceneData = data?.findSceneByFingerprint.length > 0
  if (hasSceneData) {
    const sceneData = data.findSceneByFingerprint[0]
    const hasSceneImage = sceneData.images.length > 0
    let sceneImageId = null
    if (hasSceneImage) {
      const sceneImage = sceneData.images[0]
      sceneImageId = await downloadImageToBlob(sceneImage.url, knex, sceneImage.id)
    }

    let sceneId = null
    if (sceneDatabaseAction == 'UPDATE') {
      sceneId = existingScene[0].id
      const shouldUpdate = existingScene[0].last_sync_at < syncOlderThan
      if (shouldUpdate) {
        await knex.update({
          title: sceneData.title,
          details: sceneData.details,
          cover_id: sceneImageId,
          stash_id: sceneData.id,
          last_sync_at: knex.fn.now(),
        }).where('id', '=', sceneId).into('scenes')
      }
    } else {
      sceneId = (await knex.insert({
        phash: phash,
        title: sceneData.title,
        details: sceneData.details,
        cover_id: sceneImageId,
        stash_id: sceneData.id,
        last_sync_at: knex.fn.now(),
      }).into('scenes'))[0]
    }

    const hasPerformers = sceneData.performers.length > 0
    if (hasPerformers) {
      for (let i = 0; i < sceneData.performers.length; i++) {
        const performer = sceneData.performers[i]
        const existingPerf = await knex.select().from('performers').where('stash_id', '=', performer.performer.id)
        const perfDatabaseAction: DatabaseAction = existingPerf.length > 0 ? 'UPDATE' : 'INSERT'
        const hasPerfImage = performer.performer.images.length > 0
        let performerImageId = null
        if (hasPerfImage) {
          const performerImage = performer.performer.images[0]
          performerImageId = await downloadImageToBlob(performerImage.url, knex, performerImage.id)
        }
        let performerId = null

        if (perfDatabaseAction == 'UPDATE') {
          performerId = existingPerf[0].id
          const shouldUpdate = existingPerf[0].last_sync_at < syncOlderThan
          if (shouldUpdate) {
            await knex.update({
              name: performer.performer.name,
              gender: performer.performer.gender,
              birth_year: new Date(performer.performer.birthdate?.date).getFullYear(),
              country: performer.performer.country,
              cover_id: performerImageId,
              stash_id: performer.performer.id,
              last_sync_at: knex.fn.now(),
            }).where('id', '=', performerId).into('performers')
          }
        } else {
          performerId = (await knex.insert({
            name: performer.performer.name,
            gender: performer.performer.gender,
            birth_year: new Date(performer.performer.birthdate?.date).getFullYear(),
            country: performer.performer.country,
            cover_id: performerImageId,
            stash_id: performer.performer.id,
            last_sync_at: knex.fn.now(),
          }).into('performers'))[0]
        }

        const hasScenePerfromer = await knex.select().from('scene_performers').where('scene_id', '=', sceneId).andWhere('performer_id', '=', performerId)
        if (hasScenePerfromer.length == 0) {
          await knex.insert({
            scene_id: sceneId,
            performer_id: performerId,
          }).into('scene_performers')
        }
      }

    }



  }
  const fileData = await getFiles(100, phash)
  return Response.json({ status: 'ok', data: fileData[0] })

}