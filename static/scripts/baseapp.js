// Contains constructors and prototype definitions

// Global element values
const form = document.getElementById("book-form");
const bookBtn = document.getElementById("book-btn");
const bookList = document.getElementById("book-list");


/*
 * Book Constructor
 */
function Book(title, author, isbn, date){
    this.id = new Date().getTime().toString(36) +
	Math.random().toString(36).substr(2);
    this.title = title;
    this.author = author;
    this.isbn = isbn;
    this.date = new Date(date);
}

// Storage Constructor and prototypes
function Storage(){
    this.db = window.localStorage;
    const temp = this.db.getItem("booksDb") ?? null;
    if (!temp){
	this.books = [];
    } else {
	this.books = JSON.parse(temp);
    }
}

// Add book to storage
Storage.prototype.add = function(book){
    this.books.push(book);
}

// Save a book to local storage
Storage.prototype.save = function(){
    this.db.setItem("booksDb", JSON.stringify(this.books));
}

// Delete a book from local Storage
Storage.prototype.deleteBook = function(uid){
    const newBooks = this.books.filter(book => book.id !== uid);
    this.books = newBooks;
    this.save();
}


/**
 * UI Constructor and prototypes
 */
function UI(){};
UI.prototype.alert = function(message, className){
    const alertDiv = document.querySelector(".alert");
    alertDiv.classList.remove("hidden");
    alertDiv.innerHTML = `<p>${message}</p>`;
    alertDiv.classList.add(className);
    setTimeout(() => {
        alertDiv.classList.remove(className);
        alertDiv.innerHTML = "";
        alertDiv.classList.add("hidden");
    }, 3000);
}

// Reload UI from database
UI.prototype.reload = function(storage){
    storage.books.forEach(book => {
	book.date = new Date(book.date);
	this.addBook(book, false);
    });
}


// Add book to UI
UI.prototype.addBook = function (book, isNew){
    const newRow = document.createElement("tr");
    newRow.id = `${book.id}`;
    newRow.innerHTML = `
        <td>${book.title}</td>
        <td>${book.author}</td>
        <td>${book.isbn}</td>
        <td>${book.date.getFullYear()}</td>
        <td><a href="#" class="edit hover-success">&crarr;</td>
        <td><a href="#" class="delete hover-danger">x</td>
    `;
    bookList.appendChild(newRow);
    if (isNew) {
	this.alert(`'${book.title}' added successfully`,
		   "alert-success");
    }
}

// clear fields from UI
UI.prototype.clearFields = function() {
    document.getElementById("book-title").value = "";
    document.getElementById("book-author").value = "";
    document.getElementById("book-isbn").value = "";
    document.getElementById("book-release-date").value = "";
}


// delete book from UI
UI.prototype.deleteBook = function(target){
    target.parentElement.parentElement.remove();
    this.alert("Book deleted successfully", "alert-success");
}


// validate all entries are non-empty and author has fname & lname
function validEntries(title, author, isbn, date){
    if ([title, author, isbn, date].some(value => !value)){
        return false;
    }
    const authorNames = author.split(" ").filter(Boolean);
    if (authorNames.length < 2){
        return false;
    }
    return true;
}
