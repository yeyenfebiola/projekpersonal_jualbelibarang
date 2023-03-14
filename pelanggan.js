const express = require("express")
const router = express.Router()
const db = require("./db")

const md5 = require("md5")
const Cryptr = require("cryptr")
const crypt = new Cryptr("140533601726") // secret key, boleh diganti kok

validateToken = () => {
    return (req, res, next) => {
        // cek keberadaan "Token" pada request header
        if (!req.get("Token")) {
            // jika "Token" tidak ada
            res.json({
                message: "Access Forbidden"
            })
        } else {
            // tampung nilai Token
            let token  = req.get("Token")
            
            // decrypt token menjadi id_pelanggan
            let decryptToken = crypt.decrypt(token)

            // sql cek id_pelanggan
            let sql = "select * from pelanggan where ?"

            // set parameter
            let param = { id_pelanggan: decryptToken}

            // run query
            db.query(sql, param, (error, result) => {
                if (error) throw error
                 // cek keberadaan id_pelanggan
                if (result.length > 0) {
                    // id_pelanggan tersedia
                    next()
                } else {
                    // jika pelanggan tidak tersedia
                    res.json({
                        message: "Invalid Token"
                    })
                }
            })
        }

    }
}

//--------------- BAGIAN PELANGGAN ---------------//

// end-point akses data pelanggan
router.get("/pelanggan", validateToken(), (req, res) => {
    // create sql query
    let sql = "select * from pelanggan"

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
                pelanggan: result
            }
        }
        res.json(response)
    })
})

// end-point akses data pelanggan berdasarkan id_pelanggan tertentu
router.get("/pelanggan/:id_pelanggan",validateToken(), (req, res) => {
    let data = {
        id_pelanggan: req.params.id_pelanggan
    }
    // create sql query
    let sql = "select * from pelanggan where ?"

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
                pelanggan: result
            }
        }
        res.json(response)
    })
})

// end-point menyimpan data pelanggan
router.post("/pelanggan",validateToken(), (req, res) => {

    //prepare data
    let data = {
        id_pelanggan: req.body.id_pelanggan,
        nama_pelanggan: req.body.nama_pelanggan,
        alamat: req.body.alamat
    }

    // create sql query insert
    let sql = "insert into pelanggan set ?"

    // run query
    db.query(sql, data, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message
            }
        } else {
            response = {
                message: result.affectedRows + " data inserted"
            }
        }
        res.json(response)
    })
})

// end-point mengubah data pelanggan
router.put("/pelanggan",validateToken(), (req, res) => {

    //prepare data
    let data = [
        {
            id_pelanggan: req.body.id_pelanggan,
            nama_pelanggan: req.body.nama_pelanggan,
            alamat: req.body.alamat
        },

        // primary (primary key)
        {
            id_pelanggan: req.body.id_pelanggan
        }
    ]

    // create sql query insert
    let sql = "update pelanggan set ? where ?"

    // run query
    db.query(sql, data, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message
            }
        } else {
            response = {
                message: result.affectedRows + " data inserted"
            }
        }
        res.json(response)
    })
})

// end-point menghapus data siswa berdasarkan id_pelanggan
router.delete("/pelanggan/:id_pelanggan",validateToken(), (req, res) => {
    // prepare data
    let data = {
        id_pelanggan: req.params.id_pelanggan
    }

    // create query sql delete
    let sql = "delete from pelanggan where ?"

    // run query
    db.query(sql, data, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message
            }
        } else {
            response = {
                message: result.affectedRows + " data deleted"
            }
        }
        res.json(response) // send response
    })
})

module.exports = router