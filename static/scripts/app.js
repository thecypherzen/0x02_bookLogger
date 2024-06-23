// Handles actual catalogue logic

const ui = new UI();
const db = new Storage();


// reload books from storage
document.addEventListener("DOMContentLoaded", (e) => {
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
	db.add(book)
	db.save();
	ui.addBook(book, true);
	ui.clearFields();
    } else {
	ui.alert("Error, some values are missing", "alert-error");
    }
}


// handle delete click event
bookList.onclick = function (e){
    e.preventDefault();
    db.deleteBook(e.target.parentElement.parentElement.id);
    ui.deleteBook(e.target);
}
