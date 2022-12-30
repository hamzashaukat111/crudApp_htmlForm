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

async function fun() {
  let con;

  try {
    con = await oracledb.getConnection({
      user: "system",
      password: "Hamza123",
      connectString: "localhost/orcl",
    });
    const data = await con.execute("SELECT * FROM USER_T");

    console.log(data.rows);

    //insert data
    const sql = `insert into USER_T (naam, numberr) values('hiii','hhh')`;
    // const sql = `insert into USER_T (naam, numberr) values(${nam},${okkk}')`;

    let result = await con.execute(sql);
    console.log(result.rowsAffected, "Rows Inserted");
    con.commit();
  } catch (err) {
    console.error(err);
  }
}
fun();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

var db = new sqlite3.Database("./database/employees.db");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "./public")));
app.use(helmet());
app.use(limiter);

db.run("CREATE TABLE IF NOT EXISTS emp(id TEXT, name TEXT)");

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "./public/form.html"));
});

//nechay delete later, hai add wala

app.post("/add", function (req, res) {
  async function kk() {
    let con;

    try {
      con = await oracledb.getConnection({
        user: "system",
        password: "Hamza123",
        connectString: "localhost/orcl",
      });

      const data = await con.execute(
        "INSERT INTO USER_T(naam,numberr) VALUES(:naam,:numberr)",
        [req.body.naam, req.body.numberr],
        function (err) {
          if (err) {
            return console.log(err.message);
          }
          console.log("New employee has been added");
          res.send(
            "New employee has been added into the database with ID = " +
              req.body.naam +
              " and Name = " +
              req.body.numberr
          );
        }
      );

      con.commit();
    } catch (err) {
      console.error(err);
    }
  }
  kk();
});

//nechay orginial add wala

// Add
// app.post("/add", function (req, res) {
//   db.serialize(() => {
//     db.run(
//       "INSERT INTO emp(id,name) VALUES(?,?)",
//       [req.body.id, req.body.name],
//       function (err) {
//         if (err) {
//           return console.log(err.message);
//         }
//         console.log("New employee has been added");
//         res.send(
//           "New employee has been added into the database with ID = " +
//             req.body.id +
//             " and Name = " +
//             req.body.name
//         );
//       }
//     );
//   });
// });

// View
app.post("/view", function (req, res) {
  db.serialize(() => {
    db.each(
      "SELECT id ID, name NAME FROM emp WHERE id =?",
      [req.body.id],
      function (err, row) {
        //db.each() is only one which is funtioning while reading data from the DB
        if (err) {
          res.send("Error encountered while displaying");
          return console.error(err.message);
        }
        res.send(` ID: ${row.ID},    Name: ${row.NAME}`);
        console.log("Entry displayed successfully");
      }
    );
  });
});

//Update
app.post("/update", function (req, res) {
  db.serialize(() => {
    db.run(
      "UPDATE emp SET name = ? WHERE id = ?",
      [req.body.name, req.body.id],
      function (err) {
        if (err) {
          res.send("Error encountered while updating");
          return console.error(err.message);
        }
        res.send("Entry updated successfully");
        console.log("Entry updated successfully");
      }
    );
  });
});

// Delete
app.post("/delete", function (req, res) {
  db.serialize(() => {
    db.run("DELETE FROM emp WHERE id = ?", req.body.id, function (err) {
      if (err) {
        res.send("Error encountered while deleting");
        return console.error(err.message);
      }
      res.send("Entry deleted");
      console.log("Entry deleted");
    });
  });
});

// Closing the database connection.
app.get("/close", function (req, res) {
  db.close((err) => {
    if (err) {
      res.send("There is some error in closing the database");
      return console.error(err.message);
    }
    console.log("Closing the database connection.");
    res.send("Database connection successfully closed");
  });
});

server.listen(2000, function () {
  console.log("server is listening on port: 2000");
});
