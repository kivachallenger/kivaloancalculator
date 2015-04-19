function redirect() {


  var name = document.getElementById("name").value;


  window.location.href = "http://localhost:3000/" + name;

  return false;
}