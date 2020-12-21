// Your web app's Firebase configuration
var currentPlayer = sessionStorage.getItem("player");
var firebaseConfig = {
  apiKey: "AIzaSyBUsdS5kpto9EzXphkV0yixuvKtxYlhfsg",
  authDomain: "rpc-game-7c67f.firebaseapp.com",
  databaseURL: "https://rpc-game-7c67f-default-rtdb.firebaseio.com",
  projectId: "rpc-game-7c67f",
  storageBucket: "rpc-game-7c67f.appspot.com",
  messagingSenderId: "1075986937311",
  appId: "1:1075986937311:web:b9a3218c5fc947a70a006a"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var database = firebase.database();
var gameInProgress = false;
console.log("Connected to DB");

$(document).ready(function() {

  $("#add-player").on("click", function() {
    console.log("Clicked Add Player");
    event.preventDefault();
    currentPlayer = $("#name-input").val();
    sessionStorage.setItem("player", currentPlayer);
    database
      .ref("/onlinePlayerList")
      .push()
      .set({
        playerName: $("#name-input").val(),
        playerEmail: $("#email-input").val(),
        playerStatus: "Available",
        gamesWon: 0
      });
    
    $("#add-player").attr("disabled", true);
  });

 
  database.ref("/onlinePlayerList").on("child_added", function(snapshot) {
    var latestPlayer = snapshot.val();
    displayonlinePlayers(latestPlayer);
  });

  $("body").on("click", ".playerbutton", function() {
    gameInProgress = true;

    database
      .ref("/currentGame")
      .push()
      .set({
        playerName: currentPlayer,
        opponentName: $(this).attr("buttonname"),
        gameStatus: "In Progress"
      });
  });

  database.ref("/currentGame").on("value", function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
    
      if (childSnapshot.val().gameStatus != "closed") {
        if (
          (childSnapshot.val().opponentName ===
            sessionStorage.getItem("player") ||
            childSnapshot.val().playerName ===
              sessionStorage.getItem("player")) &
          !sessionStorage.getItem("returnToGame")
        ) {
          console.log("Matched");
      
          sessionStorage.setItem("gameId", childSnapshot.key);


          $("#player-list").text(
            childSnapshot.val().playerName +
              " vs " +
              childSnapshot.val().opponentName
          );
        
          setPlayerStatus(
            childSnapshot.val().playerName,
            "Game In Progress",
            true
          );
          setPlayerStatus(
            childSnapshot.val().opponentName,
            "Game In Progress",
            true
          );
          console.log("About to open a new Window");
          setTimeout(function() {
            window.open("./game.html", "_self");
          }, 2000);
        }
      }
    });
    sessionStorage.removeItem("returnToGame");
  });
});
