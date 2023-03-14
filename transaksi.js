const express = require("express")
const router = express.Router()
const db = require("./db")
const moment = require("moment")

//--------------- BAGIAN TRANSAKSI ---------------//

//end-point menambahkan data transaksi
router.post("/transaksi", (req, res) => {
    //prepare data to transaksi
    let data = {
        id_admin: req.body.id_admin,
        id_pelanggan: req.body.id_pelanggan,
        tgl_transaksi: moment().format('YYYY-MM-DD HH:mm:ss') //get current time
    }

    //parse to JSON
    let transaksi = JSON.parse(req.body.transaksi)

    //create query insert to transaksi
    let sql = "insert into transaksi set ?"

    //run query
    db.query(sql, data, (error, result) => {
        let response = null

        if (error) {
            res.json({ message: error.message })
        } else {
            //get last inserted id_transaksi
            let lastID = result.insertId

            //prepare data to detail_transaksi
            let data = []
            for (let index = 0; index < transaksi.length; index++) {
                data.push([
                    lastID, transaksi[index].id_barang,
                ])
            }

            //create query insert detail_transaksi
            let sql = "insert into detail_transaksi values ?"

            db.query(sql, [data], (error, result) => {
                if (error) {
                    res.json({ message: error.message })
                } else {
                    res.json({ message: "Data has been inserted" })
                }
            })
        }
    })
})

//end-point menampilakn data transaksi siswa
router.get("/transaksi", (req,res) => {
    //create sql query
    let sql = "select t.id_transaksi, p.id_pelanggan,t.tgl_transaksi, p.nama_pelanggan, a.id_admin, a.nama_admin " +
     "from transaksi t join pelanggan p on t.id_pelanggan = p.id_pelanggan " +
     "join admin a on t.id_admin = a.id_admin"

     //run query
     db.query(sql, (error, result) => {
        if (error) {
            res.json({ message: error.message })
        } else {
            res.json({
                count: result.length,
                transaksi: result
            })
        }
     })
})

//end-point untuk menampilkan detail transaksi
router.get("/transaksi/:id_transaksi", (req,res) => {
    let param = { id_transaksi: req.params.id_transaksi}

    //create sql query
    let sql = "select p.nama_transaksi, p.poin " + 
    "from detail_transaksi dps join transaksi p "+
    "on p.id_transaksi = dps.id_transaksi "

    //run query
    db.query(sql, (error, result) => {
        if (error) {
            res.json({ message: error.message })
        } else {
            res.json({
                count: result.length,
                transaksi: result
            })
        }
     })
})

//end-point untuk menghapus data transaksi

router.delete("/transaksi/:id_transaksi", (req,res) => {
    let param = { id_transaksi: req.params.id_transaksi }

    // create sql query delete detail_transaksi
    let sql = "delete from detail_transaksi where ?"

    db.query(sql, param, (error, result) => {
        if(error){
            res.json({message: error.message})
        }else{
            let param = { id_transaksi: req.params.id_transaksi}

            // create sql query delete detail_transaksi
            let sql = "delete from transaksi where ?"

            db.query(sql, param, (error, result) => {
                if(error){
                    res.json({message: error.message})
                }else{
                    res.json({message: "Data has been deleted"})
                }
            })
        }
    })
})

module.exports = router