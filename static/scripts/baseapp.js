// Contains constructors and prototype definitions

// Global element values
const form = document.getElementById("book-form");
const bookBtn = document.getElementById("book-btn");
const bookList = document.getElementById("book-list");


function pageIterator(arr, size=4){
    let page = 0;
    let idx = 0;

    return {
        next: function(){
            return idx < arr.length ?
                { value: {
                    page: ++page,
                    content: arr.slice(idx, idx+=size)
                }, done: false} :
            { content: null, done: true }
        },
        prev: function(){
            return --page > 0 ?
                { value: {
                    page: page,
                    content: arr.slice(idx-=(2 * size), idx += size)
                }, done: false } :
            { content: null, done: true }
        }
    }
}



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
    this.pages = pageIterator(this.books, 5);
}


Storage.prototype = {
    // Paginate storage
    getPage: function(forward=true) {
	return forward ? this.pages.next() : this.pages.prev();
    },

    // Add book to storage
    add: function(book) {
	this.books.push(book);
    },

    // Save a book to local storage
    save: function() {
	this.db.setItem("booksDb", JSON.stringify(this.books));
    },

    // Delete a book from local Storage
    deleteBook: function(uid) {
	const newBooks = this.books.filter(book => book.id !== uid);
	this.books = newBooks;
	this.save();
    }
}


/**
 * UI Constructor and prototypes
 */
function UI(){};

UI.prototype = {
    alert: function(message, className){
	const alertDiv = document.querySelector(".alert");
	alertDiv.classList.remove("hidden");
	alertDiv.innerHTML = `<p>${message}</p>`;
	alertDiv.classList.add(className);
	setTimeout(() => {
            alertDiv.classList.remove(className);
            alertDiv.innerHTML = "";
            alertDiv.classList.add("hidden");
	}, 3000);
    },

    // Reload UI from database
    reload: function(storage){
	storage.books.forEach(book => {
	    book.date = new Date(book.date);
	    this.addBook(book, false);
	});
    },

    // Add book to UI
    addBook: function (book, isNew){
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
    },

    // clear fields from UI
    clearFields: function() {
	document.getElementById("book-title").value = "";
	document.getElementById("book-author").value = "";
	document.getElementById("book-isbn").value = "";
	document.getElementById("book-release-date").value = "";
    },

    // delete book from UI
    deleteBook: function(target){
	target.parentElement.parentElement.remove();
	this.alert("Book deleted successfully", "alert-success");
    },

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
}
