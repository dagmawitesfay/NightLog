
 const deleteBtn = document.querySelectorAll(".delete");
const searchBar = document.querySelector("#search")
const logsContainer = document.querySelectorAll(".log-row")

    // Not found message
 const notFoundContainer = document.createElement("div")
    notFoundContainer.classList.add("error-message")
    notFoundContainer.style.display = "none"
      const message = document.createElement("p")
      message.classList.add("error")
      notFoundContainer.append(message)
      document.querySelector(".table-container").append(notFoundContainer)



// search by brandName
searchBar.addEventListener("input",(event)=>{
  let match = 0 // stores the filtered counter of search
  const logQuery = event.target.value.toLowerCase().trim()

  // loop through each cards
  logsContainer.forEach(card=>{
    // search term normalized
    const plate  = card.querySelector(".plate").textContent.toLowerCase()
    
    // show the matched brandName 
    if(plate.includes(logQuery)){
      card.style.display = ""
      match++
    } else{
        card.style.display = "none"
    }
  })

  // check the match count to display the error message card
  if(match===0){
      message.textContent = `Couldnt Found "${logQuery}" please search again`
      notFoundContainer.style.display = ""
  } else{
    notFoundContainer.style.display = "none"
  }
})

deleteBtn.forEach(function(element) {

      element.addEventListener('click', function() {
          const id = element.dataset.carId
         // build the confirm window for mistake deletion
          const confirmText = confirm("Delete the question ? It can be undone 🥸")
        if(confirmText){
        fetch('/nightlog', {
          method: 'delete',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ id })
        }).then(function(response) {
          if (response.ok) {
          window.location.reload()
          }
        })
      }
      });
});
