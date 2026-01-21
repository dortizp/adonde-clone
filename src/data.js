import fs from "node:fs"
import path from "path"
import { __dirname, __filename } from "./utils.js"
import Busboy from "busboy"
import { randomUUID } from "node:crypto"

function getPropiedades(callback) {
    const filePath = path.resolve(__dirname, "../", "data", "properties.json")
    fs.readFile(filePath, 'utf-8', (err, content) => {
        if (err) {
            console.error(err)
            return callback(err)
        }
        try {
            const parsed = JSON.parse(content)
            callback(null, parsed)
        } catch(parseErr) {
            console.error("Error parsing JSON: ", parseErr.message)
            callback(parseErr)
        }
    })
}

function getProperty(id, callback) {
    const filePath = path.resolve(__dirname, "../", "data", "properties.json")
    fs.readFile(filePath, 'utf-8', (err, content) => {
        if (err) {
            console.error(err)
            return callback(err)
        }
        try {
            const parsed = JSON.parse(content)
            const property = parsed.listings.find(property => property.id === id)
            callback(null, property)
        } catch(parseErr) {
            console.error("Error parsing JSON: ", parseErr.message)
            callback(parseErr)
        }
    })
}


function addProperty(title, address, status, price, units, bedrooms, area, amenities, photo, callback) {
    const newProperty = {
        id: randomUUID(),
        title,
        address,
        status,
        price_soles : price,
        units,
        bedrooms,
        area_range_m2 : area,
        amenities : amenities.split(","),
        photo
    }
    const filePath = path.resolve(__dirname, "../", "data", "properties.json")
    fs.readFile(filePath, 'utf-8', (err, content) => {
        if (err) {
            console.error(err)
            return callback(err)
        }
        const data = JSON.parse(content)
        data.listings.push(newProperty)
        fs.writeFile(filePath, JSON.stringify(data), (err) => {
            console.error(err)
            callback(err)
        })
        
    })

}

function upload(photo, fileName, callback){
    const filePath = path.resolve(__dirname, "../", "upload", fileName)
    const base64Data = photo.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    fs.writeFile(filePath, buffer, (err) => {
        if (err) {
            console.error(err)
            callback(null, err)
        }
    })

}

function saveUploadedFile(req, callback) {
  try {
    const busboy = Busboy({ headers: req.headers });
    const uploadDir = path.resolve('./upload');
    fs.mkdirSync(uploadDir, { recursive: true });

    let savedFile = null;

    busboy.on('file', (fieldname, file, info) => {
      const { filename, mimeType } = info;
      const ext = path.extname(filename) || '.bin';
      const newFileName = `photo-${randomUUID()}${ext}`;
      const filePath = path.join(uploadDir, newFileName);

      const writeStream = fs.createWriteStream(filePath);
      file.pipe(writeStream);

      file.on('end', () => {
        savedFile = { path: filePath, name: newFileName, mimeType };
      });

      writeStream.on('error', (err) => callback(err));
    });

    busboy.on('error', (err) => callback(err));

    busboy.on('finish', () => {
      if (!savedFile) {
        return callback(new Error('No file uploaded'));
      }
      callback(null, savedFile);
    });

    req.pipe(busboy);
  } catch (err) {
    callback(err);
  }
}

function getPhotos(callback) {
    const uploadDir = path.resolve('./upload')

    fs.readdir(uploadDir, (err, files) => {
        if (err) {
            console.error(err)
            return callback(err)
        }

        const photos = files.filter(file => 
            /\.(png|jpg|jpeg|gif|webp)$/i.test(file)
        )
        callback(null, photos)
    })
}

function fixIds(callback) {
    const filePath = path.resolve(__dirname, "../", "data", "properties.json")
    fs.readFile(filePath, 'utf-8', (err, content) => {
        if (err) {
            console.error(err)
            return
        }
        const data = JSON.parse(content)
        const fixData = {...data}
        fixData.listings = fixData.listings.map(property => {
            if (property.id === undefined) {
                return {
                    id: randomUUID(),
                    ...property
                }
            } else {
                return property
            }
        })
        console.log(fixData.listings.every(property => property.id !== undefined))
        fs.writeFile(filePath, JSON.stringify(fixData), (err) => {
            if (err) {
                console.error(err)
                callback(err)
            }
            callback(null)
        })
    })
}

export {getPropiedades, addProperty, upload, saveUploadedFile, getPhotos, fixIds, getProperty}
