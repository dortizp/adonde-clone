import express from "express"
import path from "path"
import * as data from "./data.js"
import { __dirname, __filename } from "./utils.js"
import { randomUUID } from "crypto"

const app = express()

// views with EJS configuration
app.set('view engine', 'ejs')
app.set("views", path.join(__dirname, "views"))

// static file server middleware
app.use(express.static(path.join(__dirname, "../public")))
app.use('/upload', express.static('upload'))

// form from request middleware
app.use(express.urlencoded({extended: true}))

app.get('/',
    (req, res) => {
        data.getPropiedades((err, content)=> {
            if (err) {
                return res.status(500).send("Error reading or parsing data file")
            }

            const {min, max} = (req.query)
            const minPrice = Number(min)
            const maxPrice = Number(max)
            const allListings = content?.listings
            let listings = allListings

            if (!isNaN(minPrice) || !isNaN(maxPrice)) {
                listings = allListings.filter(property => {
                    const price = Number(property.price_soles)
                    if (isNaN(price)) return false
                    if (!isNaN(minPrice) && price < minPrice) return false
                    if (!isNaN(maxPrice) && price > maxPrice) return false
                    return true
                })
            } 
            const length = listings?.length
            if (!Array.isArray(listings)) {
                return res.status(500).send('Error al leer los datos')
            }
            res.render("properties", {properties: listings, length})
        })
    }
)

app.get('/new',
    (req, res) => {
        data.getPhotos((error, photos) => {
            if (error) {
                return res.render('new-property', {photos: []})
            }
            
            res.render('new-property', {photos})
        })
    }
)

app.post('/new',
    (req, res) => {
        const {title, address, status, price, units, bedrooms, area, amenities, photo} = req.body
        data.addProperty(title, address, status, price, units, bedrooms, area, amenities, photo, (error) => {
            if (error) {
                return res.status(500).send('Error creating property')
            }
            res.redirect('/')
        })
    }
)

app.get('/upload',  
    (req,res) => {
        res.render('upload', {copyrigth: "2025"})
    }
)

app.post('/upload',
    (req, res) => {
        data.saveUploadedFile(req, (err, fileInfo) => {
            if (err) {
                return res.status(500).send('Error uploading the file')
            }

            console.log(fileInfo)
            res.redirect('/')
        })
    }
)

app.get('/:id/mortgage-calculator',
    (req, res) => {
        const {id} = req.params
        data.getProperty(id, (err, data) => {
            if (err) {
                res.status(500).send('Error al obtener los datos')
                return
            }
            console.log(data)
            res.render('mortgage-calculator', {property: data})
        })
    }
)
let cuota = null;

app.post('/mortgage-calculator', (req, res) => {
    try {
        const { amount, tea, months } = req.body;

        // Validate input
        if (!amount || !tea || !months) {
            return res.status(400).send('Missing required fields: amount, tea, months');
        }

        // Convert to numbers
        const principal = Number(amount);
        const annualRate = parseFloat(tea)/100;
        const totalMonths = Number(months);

        // Calculate monthly rate (TEM) and monthly payment
        const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1;
        const monthlyPayment =
            (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
            (Math.pow(1 + monthlyRate, totalMonths) - 1);

        // Format results
        const result = {
            TEM: monthlyRate.toFixed(6),        // precise monthly rate
            monthlyPayment: monthlyPayment.toFixed(2) // formatted currency style
        };

        console.log(`Monthly rate (TEM): ${result.TEM}`);
        console.log(`Monthly payment: ${result.monthlyPayment}`);

        // Render result view with the calculated values
        res.render('result', result);

    } catch (error) {
        console.error('Error calculating mortgage:', error);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/fixIds',
    (req, res) => {
        data.fixIds((err) => {
            if (err) {
                console.error(err)
                res.status(500).send('Sucedio un error')
            } else {
                res.send('Se realizo el cambio de Ids')
            }
        })
    }
)

app.listen(3000, () => {
    console.log('listenning on http://localhost:3000')
})
