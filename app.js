var sqlite3 = require("sqlite3").verbose();
var express = require("express");
var http = require("http");
var path = require("path");
var bodyParser = require("body-parser");
var helmet = require("helmet");
var rateLimit = require("express-rate-limit");

var app = express();
var server = http.createServer(app);

let con;

async function getConnection() {
  if (!con) {
    con = await oracledb.getConnection({
      user: "system",
      password: "Oracle_5",
      connectString: "localhost/orcl",
    });
  }
  return con;
}

//oraclee
const oracledb = require("oracledb");
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

// async function fun() {
/// i also removed this code bcz it was inserting name
//and id khudi default wala everytime the node was running
//   let con;

// try {
//   con = await oracledb.getConnection({
//     user: "system",
//     password: "Oracle_5",
//     connectString: "localhost/orcl",
//   });
//     const data = await con.execute("SELECT * FROM USER_TT");

//     console.log(data.rows);

//     //insert data
//     const sql = `insert into USER_TT (naam, numberr) values('hiii','hhh')`;
//     // const sql = `insert into USER_T (naam, numberr) values(${nam},${okkk}')`;

//     let result = await con.execute(sql);
//     console.log(result.rowsAffected, "Rows Inserted");
//     con.commit();
//   } catch (err) {
//     console.error(err);
//   }
// }
// fun();

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

// here gpt was saying do this
//app.use(express.static(path.join(__dirname, "public")));

app.use(express.static(path.join(__dirname, "/")));
//this above code specifies where to load static/ css type files from.

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "./index.html"));
});
// app.get("/", function (req, res) {
//   res.sendFile(path.join(__dirname, "./login1.html"));
// });

// app.get("/", function (req, res) {
//   res.sendFile(path.join(__dirname, "public", "index.html"));
// });

app.post("/add", async function (req, res) {
  const connection = await getConnection();

  try {
    const data = await connection.execute(
      "INSERT INTO USER_TTT(naam,numberr,Manager_id,Branch_id) VALUES(:naam,:numberr,:Manager_id,:Branch_id)",
      [req.body.naam, req.body.numberr,req.body.Manager_id,req.body.Branch_id],
      function (err) {
        if (err) {
          return console.log(err.message);
        }
        console.log("New employee has been added");
        res.send(
          "New employee has been added into the database with ID = " +
            req.body.naam +
            " and Name = " +
            req.body.numberr+ " "+
            req.body.Manager_id+" "+req.body.Branch_id
        );
      }
    );

    connection.commit();
  } catch (err) {
    console.error(err);
  }
});
///////////////////////////////////////////////////////////////////

//after declaring con uper
app.post("/view", async function (req, res) {
  const connection = await getConnection();

  try {
    const result = await connection.execute(
      `SELECT  *FROM USER_TTT WHERE naam = :naam`,
      { naam: req.body.naam }
    );
    console.log("Entry displayed successfully");
    console.log(result);

    if (result.rows.length > 0) {
      // res.send(
      //   `Record with name = ${req.body.naam} has been viewed from the database`
      // );

      res.send(
        `
       <head> <link rel="stylesheet" href="table.css" /> </head>
       <body>
<div class="table-title">
<h3>Data Table</h3>
</div>
<table class="table-fill">
<thead>
<tr>
<th class="text-left">ID</th>
<th class="text-left">Employee</th>
<th class="text-left">MANAGER</th>
<th class="text-left">BRANCH</th>
</tr>
</thead>
<tbody class="table-hover">
<tr>
<td class="text-left">${result.rows[0].NAAM}</td>
<td class="text-left">${result.rows[0].NUMBERR}</td>
<td class="text-left">${result.rows[0].MANAGER_ID}</td>
<td class="text-left">${result.rows[0].BRANCH_ID}</td>
</tr>
<tr>
<td class="text-left">sampleData</td>
<td class="text-left">sample</td>
</tr>
<tr>
<td class="text-left">/td>
<td class="text-left"></td>
</tr>
<tr>
<td class="text-left"> </td>
<td class="text-left">  </td>
</tr>

</tbody>
</table>
  

  </body>
    
        `
      );
      //       this nechay is how I can get data from database and display
      //       in table with html css uper
      // <h1> ID: ${result.rows[0].NAAM}. Data: ${result.rows[0].NUMBERR}</h1>
      //this uper wala can be used inside html
    } else {
      res.send(
        `No record with name = ${req.body.naam} was found in the database`
      );
    }
  } catch (err) {
    console.error(err);
    res.send(
      `Error encountered while retrieving= ${req.body.naam} data from the database`
    );
  }
});
//view wala function is uper wala sara

//Update
app.post("/update", async function (req, res) {
  const connection = await getConnection();

  try {
    const data = await connection.execute(
      "UPDATE USER_TT SET numberr = :numberr WHERE naam = :naam",
      [req.body.numberr, req.body.naam],
      function (err) {
        if (err) {
          return console.log(err.message);
        }
        console.log("Record has been updated");
        res.send("Record has been updated in the database");
      }
    );

    connection.commit();
  } catch (err) {
    console.error(err);
  }
});
/////

// app.post("/update", function (req, res) {
//   db.serialize(() => {
//     db.run(
//       "UPDATE emp SET name = ? WHERE id = ?",
//       [req.body.name, req.body.id],
//       function (err) {
//         if (err) {
//           res.send("Error encountered while updating");
//           return console.error(err.message);
//         }
//         res.send("Entry updated successfully");
//         console.log("Entry updated successfully");
//       }
//     );
//   });
// });

////////////delete////
//con wali changes baad
app.post("/delete", async function (req, res) {
  const connection = await getConnection();

  try {
    const data = await connection.execute(
      "DELETE FROM USER_TTT WHERE naam = :naam ",
      { naam: req.body.naam },
      function (err) {
        if (err) {
          return console.log(err.message);
        }
        console.log("Record deleted");
        res.send(
          "Record with name = " +
            req.body.naam +
            " has been deleted from the database"
        );
      }
    );

    connection.commit();
  } catch (err) {
    console.error(err);
  }
});

////

////////////

// const express = require('express');
// const oracledb = require('oracledb');

// Connect to the database
// (async () =>{
// const connectionn = await oracledb.getConnection({
//   user: 'system',
//   password: 'Oracle_5',
//   connectString: 'localhost/orcl'
// });

// // Create the HTTP server
// const app = express();

// // Add items to the database
// app.post('/add', async (req, res) => {
//   const { quantity } = req.body;
//   for (let i = 0; i < quantity; i++) {
//     await connectionn.execute(
//       'INSERT INTO items (id,total_count,deleted_count) VALUES (:id,:total_count,:deleted_count)',
//       [req.body.naam, req.body.numberr],
//     );
//   }
//   res.sendStatus(200);
// });

// Delete items from the database
// app.delete('/delete/:id', async (req, res) => {
//   await connectionn.execute(
//     'DELETE FROM items WHERE id = ?',req.body.id,
//     function (err) {
//       if (err) {
//         res.send("Error encountered while deleting");
//         return console.error(err.message);
//       }
//       res.send("Entry deleted");
//       console.log("Entry deleted");
//     }
//   );
//   res.sendStatus(200);
// });
// })();

////////////
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

//

// server.listen(2000, function () {
//   console.log("server is listening on port: 2000");
// });
const port = 2000;
server.listen(port, function () {
  console.log(`Server listening on port ${port}`);
});
