
function displayonlinePlayers(latestPlayer) {
  currentPlayer = sessionStorage.getItem("player");
  addPlayerToList(latestPlayer);
  setPlayerStatus(latestPlayer.playerName, latestPlayer.playerStatus, false);
}


function addPlayerToList(latestPlayer) {
  $("tbody").append(
    $("<tr>")
      .append(
        $("<td>", {
          text: latestPlayer.playerName
        })
      )
      .append(
        $("<td>").append(
          $("<button>", {
            class: "btn btn-block playerbutton",
            text: latestPlayer.playerStatus,
            status: latestPlayer.playerStatus,
            buttonname: latestPlayer.playerName
          })
        )
      )
      .append(
        $("<td>", {
          text: latestPlayer.gamesWon
        })
      )
  );
}

function setPlayerStatus(playerName, playerStatus, updateDatabase) {
  if (playerStatus == "Available") {
    $('[status="' + playerStatus + '"]').addClass("btn-success");
  } else {
    console.log("Player status is not available" + playerStatus);
    $('[buttonname="' + playerName + '"]')
      .attr("status", playerStatus)
      .attr("disabled", true)
      .text(playerStatus)
      .addClass("btn-warning");
  }

  if (updateDatabase) {
    database
      .ref("/onlinePlayerList")
      .orderByChild("playerName")
      .equalTo(playerName)
      .once("value", function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
          childSnapshot.ref.update({ playerStatus: playerStatus });
        });
      });
  }
}


function displayPlayersArea(playerName, opponentName) {
  if (sessionStorage.getItem("player") == playerName) {
    $(".opponent-choices").css("visibility", "hidden");
  } else {
    $(".player-choices").css("visibility", "hidden");
  }

  $(".player-name").text(playerName);
  $(".opponent-name").text(opponentName);
  $(".player-message").text("Take your Pick...");
  $(".opponent-message").text("Take your Pick...");
}

function recordGameScore(currentRound, role, gameId, choice) {
  console.log("Beginning to Record score");
  if (role == "player") {
    database
      .ref("/currentGame")
      .child(gameId)
      .child(currentRound)
      .update({ playerChoice: choice });
  } else {
    database
      .ref("/currentGame")
      .child(gameId)
      .child(currentRound)
      .update({ opponentChoice: choice });
  }
}

function loadCurrentGame(gameId) {
  console.log("Loading Current Round");
  currentGame++;
  currentRound = "round" + currentGame;
  roundEvaluated = false;

  database
    .ref("/currentGame")
    .child(gameId)
    .once("value", function(snapshot) {
      displayPlayersArea(
        snapshot.val().playerName,
        snapshot.val().opponentName
      );
    });
}

function evaluateChoices(playerChoice, opponentChoice) {
  var rock = "rock";
  var paper = "paper";
  var scissors = "scissors";

  if (playerChoice === opponentChoice) {
    return 0;
  } else {
    if (playerChoice === rock) {
      if (opponentChoice === scissors) {
        return 1;
      } else {
        return 2;
      }
    } else {
      if (playerChoice === scissors) {
        if (opponentChoice === paper) {
          return 1;
        } else {
          return 2;
        }
      } else {
        if (playerChoice === paper) {
          if (opponentChoice === rock) {
            return 1;
          } else {
            return 2;
          }
        }
      }
    }
  }
}

function updateRoundWinner(result, gameId, currentRound) {
  console.log("Updating Round Results " + sessionStorage.getItem("player"));
  database
    .ref("/currentGame")
    .child(gameId)
    .child(currentRound)
    .update({ result: result });

  switch (result) {
    case 0:
      tieCount++;
      $(".player-message").text("TIE!!!");
      $(".opponent-message").text("TIE!!!");
      break;

    case 1:
      playerWinCount++;
      console.log("Player Win Count :" + playerWinCount);
      switch (playerWinCount) {
        case 1:
          $(".player-star-1").addClass("winning-star");
          break;
        case 2:
          $(".player-star-2").addClass("winning-star");
          break;
        case 3:
          $(".player-star-3").addClass("winning-star");
          break;
      }
      $(".player-message").text("You Won this round!!");
      $(".opponent-message").text("Sorry, you lost..");
      break;

    case 2:
      opponentWinCount++;
      switch (opponentWinCount) {
        case 1:
          $(".opponent-star-1").addClass("winning-star");
          break;
        case 2:
          $(".opponent-star-2").addClass("winning-star");
          break;
        case 3:
          $(".opponent-star-3").addClass("winning-star");
          break;
      }
      $(".opponent-message").text("You Won this round!!");
      $(".player-message").text("Sorry, you lost..");
      break;
  }


  if (playerWinCount == 3 || opponentWinCount == 3) {
    handleGameOver(gameId, playerWinCount, opponentWinCount);
    $(".game-over-message").text("GAME OVER!!!");
  } else {
    waitAndBeginNextRound(gameId);
  }
}


function waitAndBeginNextRound(gameId) {
  setTimeout(function() {
    $(".player-choice-image").removeClass("redborder");
    $(".opponent-choice-image").removeClass("redborder");
    loadCurrentGame(gameId);
  }, 3000);
}

function handleGameOver(gameId, playerWinCount, opponentWinCount) {
  console.log("Handle Game Over");
  database
    .ref("/currentGame")
    .child(gameId)
    .once("value", function(snapshot) {
      if (playerWinCount == 3) {
        snapshot.ref.update({ winner: snapshot.val().playerName , gameStatus : "closed" });
        var winnerName = snapshot.val().playerName;
      } else {
        snapshot.ref.update({ winner: snapshot.val().opponentName  , gameStatus : "closed"});
        var winnerName = snapshot.val().opponentName;
      }
      updateGamesWon(winnerName);
      setPlayerStatus(snapshot.val().playerName, "Available", true);
      setPlayerStatus(snapshot.val().opponentName, "Available", true);
    });

  function updateGamesWon(winnerName) {
    console.log("Update Games Won for Winner");

    database
      .ref("/onlinePlayerList")
      .orderByChild("playerName")
      .equalTo(winnerName)
      .once("value", function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
          childSnapshot.ref.update({ gamesWon: childSnapshot.val().gamesWon + 1 });
        });
      });

      sessionStorage.removeItem("gameId");
      sessionStorage.setItem("returnToGame" , true)
      setTimeout(function() {
        window.open("./index.html", "_self");
      }, 3000);
    
  }
}
