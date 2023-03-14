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
            
            // decrypt token menjadi id_admin
            let decryptToken = crypt.decrypt(token)

            // sql cek id_admin
            let sql = "select * from admin where ?"

            // set parameter
            let param = { id_admin: decryptToken}

            // run query
            db.query(sql, param, (error, result) => {
                if (error) throw error
                 // cek keberadaan id_admin
                if (result.length > 0) {
                    // id_admin tersedia
                    next()
                } else {
                    // jika admin tidak tersedia
                    res.json({
                        message: "Invalid Token"
                    })
                }
            })
        }

    }
}


//--------------- BAGIAN ADMIN ---------------//

// end-point akses data admin
router.get("/admin", validateToken(), (req, res) => {
    // create sql query
    let sql = "select * from admin"

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
                admin: result
            }
        }
        res.json(response)
    })
})

// end-point akses data admin berdasarkan id_admin tertentu
router.get("/admin/:id_admin",validateToken(), (req, res) => {
    let data = {
        id_admin: req.params.id_admin
    }
    // create sql query
    let sql = "select * from admin where ?"

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
                admin: result
            }
        }
        res.json(response)
    })
})

// end-point menyimpan data admin
router.post("/admin",validateToken(), (req, res) => {

    //prepare data
    let data = {
        id_admin: req.body.id_admin,
        nama_admin: req.body.nama_admin,
        username: req.body.username,
        password: md5(req.body.password),
        status_admin: req.body.status_admin
    }

    // create sql query insert
    let sql = "insert into admin set ?"

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

// endpoint login admin (authentication)
router.post("/admin/auth", (req, res) => {
    // tampung username dan password
    let param = [
        req.body.username, //username
        md5(req.body.password) // password
    ]


    // create sql query
    let sql = "select * from admin where username = ? and password = ?"

    // run query
    db.query(sql, param, (error, result) => {
        if (error) throw error

        // cek jumlah data hasil query
        if (result.length > 0) {
            // admin tersedia
            res.json({
                message: "Logged",
                token: crypt.encrypt(result[0].id_admin), // generate token
                data: result
            })
        } else {
            // admin tidak tersedia
            res.json({
                message: "Invalid username/password"
            })
        }
    })
})

// end-point mengubah data admin
router.put("/admin", validateToken(), (req, res) => {

    //prepare data
    let data = [
        {
            id_admin: req.body.id_admin,
            nama_admin: req.body.nama_admin,
            username: req.body.username,
            password: md5(req.body.password),
            status_admin: req.body.status_admin
        },

        // primary (primary key)
        {
            id_admin: req.body.id_admin
        }
    ]

    // create sql query insert
    let sql = "update admin set ? where ?"

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

// end-point menghapus data siswa berdasarkan id_admin
router.delete("/admin/:id_admin",validateToken(), (req, res) => {
    // prepare data
    let data = {
        id_admin: req.params.id_admin
    }

    // create query sql delete
    let sql = "delete from admin where ?"

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