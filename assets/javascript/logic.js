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
var currentGame = 0;
var playerWinCount = 0;
var opponentWinCount = 0;
var tieCount = 0;
var currentRound = "round";
var roundEvaluated = false;

$(document).ready(function() {
  loadCurrentGame(sessionStorage.getItem("gameId"));

  //When player clicks a image to make his choice
  $(".player-choice-image").on("click", function() {
    console.log("Clicked Player choice " + $(this).attr("imagename"));
    //Highlights the choice using a redborder
    $(this).addClass("redborder");
    $(".player-message").text("Choice Made...");
    //Record the choice in database
    recordGameScore(
      "round" + currentGame,
      "player",
      sessionStorage.getItem("gameId"),
      $(this).attr("imagename")
    );
  });

  //Works exactly same way as previous block of code for click event on player-choice-image
  $(".opponent-choice-image").on("click", function() {
    console.log("Clicked Opponent choice " + $(this).attr("imagename"));
    $(this).addClass("redborder");
    $(".opponent-message").text("Choice Made...");
    recordGameScore(
      "round" + currentGame,
      "opponent",
      sessionStorage.getItem("gameId"),
      $(this).attr("imagename")
    );
  });

  //table changes
  database.ref("currentGame").on("child_changed", function(snapshot) {
   
    if ((sessionStorage.getItem("gameId") == snapshot.key) & !roundEvaluated) {
      console.log("Detected an update on current game");
      //if both users have made their choice
      if (snapshot.val().hasOwnProperty(currentRound)) {
        if (
          snapshot.val()[currentRound].hasOwnProperty("playerChoice") &
          snapshot.val()[currentRound].hasOwnProperty("opponentChoice")
        ) {
          console.log("Both choices made, going to evaluate");
         
          var result = evaluateChoices(
            snapshot.val()[currentRound]["playerChoice"],
            snapshot.val()[currentRound]["opponentChoice"]
          );

          roundEvaluated = true;

          updateRoundWinner(
            result,
            sessionStorage.getItem("gameId"),
            currentRound
          );
        }
      }
    }
  });
});
