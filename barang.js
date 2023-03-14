const express = require("express")
const router = express.Router()
const db = require("./db")

const multer = require("multer")
const path = require("path")
const fs = require("fs")

const storage = multer.diskStorage({
    destination: (req, file, cb) => {

        // set file storage
        cb(null, './image');
    },
    filename: (req, file, cb) => {
        // generate file name
        cb(null, "barang-" +  Date.now() + path.extname(file.originalname))
    }
})

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {

//         // set file storage 
//         cb(null, './image');
//     },
//     fileName: (req, file, cb) => {
//         // generate file name 
//         cb(null, "image-" + Date.now() + path.extname(file.originalname))
//     }
// })

let upload = multer({ storage: storage })

//--------------- BAGIAN BARANG ---------------//

// end-point akses data barang
router.get("/barang", (req, res) => {
    // create sql query
    let sql = "select * from barang"

    // run query
    db.query(sql, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message
            }
        } else {
            response = {
                count: result.length,
                barang: result
            }
        }
        res.json(response)
    })
})

// end-point akses data barang berdasarkan id_barang tertentu
router.get("/barang/:id_barang", (req, res) => {
    let data = {
        id_barang: req.params.id_barang
    }
    // create sql query
    let sql = "select * from barang where ?"

    // run query
    db.query(sql, data, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message
            }
        } else {
            response = {
                count: result.length,
                barang: result
            }
        }
        res.json(response)
    })
})

// endpoint untuk menambah data barang baru
router.post("/barang", upload.single("image"), (req, res) => {
    // prepare data
    let data = {
        kondisi_barang: req.body.kondisi_barang,
        nama_barang: req.body.nama_barang,
        harga: req.body.harga,
        stok: req.body.stok,
        image: req.file.filename
    }

    if (!req.file) {
        // jika tidak ada file yang diupload
        res.json({
            message: "Tidak ada file yang dikirim"
        })
    } else {
        // create sql insert
        let sql = "insert into barang set ?"

        // run query
        db.query(sql, data, (error, result) => {
            if (error) throw error
            res.json({
                message: result.affectedRows + " data berhasil disimpan"
            })
        })
    }
})

// endpoint untuk mengubah data barang
router.put("/barang", upload.single("image"), (req, res) => {
    let data = null, sql = null
    // paramter perubahan data
    let param = { id_barang: req.body.id_barang }

    if (!req.file) {
        // jika tidak ada file yang dikirim = update data saja
        data = {
            kondisi_barang: req.body.kondisi_barang,
            nama_barang: req.body.nama_barang,
            harga: req.body.harga,
            stok: req.body.stok
            // deskripsi: req.body.deskripsi,
            // image: req.file.filename
        }
    } else {
        // jika mengirim file = update data + reupload
        data = {
            kondisi_barang: req.body.kondisi_barang,
            nama_barang: req.body.nama_barang,
            harga: req.body.harga,
            stok: req.body.stok,
            image: req.file.filename
        }

        // get data yg akan diupdate utk mendapatkan nama file yang lama
        sql = "select * from barang where ?"
        // run query
        db.query(sql, param, (err, result) => {
            if (err) throw err
            // tampung nama file yang lama
            let fileName = result[0].image

            // hapus file yg lama
            let dir = path.join(__dirname, "image", fileName)
            fs.unlink(dir, (error) => { })
        })

    }

    // create sql update
    sql = "update barang set ? where ?"

    // run sql update
    db.query(sql, [data, param], (error, result) => {
        if (error) {
            res.json({
                message: error.message
            })
        } else {
            res.json({
                message: result.affectedRows + " data berhasil diubah"
            })
        }
    })
})

// endpoint untuk menghapus data barang
router.delete("/barang/:id_barang", (req, res) => {
    let param = { id_barang: req.params.id_barang }

    // ambil data yang akan dihapus
    let sql = "select * from barang where ?"
    // run query
    db.query(sql, param, (error, result) => {
        if (error) throw error

        // tampung nama file yang lama
        let fileName = result[0].image

        // hapus file yg lama
        let dir = path.join(__dirname, "image", fileName)
        fs.unlink(dir, (error) => { })
    })

    // create sql delete
    sql = "delete from barang where ?"

    // run query
    db.query(sql, param, (error, result) => {
        if (error) {
            res.json({
                message: error.message
            })
        } else {
            res.json({
                message: result.affectedRows + " data berhasil dihapus"
            })
        }
    })
})

module.exports = router