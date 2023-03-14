// inisiasi library
const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")

const adminroute = require("./admin")
const barangroute = require("./barang")
const pelangganroute = require("./pelanggan")
const transaksiroute = require("./transaksi")

// const { json } = require("body-parser")

// implementation
const app = express()
app.use(express.json())
app.use(express.static(__dirname));
app.use(express.urlencoded({extended: true}))
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(adminroute)
app.use(barangroute)
app.use(pelangganroute)
app.use(transaksiroute)


app.listen(8000, () => {
    console.log("BERHASILL")
})