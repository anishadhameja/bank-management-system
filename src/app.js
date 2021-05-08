const express = require('express');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const app = express();
const port = process.env.PORT || 3000;
const path = require('path');
let alert = require('alert');



var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Ani@2310",
    database: "banksystem"
  });
  
  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
  });


const static_path = path.join(__dirname, "../public");
const view_path = path.join(__dirname,"../templates/views");

app.set("view engine", "ejs");
app.use(express.static(static_path));
app.set("views",view_path);


app.get('/viewAllCustomers', function(req, res, next) {
    con.query("SELECT * FROM customers order by id", function (err, result, fields) {
        if (err) throw err;
        res.render("viewAllCustomers", {records: result});
      });
});


app.use(express.json());
app.use(express.urlencoded({extended:false}));


app.get("/", (req,res) =>{
    res.render("home");
});


app.get("/sendmoney", (req,res) =>{
    res.render("sendmoney");
});


app.get("/transactionhistory",(req,res) =>{
    let history = "select * from transaction order by dateoftransfer desc,timeoftransfer desc";
    con.query(history,function(err,result,fields){
        res.render("transactionhistory",{records: result});
    })
})


app.post("/sendmoney",async function(req,res,next) {
    try{
        const sender = req.body.sender;
        const receiver = req.body.receiver;
        const amount = req.body.Pay;
        let senderBalance,receiverBalance;
        let bal1;
        const sender_query = "select bankBalance from customers where email = '"+sender+"'";
        const receiver_query = "select bankBalance from customers where email = '"+receiver+"'";
       
        function send_balance(balance){
            return balance;
        }
         await con.query(sender_query,function(err,result,fields){
            if(err) throw err;
             senderBalance = result[0].bankBalance;
              bal1 = send_balance(senderBalance);     
        })
        await con.query(receiver_query,function(err,result,fields){
            if(err)throw err;
             receiverBalance = parseInt(result[0].bankBalance);
            send_money(receiverBalance)
        })

        function send_money(receiverBalance){
            senderBalance = bal1;
          if(senderBalance>=amount && amount>0){
            let date_ob = new Date();

            // current date
            // adjust 0 before single digit date
            let date = ("0" + date_ob.getDate()).slice(-2);
            
            // current month
            let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
            
            // current year
            let year = date_ob.getFullYear();
            
            // current hours
            let hours = date_ob.getHours();
            
            // current minutes
            let minutes = date_ob.getMinutes();
            
            // current seconds
            let seconds = date_ob.getSeconds();
            
            let currentDate=year + "-" + month + "-" + date;
            let currentTime=hours + ":" + minutes + ":" + seconds;

            insert = "insert into transaction values('"+sender+"','"+receiver+"',"+amount+",'"+currentDate+"','"+currentTime+"')";
            con.query(insert,function(err,result,fields){
                if(err)throw err;
            })

              receiverBalance+=parseInt(amount);
              senderBalance-=parseInt(amount);
              var receiver_update = "update customers set bankBalance = "+parseInt(receiverBalance.toString())+" where email = '"+receiver+"'";
              con.query(receiver_update,function(err,result,fields){
                  if(err)throw err;
                  console.log(result);
              });
              var sender_update = "update customers set bankBalance = "+parseInt(senderBalance.toString())+" where email = '"+sender+"'";
              con.query(sender_update,function(err,result,fields){
                  if(err)throw err;
              });
              alert("Payment successful!")
            }
            else{
                alert("Payment unsuccessful!")        
            }
            res.render("sendmoney");
        }
    }
    catch(err){
        // res.status(400).send(err);
        console.log(err);
    }
    
          
})



app.get("/viewdetails",(req,res)=>{
    let email = req.query.email;
    if(email === null){
        res.render("viewdetails");
    }
    else{
        console.log(email);
        let search = "select * from customers where email = '"+email+"'";
        con.query(search, (err,result,fields)=>{
            console.log(result);
            if(err) throw err;
            res.render("viewdetails",{record: result});
        });
    }
    
});


app.get("/addcustomer", function(req,res){
    res.render("addcustomer");
})

app.post("/addcustomer", async function(req,res,next){
    try{
        const name = req.body.name;
        const email = req.body.email;
        const bankBalance = req.body.bankBalance;
        const accountno = req.body.accountno;
        const city = req.body.city;
        const mobileno = req.body.mobileno;
        const insertcus = "insert into customers (name,email,bankBalance,accountno,city,mobileno) values('"+name+"','"+email+"',"+bankBalance+",'"+accountno+"','"+city+"',"+mobileno+");";
        con.query(insertcus,function (err, result, record){
            if(err) throw err;
        });
        res.render("addcustomer");
        alert("Added successfully!");
    }
    catch(error){

    }
})

app.get("/transactionhistory2", function (request, response) {
    const email = request.query.email;
    if (email === null) {
        response.render("transactionhistory2");
    }
    else {
        detail_of_transaction = "select * from transaction where senderemail = '" + email + "' or receiveremail = '" + email + "' order by dateoftransfer desc,timeoftransfer desc";
        con.query(detail_of_transaction, function (err, result, record) {
            if (err) throw err;
            response.render("transactionhistory2", { records: result })
            console.log(result);
        })
       
    }
})


app.listen(port, () => {
    console.log("PORT NUMBER ",port);
});
