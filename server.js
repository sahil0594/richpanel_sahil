const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { LEGAL_TCP_SOCKET_OPTIONS } = require('mongodb');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const PORT = 8080;
const ADDRESS = "127.0.0.1"

// mongoose.set('useFindAndModify', false);
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: true
}).then(()=>{console.log('Database Connected !!')})
.catch((err)=>{console.log('Error while connecting with Database');})


// const db=mongoose.connection;
const signupEntry = new mongoose.Schema({name: String, email: String, password: String, stripe_customer_id: String, Card_Number: String, Card_Date: String, Card_Cvv: Number, Card_name: String });
const signupSchema = mongoose.model("signupSchema",signupEntry);


app.use(express.static(path.join(__dirname,'public/about/')));
app.use(express.static(path.join(__dirname,'public/pro/')));
app.use(express.json());       
app.use(express.urlencoded({extended: true})); 

app.get('*',(req,res)=>{
    console.log(req.url);  
    req.url = req.url.split("?")[0]; 
    // temp = req.url.split("=")[];
    switch(req.url){
        case '/payment?custumer_id':
            res.redirect("./payment?custumer_id=")
        case '/about':
            res.sendFile(path.join(__dirname,"/public/about/About.html"));
            break;
        case '/login':
            res.sendFile(path.join(__dirname,"/public/pro/login.html"));
            break;
        case '/payment':
            res.sendFile(path.join(__dirname,"/public/pro/payment.html"));
            break;
        case '/currentplan':
            res.sendFile(path.join(__dirname,"/public/pro/currentplan.html"));
            break;
        case '/signup':
            res.sendFile(path.join(__dirname,"/public/pro/signup.html"));
        // case '/plantable':
        //     res.sendFile(path.join(__dirname,"/public/pro/plantable.html"));
        //     break;
        // case '/SubscriptionPlan':
        //     res.sendFile(path.join(__dirname,"/public/pro/SubscriptionPlan.html"));
        //     break;
    }
    
})

app.post('*',async (req,res)=> {
    console.log(req.url);
    switch(req.url){
        case '/signup':
            message = '';
            if(req.body.name == ""){
                
                res.redirect("/signup?alert=Enter_Name");
                // message = "Enter_Name";
            }
            else if(req.body.email == ""){
                
                res.redirect("/signup?alert=Enter_email");
                // message = "Enter_email";
            }
            else if(req.body.password == ""){
                
                res.redirect("/signup?alert=Enter_password");
                // message = "Enter_password"
            }
            else{    
                try{
                    const custumer = await stripe.customers.create({
                        name: req.body.name,
                        email: req.body.email
                    });
                    // console.log(custumer);
                    
                    tempUser = new signupSchema({ name:req.body.name , email:req.body.email, password:req.body.password, stripe_customer_id: custumer.id, Card_Number: null, Card_Date: null, Card_Cvv: null, Card_name: null })
                    await tempUser.save().then(async(e,err)=>{
                        // console.log(e);
                        res.status(200);
                        res.redirect(`/about?alert=User_Created&custumer_id=${custumer.id}`);
                    })


                }catch(err){
                    console.log("Error while creating customer in database ");
                    console.log(err);
                    res.redirect('/signup?alert=Error_while_creating_Record');
                }
                
            }   
            // res.redirect(`/signup?alert=${message}`);
            
            break;

        // case '/login':
        //     if(req.body.email == ""){
                
        //         res.redirect("/signup?alert=Enter_email");
        //     }
        //     else if(req.body.password == ""){
                
        //         res.redirect("/signup?alert=Enter_password");
        //     }
        //     else{
                
        //     }

        case '/payment':
            if(req.body.card_number = ""){
                res.redirect("/payment?alert=Enter_Card_Details");
            }
            else if(req.body.exp = ""){
                res.redirect("/payment?alert=Enter_Card_Expire_Date");
            }
            else if(req.body.card_name = ""){
                res.redirect("/payment?alert=Enter_Card_Name");
            }
            else if(req.body.cvv == ""){
                res.redirect("/payment?alert=Enter_Card_CVV");
            }
            else{
                // try{
                    //     const card_token = await stripe.tokens.create({
                        //         card:{
                            //             name: req.body.card_name,
                            //             number: req.body.card_number,
                            //             exp_year: req.body.expiry.split("/")[1],
                            //             exp_month:req.body.expiry.split("/")[0],
                            //             cvc: req.body.cvv
                //         }
                //     });
                //     console.log(req.body);
                //     const card = await stripe.customers.createSource(req.body.custumer_id,{
                    //         source: `${card_token.id}`
                    //     });
                    //     console.log(card.id);

                //     try{

                //         const insertCard = await signupSchema.find({stripe_customer_id: req.body.custumer_id})
                //         .then((e)=>{
                    //             // console.log(e);
                    //         })
                    //         res.redirect("/payment?alert=Insert_Card");
                    
                    //     }catch(err){
                        
                //         res.redirect("/payment?alert=Error_while_making_Storing_card_data");
                //     }


                // }catch(err){
                    //     console.log(err);
                    //     res.redirect("/payment?alert=Error_while_making_card_id");
                    // }
                    
                    console.log(req.body);
                    res.redirect("/currentplan?custumer_id=");
                    
            }



    }
})



var server = app.listen(8080, function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("App listening at http://%s:%s", ADDRESS, PORT);
})


// signup / login
// about
// payment
// currentplan -- active , cancel support
// redirect on change plan to about
