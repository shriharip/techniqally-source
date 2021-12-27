const functions = require('firebase-functions');
const admin = require('firebase-admin');
const serviceAccount = require('./techniqally-2810-serAccnt.json');

const express = require('express');
const { firestore } = require('firebase-admin');

const app = express();

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
})

const db = admin.firestore();

app.set('views', './views');
app.set('view engine', 'pug');

app.get('/', (req, res)=> {
    res.set('Cache-Control', 'public, max-age=300, s-maxage=600')
    res.render("hello");
})

app.get('/about', (req, res)=> {
    res.set('Cache-Control', 'public, max-age=300, s-maxage=600')
    res.render("about");
})

app.post('/signUp', async   (req, res)=>  {
    let email = req.body['email'];

    try{
      let qsnap =  await db.collection('emails').where('email', '==', email.toLowerCase()).get();
      if(qsnap.empty){
          db.collection('emails').add({"email": email, "createdAt": admin.firestore.Timestamp.now()});
          res.render('thanks', {registered: false})
      }else{
          res.render('thanks', {registered: true})
      }
    } catch(err){
        res.render('404')
    }
    
});

app.get('/signUp', async(req, res)=> {
    res.render('404')
})

app.get('/reactions/:id', async(req, res) => {
    let reaction = req.params.id;
    let data = {
        "cr": 0,
        "ecr" : 0,
        "gcr": 0,
        "ocr": 0,
    }
  
    try{
        switch (reaction){
            case 'ncr':
            break;
            case 'cr':
               await db.collection("crs").add({'count': firestore.FieldValue.increment(1)}) 
            break;
    
            case 'ecr':
               await db.collection("ecrs").add({'count': firestore.FieldValue.increment(1)})
            break;
    
            case 'gcr': 
            await db.collection("gcrs").add({'count': firestore.FieldValue.increment(1)})
            break;
    
            case 'ocr':
                await db.collection("ocrs").add({'count': firestore.FieldValue.increment(1)})
            break;
    
            default:
            
        }
        
    let crsnap = await db.collection('crs').get();
    data.cr =  crsnap.empty ? 0 : crsnap.docs.length;
    let ocrsnap = await db.collection('ocrs').get();
    data.ocr = ocrsnap.empty ? 0 : ocrsnap.docs.length;
      let gcrsnap = await db.collection('gcrs').get();
    data.gcr = gcrsnap.empty ? 0 : gcrsnap.docs.length;
    let ecrsnap = await db.collection('ecrs').get();
    data.ecr = ecrsnap.empty ? 0 : ecrsnap.docs.length;
    
        res.render('reactions', {data})
} catch(err){
    console.log(err);
          res.render('404')
      }

})

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.appT = functions.https.onRequest(app);
