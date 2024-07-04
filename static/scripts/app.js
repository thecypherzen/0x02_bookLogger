// Handles actual catalogue logic

const db = new Storage();
const ui = new UI(db);

// reload books from storage
document.addEventListener("DOMContentLoaded", (e) => {
    e.preventDefault();
    e.stopPropagation();
    ui.reload(db);
});


// handle form submission
form.onsubmit = (e) => {
    e.preventDefault();
    const title = document.getElementById("book-title").value;
    const author = document.getElementById("book-author").value;
    const isbn = document.getElementById("book-isbn").value;
    const date = document.getElementById("book-release-date").value;

    // ensure all entries
    if (validEntries(title, author, isbn, date)){
	const book = new Book(title, author, isbn, date);
	console.log("entries are valid");
	db.add(book)
	db.save();
	ui.addBook(book);
	ui.clearFields();
    } else {
	ui.alert("Error, some values are missing", "alert-error");
    }
}


// handle delete click event
bookList.onclick = function (e){
    if (Array.from(e.target.classList).includes("delete")){
	db.deleteBook(e.target.parentElement.parentElement.id);
	ui.deleteBook(e.target);
    }
    e.preventDefault();
}


// handle next/prev page click
next.onclick = function(e){
    console.log(e.target);
    ui.loadNextPage(true);
    e.preventDefault();
}

// handle prev page load
prev.onclick = function(e){
    ui.loadNextPage(false);
    e.preventDefault();
}
