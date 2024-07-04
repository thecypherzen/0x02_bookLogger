// Contains constructors and prototype definitions

// Global element values
const form = document.getElementById("book-form");
const bookBtn = document.getElementById("book-btn");
const bookList = document.getElementById("book-list");
const pageInfo = document.querySelector(".page-info");
const prev = document.getElementById("prev");
const next = document.getElementById("next");


const pageSize = 2;

// page Iterator function
function pageIterator(arr, size=4) {
    let page = 0;
    let idx = 0;

    return {
        next: function() {
            return idx < arr.length ?
                { value: {
                    page: ++page,
		    pageCount: Math.floor(arr.length/size) +
			(arr.length % size ? 1 : 0),
                    content: arr.slice(idx, idx+=size),
		    end: idx > size
                }, done: false} :
            { done: true }
        },
        prev: function() {
            return --page > 0 ?
                { value: {
                    page: page,
		    pageCount: Math.floor(arr.length/size) +
			(arr.length % size ? 1 : 0),
                    content: arr.slice(idx-=(2 * size), idx += size),
		    end: idx > size
                }, done: false } :
            { done: true }
        }
    }
}


/*
 * Book Constructor
 */
function Book(title, author, isbn, date){
    console.log("creating new book...: ", title);
    this.id = new Date().getTime().toString(36) +
	Math.random().toString(36).substr(2);
    this.title = title;
    this.author = author;
    this.isbn = isbn;
    this.date = new Date(date);
}


// Storage Constructor and prototypes
function Storage(){
    console.log("initializing storage...");
    this.db = window.localStorage;
    const temp = this.db.getItem("booksDb") ?? null;
    if (!temp){
	this.books = [];
    } else {
	this.books = JSON.parse(temp);
    }
    console.log("   done. books: ", this.books);
}

Storage.prototype = {
    // Add book to storage
    add: function(book) {
	console.log("db: adding book: ", book.title);
	this.books.push(book);
    },

    // Save a book to local storage
    save: function() {
	console.log("db: saving items...");
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
function UI(storage){
    this.elements = [];
    this.pages = null;
    this.currentPage = null;
    this.currentPageNo = 1;
};

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
	}, 1500);
    },

    initPages: function(){
	console.log("ui: ..initializing pages...");
	this.pages = pageIterator(this.elements, pageSize);
	this.currentPage = this.pages.next();
    },

    // Reload UI from database
    reload: function(storage, fromStorage=true){
	console.log("ui reloading... storage: ",storage.books);
	if (fromStorage && storage.books.length){
	    storage.books.forEach(book => {
		book.date = new Date(book.date);
		this.elements.push(this.elementFrom(book));
	    });
	}
	this.initPages();
	this.renderCurrentPage();
    },

    // Add book to UI
    addBook: function(book) {
	console.log("adding new book to ui...");
	console.log("ui elements: ",this.elements);
	const newElement = this.elementFrom(book);
	this.elements.push(newElement);
	if (this.elements.length && this.currentPage.done) {
	    this.initPages();
	}
	this.updateCurrentPage(newElement);
	this.alert(`'${book.title}' added successfully`,
		   "alert-success");
    },

    // update update current page
    updateCurrentPage: function(bookElement){
	let nowInit = false
	// init pages if null
	if (!this.pages){
	    this.initPages();
	    nowInit = true;
	}
	// add book element to current page if not full/ended
	// skip if init happened here.
	if (!nowInit && !this.currentPage.done){
	    const currPageLen = this.currentPage.value.content.length;
	    if (pageSize > currPageLen){
		this.currentPage.value.content.push(bookElement);
	    } else {
		if (this.totalPageCount() > this.currentPageNo) {
		    this.currentPage = this.pages.next();
		}
	    }
	}
	this.renderCurrentPage();
	this.updatePageInfo();
	this.updatePageNav();
    },

    renderCurrentPage: function(){
	console.log("rendering page...");
	if (!this.currentPage.done){
	    bookList.innerHTML = "";
	    this.currentPage.value.content.forEach((item) => {
		bookList.appendChild(item);
	    });
	    this.currentPageNo =  this.currentPage.value.page;
	}
	console.log(this.currentPage);
	this.updatePageInfo();
	this.updatePageNav();
    },

    updatePageInfo: function(){
	const totalPages = this.totalPageCount();
	const currPage = totalPages ? this.currentPageNo : 0;
	pageInfo.textContent = `page ${currPage}/${totalPages}`;
    },

    elementFrom: function (book){
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
	return(newRow);
    },

    // load next/prev ui page
    loadNextPage: function(forward=true){
	const nextPage = forward ? this.pages.next() : this.pages.prev();
	console.log("loading next page....");
	if (!nextPage.done){
	    this.currentPage = nextPage;
	    this.renderCurrentPage();
	    this.updatePageInfo();
	    this.updatePageNav();
	} else { console.log(`nexpage.done = ${nextPage.done}`) };
    },

    // update page navigation
    updatePageNav: function(){
	if (this.currentPageNo === 1){
	    prev.className = "pg-inactive";
	    if (this.elements.length > pageSize){
		next.className = "pg-active";
	    } else {
		next.className = "pg-inactive";
	    }
	} else {
	    prev.className = "pg-active";
	    if (this.currentPageNo === this.totalPageCount()){
		next.className = "pg-inactive";
	    } else {
		next.className = "pg-active";
	    }
	}
    },

    // get total pages count
    totalPageCount: function(){
	const totalElements = this.elements.length;
	const pageCount = Math.floor(totalElements / pageSize) +
	      (totalElements % pageSize ? 1 : 0);
	return pageCount;
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
	const elem = target.parentElement.parentElement;
	const pageItems = this.currentPage.value.content;
	this.currentPage.value.content = pageItems.filter((item) =>{
	    return item.id !== elem.id;
	});
	this.elements = this.elements.filter((item) => {
	    return elem.id !== item.id;
	});
	elem.remove();
	const pageItemsLeft = this.currentPage.value.content.length;
	console.log(`pg items left:${pageItemsLeft}
obj items left: ${this.elements.length}`);
	if (!pageItemsLeft){
	    const pagesCount = this.totalPageCount();
	    const prevPage = this.currentPageNo - 1 ;
	    if (pagesCount) {
		if (prevPage){
		console.log(`itemsleft:${this.elements.length},
pagesCount:${pagesCount}, current page:${this.currentPageNo}
previous page:${prevPage}`);
		    this.currentPage = this.pages.prev();
		    this.currentPage.value.page = prevPage;
		    this.currentPage.value.pageCount = pagesCount;
		    console.log(this.currentPage.value.content);
		    this.renderCurrentPage();
		} else {
		    location.reload();
		}
	    }
	    this.updatePageInfo();
	    this.updatePageNav();
	}
	console.log(`this.currentPageNo: ${this.currentPageNo}`);
	this.alert("Book deleted successfully", "alert-success");
    }
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
