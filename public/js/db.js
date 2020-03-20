// offline data
db.enablePersistence().catch(err => {
  if (err.code == "failed-precondition") {
    // probably multiple tabs open at once
    console.log("Persistence failed");
  } else if (err.code == "unimplemented") {
    // lack of browser support
    console.log("Persistence is not available");
  }
});

// realtime listener
db.collection("recipes").onSnapshot(snapshot => {
  // console.log(snapshot.docChanges());
  snapshot.docChanges().forEach(change => {
    // console.log(change, change.doc.data(), change.doc.id);
    if (change.type === "added") {
      // add document data to web page
      renderRecipe(change.doc.data(), change.doc.id);
    }
    if (change.type === "removed") {
      // remove document data from web page
      removeRecipe(change.doc.id);
    }
  });
});
// add new recipe to db
const form = document.querySelector("form");
form.addEventListener("submit", event => {
  event.preventDefault();
  const recipe = {
    title: form.title.value,
    ingredients: form.ingredients.value
  };
  db.collection("recipes")
    .add(recipe)
    .catch(err => console.log(err));
  form.title.value = "";
  form.ingredients.value = "";
});
// delete recipe to db
const recipeContainer = document.querySelector(".recipes");
recipeContainer.addEventListener("click", event => {
  // console.log(event);
  if (event.target.tagName === "I") {
    const id = event.target.getAttribute("data-id");
    db.collection("recipes")
      .doc(id)
      .delete();
  }
});
