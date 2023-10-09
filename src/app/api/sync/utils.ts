import { getDb } from "@/database/getDb"
import { Knex } from "knex"
import sharp from "sharp"

export const downloadImageToBlob = async (url: string, knex: Knex) => {
    let blob_id = null
    const imageBuffer = await (await fetch(url)).arrayBuffer()
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
    console.log(blob_id)
    return blob_id
}