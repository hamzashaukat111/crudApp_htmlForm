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
  max: 150, // limit each IP to 100 requests per windowMs
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
      [
        req.body.naam,
        req.body.numberr,
        req.body.Manager_id,
        req.body.Branch_id,
      ],
      function (err) {
        if (err) {
          return console.log(err.message);
        }
        console.log("New employee has been added");
        res.send(
          "New employee has been added into the database with ID = " +
            req.body.naam +
            " and Name = " +
            req.body.numberr +
            " " +
            req.body.Manager_id +
            " " +
            req.body.Branch_id
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
      "UPDATE USER_TTT SET numberr = :numberr WHERE naam = :naam",
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


async function addToCart(product_idd, price, quantity, itemID,sizee) {
  const connection = await getConnection();
  console.log("addToCart function called");
  console.log("productId:", product_idd);
  console.log("price:", price);
  console.log("quantity:", quantity);
  console.log("itemId:", itemID);
  console.log("size", sizee);

  // Check if the product already exists in the cart
  const exists = await checkIfProductExists(product_idd);
  if (exists) {
    // Update the quantity of the existing product
    await updateQuantity(product_idd, quantity);
  } else {
    // Insert a new row into the cart table
    try {
      const data = await connection.execute(
        "INSERT INTO Product(product_idd,price,quantity,itemID,sizee) VALUES(:product_idd,:price,:quantity,:itemID,:sizee)",
        [product_idd, price, quantity, itemID,sizee],
        function (err) {
          if (err) {
            return console.log(err.message);
          }
          console.log("New product has been added");
          console.log(`addCart function from customer id ${customerId}`);
        }
      );

      connection.commit();
    } catch (err) {
      console.error(err);
    }
  }
}
// ///////////////
// async function addToCart(product_idd, price, quantity, itemID) {
//   const connection = await getConnection();
//   console.log("addToCart function called");
//   console.log("productId:", product_idd);
//   console.log("price:", price);
//   console.log("quantity:", quantity);
//   console.log("itemId:", itemID);

//   // Check if the product already exists in the cart
//   const exists = await checkIfProductExists(product_idd);
//   if (exists) {
//     // Update the quantity of the existing product
//     await updateQuantity(product_idd, quantity);
//   } else {
//     // Insert a new row into the cart table
//     try {
//       const data = await connection.execute(
//         "INSERT INTO Product(product_idd,price,quantity,itemID) VALUES(:product_idd,:price,:quantity,:itemID)",
//         [product_idd, price, quantity, itemID],
//         function (err) {
//           if (err) {
//             return console.log(err.message);
//           }
//           console.log("New product has been added");
//         }
//       );

//       connection.commit();
//     } catch (err) {
//       console.error(err);
//     }
//   }
// }
//inertion :
app.post("/add-to-cart", async function (req, res) {
  console.log("/add-to-cart route called");

  const product_idd = req.body.product_idd;
  const price = req.body.price;
  const quantity = req.body.quantity;
  const itemID = req.body.itemID;
  const sizee = req.body.sizee;

  // check if product already exists in cart
  const exists = await checkIfProductExists(product_idd);
  if (exists) {
    // update quantity if product already exists
    await updateQuantity(product_idd, quantity);
  } else {
    // add new product to cart
    await addToCart(product_idd, price, quantity, itemID,sizee);
  }
  res.send({ message: "Product added to cart successfully" });
});

async function checkIfProductExists(product_idd) {
  const connection = await getConnection();

  try {
    const sql = await connection.execute(
      "SELECT COUNT(*) as count FROM Product WHERE product_idd = :product_idd",
      [product_idd],
      function (err, result) {
        if (err) {
          // Handle the error here
          console.error(err);
          return false;
        }
        console.log("checking if product exists added");
        return result.rows[0].count > 0;
      }
    );
  } catch (err) {
    console.error(err);
    return false;
  }
}

async function updateQuantity(product_idd, quantity) {
  const con = await getConnection();

  try {
    const sql2 = await con.execute(
      "UPDATE Product SET quantity = quantity + :quantity WHERE product_idd = :product_idd",
      [product_idd, quantity],
      function (err) {
        if (err) {
          return console.log(err.message);
        }
        console.log("updating quantity added");
      }
    );

    con.commit();
  } catch (err) {
    console.error(err);
  }
}

////////checkout:
app.post("/check-out", async function (req, res) {
  console.log("/check-out route called");
  const connection = await getConnection();

  try {
    const result = await connection.execute(
      `(SELECT product_idd, quantity, price, quantity * price AS total_price
          FROM Product)
         UNION ALL
         (SELECT NULL AS product_idd, NULL AS quantity, NULL AS price, SUM(quantity * price) AS total_price
          FROM Product)` // Add a closing parenthesis here
    );
    // `SELECT product_idd, quantity, price, quantity * price AS total_price,
    // (SELECT SUM(quantity * price) FROM cart) AS overall_total
    // FROM cart`,//for previous output

    console.log("Data retrieved successfully");
    console.log(result.rows);

    if (result.rows.length > 0) {
      let tableRows = "";
      for (const row of result.rows) {
        tableRows += `
        <tr>
          <td class="text-left">${row.PRODUCT_IDD}</td>
          <td class="text-left">${row.QUANTITY}</td>
          <td class="text-left">${row.PRICE}</td>
          <td class="text-left">${row.TOTAL_PRICE}</td>
          
        </tr>
      `;
      }
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
              <th class="text-left">PRODUCT_ID</th>
              <th class="text-left">QUANTITY</th>
              <th class="text-left">PRICE</th>
              <th class="text-left">TOTAL_PRICE</th>
              
            </tr>
          </thead>
          <tbody class="table-hover">
            ${tableRows}
          </tbody>
        </table>
      </body>
      `
      );
    } else {
      res.send(`No record found in the database`);
    }
  } catch (err) {
    console.error(err);
  }
});

////////////////CANCEL BUTTON
app.post("/cancel", async function (req, res) {
  console.log("/check-out route called");
  const connection = await getConnection();

  try {
    const result = await connection.execute(`TRUNCATE TABLE Product`);
    console.log("CART IS EMPTIED");
    console.log(result.rows);

    res.send("cart is being emptied");
  } catch (err) {
    console.error(err);
  }
});

//////entering customer details
app.post("/loginDetails", async function (req, res) {
  const connection = await getConnection();

  try {
    const data = await connection.execute(
      "INSERT INTO CUSTOME(Customer_id, Customer_pw, Customer_name, Customer_no, Customer_address) VALUES(:customerId, :customerPassword, :customerName, :customerNumber, :customerAddress)",
      [
        req.body.customerId,
        req.body.customerPassword,
        req.body.customerName,
        req.body.customerNumber,
        req.body.customerAddress,
      ],
      function (err) {
        if (err) {
          return console.log(err.message);
        }
        console.log("New customer has been added");
        res.send(
          "New customer has been added into the database with ID = " +
            req.body.customerId +
            " and Name = " +
            req.body.customerName
        );
      }
    );

    connection.commit();
  } catch (err) {
    console.error(err);
  }
});








let customerId;
////login
app.post("/login", async function (req, res) {
  const connection = await getConnection();
  // let customerId;

  try {
    const data = await connection.execute(
      "SELECT * FROM CUSTOME WHERE Customer_id = :customerId AND Customer_pw = :customerPassword",
      [req.body.customerId, req.body.customerPassword]
    );
    // check if data array is not empty, then redirect
    if (data.rows.length > 0) {
      console.log(`user with id just logged in`);
      customerId = req.body.customerId;
      console.log(customerId);
      //res.redirect("/itemcatalog.html");
      res.redirect(`/itemcatalog.html#${req.body.customerId}`);
    } else {
      console.log("Invalidd credentials");
      res.send("Invalid credentials");
    }
  } catch (err) {
    console.error(err);
  }
});
// ////login
// app.post("/login", async function (req, res) {
//   const connection = await getConnection();

//   try {
//     const data = await connection.execute(
//       "SELECT * FROM CUSTOME WHERE Customer_id = :customerId AND Customer_pw = :customerPassword",
//       [req.body.customerId, req.body.customerPassword]
//     );
//     // check if data array is not empty, then redirect
//     if (data.rows.length > 0) {
//       console.log(`user with id just logged in`);
//       res.redirect("/itemcatalog.html");
//     } else {
//       console.log("Invalidd credentials");
//       res.send("Invalid credentials");
//     }
//   } catch (err) {
//     console.error(err);
//   }
// });

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