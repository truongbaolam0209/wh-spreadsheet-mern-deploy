const mongoose = require('mongoose');



// mongoose.connect('mongodb://localhost:27017/WohHupSpreadsheet01', {
mongoose.connect(
   'mongodb+srv://truongbaolam0209:824502134134134@wh-spreadsheet-001.ufir3.mongodb.net/whspreadsheetname?retryWrites=true&w=majority',
   {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false
   }, err => {
      console.log(err || '...Connected to MongoDB!...');
   });



