import { neon } from '@neondatabase/serverless'
import 'dotenv/config'

const sql = neon(process.env.NEON_DATABASE_URL)

export default sql
