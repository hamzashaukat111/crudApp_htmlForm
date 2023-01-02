var sqlite3 = require("sqlite3").verbose();
var express = require("express");
var http = require("http");
var path = require("path");
var bodyParser = require("body-parser");
var helmet = require("helmet");
var rateLimit = require("express-rate-limit");

var app = express();
var server = http.createServer(app);

//oraclee
const oracledb = require("oracledb");
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

async function fun1() {
    let con;
  
    try {
      con = await oracledb.getConnection({
        user: "system",
        password: "Oracle_5",
        connectString: "localhost/orcl",
      });
      const data = await con.execute("SELECT * FROM items");
  
      console.log(data.rows);
  
      //insert data
      const sql = `insert into items (id,total_count, deleted_count) values(1,100,10)`;
      // const sql = `insert into USER_T (naam, numberr) values(${nam},${okkk}')`;
  
      let result = await con.execute(sql);
      console.log(result.rowsAffected, "Rows Inserted");
      con.commit();
    } catch (err) {
      console.error(err);
    }
  }
  fun1();

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  });
  
  var db1 = new sqlite3.Database("./database/item.db");
  
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(express.static(path.join(__dirname, "./static")));
  app.use(helmet());
  app.use(limiter);

  db1.run("CREATE TABLE IF NOT EXISTS item(id int, total_count int, deleted_count int)");

// here gpt was saying do this
//app.use(express.static(path.join(__dirname, "public")));

app.use(express.static(path.join(__dirname, "/")));
//this above code specifies where to load static/ css type files from.

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "./index.html"));
});

app.post("/delete", function (req, res) {
    db.serialize(() => {
      db.run("DELETE FROM item WHERE id = ?", req.body.id, function (err) {
        if (err) {
          res.send("Error encountered while deleting");
          return console.error(err.message);
        }
        res.send("Entry deleted");
        console.log("Entry deleted");
      });
    });
  });

  (async () => {
    const connection = await oracledb.getConnection({
      user: 'username',
      password: 'password',
      connectString: 'connect_string'
    });
  
    // Create the HTTP server
    const app = express();
  
    // Add items to the database
    app.post('/add', async (req, res) => {
      const { quantity } = req.body;
      for (let i = 0; i < quantity; i++) {
        await connection.execute(
          'INSERT INTO table_name (quantity) VALUES (:quantity)',
          { quantity }
        );
      }
      res.sendStatus(200);
    });
  
    // Delete items from the database
    app.delete('/delete/:id', async (req, res) => {
      await connection.execute(
        'DELETE FROM table_name WHERE id = :id',
        { id: req.params.id }
      );
      res.sendStatus(200);
    });
  }
  )
  ();
  