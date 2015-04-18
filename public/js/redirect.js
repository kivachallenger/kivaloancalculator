var request = require('request');

function redirect() {


  var name = document.getElementById("name").value;

  request.get("http://api.kivaws.org/v1/teams/search.json?sort_by=member_count&q=" + name, function(err, response, body) {
    if (err) {
      name = "ERROR";
    }

    var lenderID = JSON.parse(body);

    if (lenderID["teams"].length == 0) {
      name = "ERROR";
    } else {
      name = lenderID["teams"][0]["id"];
      alert(name);
    }



      
      //res.render('index', { title: 'KIVA Impact Calculator', lender: lenderID["teams"][0]["id"], name: lenderID["teams"][0]["name"] });


  });


}