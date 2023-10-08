import { getDb } from '@/database/getDb'
import knex from 'knex'
import type { NextApiRequest, NextApiResponse } from 'next'
import sharp from 'sharp';
const glob = require('glob');

type ResponseData = {
  message: string
}

function getBinary(a: string | number | bigint | boolean, nBits: string | number | bigint | boolean) {
  [a, nBits] = [BigInt(a), BigInt(nBits)];

  if ((a > 0 && a >= 2n ** (nBits - 1n)) || (a < 0 && -a > 2n ** (nBits - 1n))) {
    throw new RangeError("overflow error");
  }

  return a >= 0
    ? a.toString(2).padStart(Number(nBits), "0")
    : (2n ** nBits + a).toString(2);
}

function binaryStringToHexString(binaryString: string) {
  const binaryStringLength = binaryString.length;
  if (binaryStringLength % 4 !== 0) {
    throw new RangeError("binaryString.length must be multiple of 4");
  }
  let hexString = "";
  for (let i = 0; i < binaryStringLength; i += 4) {
    const fourBits = binaryString.slice(i, i + 4);
    const hex = parseInt(fourBits, 2).toString(16);
    hexString += hex;
  }
  return hexString;
}

function convertDecimal(bigIntStr: string) {
  const binaryStr = getBinary(bigIntStr, 64)
  const hexStr = binaryStringToHexString(binaryStr);
  console.log(bigIntStr, hexStr)
  return hexStr
}

function convertBlobToBase64(blob: any) {
  const buffer = Buffer.from(blob, 'binary');
  return buffer.toString('base64');
}


export async function GET() {
  const stashKnex = require('knex')({
    client: 'better-sqlite3',
    connection: {
      filename: '/Users/kayasitprv/.stash/stash-go.sqlite',
      defaultSafeIntegers: true,
      bigNumberStrings: true,
      supportBigNumbers: true
    }
  });

  const knex = getDb()

  const allIds = (await stashKnex.select('id').from('files')).map((item: any) => item.id)
  const ret = []

  for (let i = 0; i < allIds.length; i++) {
    const currentId = allIds[i]

    const fileDataArray = (await stashKnex
      .select(knex.raw('CAST(fingerprint AS TEXT) AS fingerprint'), 'files.*', 'files_fingerprints.type', 'folders.path',)
      .from('files')
      .join('folders', 'files.parent_folder_id', '=', 'folders.id')
      .leftJoin('files_fingerprints', 'files.id', '=', 'files_fingerprints.file_id')
      .where('files.id', '=', currentId)).filter((x: any) => x.type == "phash")
    if (fileDataArray.length != 1) {
      console.log(`fileDataArray.length != 1, id: ${currentId}`)
      continue
    }

    const fileData = fileDataArray[0]
    const sceneDataArray = (await stashKnex
      .select()
      .from('scenes_files')
      .join('scenes', 'scenes.id', '=', 'scenes_files.scene_id')
      .join('blobs', 'scenes.cover_blob', '=', 'blobs.checksum')
      .where('scenes_files.file_id', '=', fileData.id))

    if (sceneDataArray.length != 1) {
      console.log(`sceneDataArray.length != 1, id: ${currentId}`)
      continue
    }
    const sceneData = sceneDataArray[0]
    const coverBlob = sceneData.blob


    ret.push({
      path: `${fileData.path}/${fileData.basename}`,
      phash: convertDecimal(fileData.fingerprint),
      cover_data: convertBlobToBase64(coverBlob),
    })
  }

  for (let i = 0; i < ret.length; i++) {
    const item = ret[i]
    let imgBuffer = Buffer.from(item.cover_data, 'base64');
    const cover_data = await sharp(imgBuffer).resize(1280, 1280, {
      fit: sharp.fit.inside,
      withoutEnlargement: true,
    }).jpeg({
      quality: 50,
    }).toBuffer()
    const cover_data_base64 = cover_data.toString('base64')

    const existingBlob = (await knex.select('id').from('blob').where('data', '=', cover_data_base64))
    let blob_id = null
    if (existingBlob.length > 0) {
      blob_id = existingBlob[0].id
    } else {
      const inserted_blob = (await knex.insert({ data: cover_data_base64, }).into('blob'))[0]
      blob_id = inserted_blob
    }


    await knex.insert({
      path: item.path,
      phash: item.phash,
      cover_id: blob_id,
    }).into('files').then(() => {
      console.log(`inserted ${item.path}`)
    }).catch((err: any) => {
      console.log(`error inserting ${item.path}`)
      console.log(err)
    })
  }

  return Response.json({ data: ret.map(x => x.path) })
}