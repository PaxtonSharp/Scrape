$(document).ready(function () {
  var isCommenting = false;
  console.log("hello world");
  $.ajax({
    method: "GET",
    url: "/articles"
  }).then(function (result) {
    displayResults(result);
  });

  function displayResults(articles) {
    articles.forEach(function (article) {
      var html = "";
      html += `<div class="row content-row p-3"><div class="row"><div class="col"><h3>${article.title}</h3>`;
      html += `<h6 class="categories">${article.category}</h6></div></div>`;
      html += `<div class="row"><div class="col-7"><p>${article.summary}</p></div>`;
      html += `<div class="col-3"><img class='article-img img-fluid' src=${article.imageSrc}></div>`;
      html += `<div class="col-2">`
      article.isFavorite ? html += `<button data-id=${article._id} id=favorite-btn-${article._id} class="btn btn-primary favorite favorite-btn">Unfavorite</button>` : html += `<button data-id=${article._id} id=favorite-btn-${article._id} class="btn btn-success favorite-btn">Favorite</button>`     
      html += `<a href=${article.link}><button id="read-btn-${article._id}" class="btn btn-warning link-btn">To Article</button></a>`
      html += `<div id="note-${article._id}"></div></div></div>`
      html += `<hr size="10">`
      $("#content").append(html);
    });
  }

  $(document).on("click", "#favorites", function () {
    $("#content").empty();
    $.ajax({
      method: "GET",
      url: "/articles"
    }).then(function (result) {
      displayFavorites(result);
    });
  });

  $(document).on("click", "#all", function () {
    $("#content").empty();
    $.ajax({
      method: "GET",
      url: "/articles"
    }).then(function (result) {
      displayResults(result);
    });
  })

  $(document).on("click", "#scrape", function () {
    $("#content").empty();
    $.ajax({
      method: "GET",
      url: "/scrape"
    }).then(function (result) {
      location.reload();
    });
  })



  function displayFavorites(articles) {
    articles.forEach(function (article) {
      if (article.isFavorite) {
        var html = "";
        html += `<div class="row content-row p-3"><div class="row"><div class="col"><h3>${article.title}</h3>`;
        html += `<h6 class="categories">${article.category}</h6></div></div>`;
        html += `<div class="row"><div class="col-7"><p>${article.summary}</p></div>`;
        html += `<div class="col-3"><img class='article-img img-fluid' src=${article.imageSrc}></div>`;
        html += `<div class="col-2"><button data-id=${article._id} id=note-btn-${article._id} class="btn btn-primary note-btn">Add Note</button><a href=${article.link}>`
        html += `<button id="read-btn-${article._id}" class="btn btn-warning link-btn">Read Article</button></a>`
        html += `<button id="favorite-btn-${article._id}" class="btn btn-secondary favorite-btn">Unfavorite</button></a>`
        html += `<div id="note-${article._id}"></div></div></div>`
        html += `<hr size="10">`
        $("#content").append(html);
      }
    });
  }

  // Whenever someone clicks a note button

  $(document).on("click", ".note-btn", function () {
    if (!isCommenting) {
      isCommenting = true;
      // Empty the notes from the note section
      // Save the id from the p tag
      var thisId = $(this).attr("data-id");

      // Now make an ajax call for the Article
      $.ajax({
        method: "GET",
        url: "/articles/" + thisId
      }).then(function (data) {
        console.log(data);
        $(`#note-btn-${data._id}`).attr("style", "display: none");
        $(`#favorite-btn-${data._id}`).attr("style", "display: none");
        $(`#read-btn-${data._id}`).attr("style", "display: none");
        $(`#note-${data._id}`).append("<textarea style='width: 100%;' class='form-control' rows='3' id='bodyinput' name='body'></textarea>");
        // A button to submit a new note, with the id of the article saved to it
        $(`#note-${data._id}`).append(`<button data-id="${data._id}" class="btn btn-success save-btn" id="save-btn-${data._id}">Save Note</button>`);
        $(`#note-${data._id}`).append(`<button data-id="${data._id}" class="btn btn-danger delete-btn" id="delete-btn-${data._id}">Delete Note</button>`);
        // If there's a note in the article
        if (data.comment) {
          // Place the title of the note in the title input
          $("#bodyinput").val(data.comment.body);
        }
      });
    }
  });

  $(document).on("click", ".favorite-btn", function () {
    // Empty the notes from the note section
    // Save the id from the p tag
    var thisId = $(this).attr("data-id");

    // Now make an ajax call for the Article
    $.ajax({
      method: "PUT",
      url: "/articles/favorites/" + thisId
    }).then(function (data) {
      console.log(data);
      location.reload();
    });
  })




  // Whenever someone clicks a note button
  $(document).on("click", ".delete-btn", function () {
    isCommenting = false;
    // Empty the notes from the note section
    // Save the id from the p tag
    var thisId = $(this).attr("data-id");

    // Now make an ajax call for the Article
    $.ajax({
      method: "DELETE",
      url: "/articles/" + thisId
    }).then(function (data) {
      console.log(data);
      $(`#note-${data}`).empty();
      $(`#note-btn-${data}`).attr("style", "display: inline-block");
      $(`#favorite-btn-${data}`).attr("style", "display: inline-block");
      $(`#read-btn-${data}`).attr("style", "display: inline-block");

    });
  });

  // When you click the savenote button
  $(document).on("click", ".save-btn", function () {
    isCommenting = false;
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");
    var commentBody = $("#bodyinput").val();
    console.log(commentBody)
    if (commentBody) {
      // Run a POST request to change the note, using what's entered in the inputs
      $.ajax({
        method: "POST",
        url: "/articles/" + thisId,
        data: {
          // Value taken from title input
          // Value taken from note textarea
          body: commentBody
        }
      })
        // With that done
        .then(function (data) {
          // Log the response
          console.log(data);
          // Empty the notes section
          $(`#note-${data._id}`).empty();
          $(`#note-btn-${data._id}`).attr("style", "display: inline-block");
          $(`#read-btn-${data._id}`).attr("style", "display: inline-block");
        });

      // Also, remove the values entered in the input and textarea for note entry
      $("#titleinput").val("");
      $("#bodyinput").val("");
    } else {
      alert("Add a note to save it!")
    }
  });

})