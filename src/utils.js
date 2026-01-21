import { fileURLToPath } from "url"
import path from "path"

// directory variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export {__dirname, __filename} 
