const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOK_APPS';

var margin_left_slide = -100;
var interval = setInterval(slideshow, 6000);

document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('inputBook');
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
    });

    if (isStorageExist()) loadDataFromStorage();
});

function addBook() {
    var isComplete = false;
    const title = document.getElementById('inputBookTitle').value;
    const author = document.getElementById('inputBookAuthor').value;
    const year = parseInt(document.getElementById('inputBookYear').value);
    const complete = document.getElementById('inputBookIsComplete');
    if (complete.checked) isComplete = true;

    const objectBook = books.filter(book => book.title == title);
    if (objectBook.length < 1) {
        const generatedID = generateId();
        const bookObject = generateBookObject(generatedID, title, author, year, isComplete);
        books.push(bookObject);
    
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
    } else {
        toast("Gagal memasukkan buku", "error", "Judul buku sudah tersedia")
    }
}

function generateId() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
    return {
      id,
      title,
      author,
      year,
      isComplete
    }
}

document.addEventListener(RENDER_EVENT, function () {
    const uncompletedBookList = document.getElementById('uncompleteBookshelfList');
    uncompletedBookList.innerHTML = '';

    const completedBookList = document.getElementById('completeBookshelfList');
    completedBookList.innerHTML = '';
    
    for (const bookItem of books) {
        const bookElement = makeBook(bookItem);
        if (!bookItem.isComplete)
            uncompletedBookList.append(bookElement);
        else
            completedBookList.append(bookElement);
    }
});

function makeBook(bookObject) {
    const textTitle = document.createElement('h2');
    textTitle.innerText = bookObject.title;

    const textInfo = document.createElement('p');
    textInfo.innerHTML = "Author: " + bookObject.author + "<br>" +
        "Year &nbsp; &nbsp;: " + bookObject.year;

    const textContainer = document.createElement('div');
    textContainer.classList.add('inner');
    textContainer.append(textTitle, textInfo);

    const container = document.createElement('div');
    container.classList.add('item', 'shadow');
    container.append(textContainer);
    container.setAttribute('id', `book-${bookObject.id}`);

    const undoButton = document.createElement('button');
    undoButton.classList.add('undo-button');
    undoButton.title = "Pindahkan Buku";

    undoButton.addEventListener('click', function () {
        undoTitleFromCompleted(bookObject.id, bookObject.isComplete);
    });

    const trashButton = document.createElement('button');
    trashButton.classList.add('trash-button');
    trashButton.title = "Hapus Buku";

    trashButton.addEventListener('click', function () {
        removeTitleFromCompleted(bookObject.id);
    });

    container.append(undoButton, trashButton);
    return container;
}

function undoTitleFromCompleted(bookId, complete) {
    const bookTarget = findBook(bookId);
   
    if (bookTarget == null) return;
   
    if (complete) 
        bookTarget.isComplete = false;
    else
        bookTarget.isComplete = true;

    saveData();
    pencarian(1);
    toast("Buku berhasil dipindahkan", "success")
}

function removeTitleFromCompleted(bookId) {
    Swal.fire({
        title: "Yakin buku ingin di hapus?",
        showCancelButton: true,
        confirmButtonText: "Hapus",
    }).then((result) => {
        if (result.isConfirmed) {
            const bookTarget = findBookIndex(bookId);
            if (bookTarget === -1) return;
            books.splice(bookTarget, 1);
            document.getElementById('searchBookTitle').value = "";
            document.dispatchEvent(new Event(RENDER_EVENT));
            saveData();
            toast("Buku berhasil di hapus", "success");
        }
    });
}

function findBook(bookId) {
    resetBooks();
    for (const bookItem of books) {
      if (bookItem.id === bookId) return bookItem;
    }
    return null;
}

function findBookIndex(bookId) {
    resetBooks();
    for (const index in books) {
      if (books[index].id === bookId) return index;
    }
   
    return -1;
}

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function isStorageExist() {
    if (typeof (Storage) === undefined) {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);
   
    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }
   
    document.dispatchEvent(new Event(RENDER_EVENT));
}

function resetBooks() {
    books.splice(0);
    loadDataFromStorage();
}

document.addEventListener(SAVED_EVENT, function () {
    toast("Buku berhasil di simpan", "success")
});

document.getElementById('inputBookIsComplete').addEventListener('change', function(event) {
    const textRack = "Masukkan Buku ke rak ";
    const complete = document.getElementById('inputBookIsComplete');
    const rack = document.getElementById('rack');
    if (complete.checked)
        rack.innerHTML = textRack + "<b>Selesai dibaca</b>";
    else
        rack.innerHTML = textRack + "<b>Belum selesai dibaca</b>";
});

document.getElementById('searchBook').addEventListener('submit', function(event) {
    event.preventDefault();
    pencarian(0);
});

function pencarian(kod) {
    loadDataFromStorage();
    var searchBookTitle = document.getElementById('searchBookTitle').value;

    if (searchBookTitle === "") {
        resetBooks();
        if (kod == 0) toast("Silahkan masukkan judul", "warning");

    } else {
        if (books !== null) {
            if (books.length > 0) {
                const objectBook = books.filter(book => book.title == searchBookTitle);

                if (objectBook.length > 0) {
                    books.splice(0);
                    books.push(objectBook[0]);
                } else {
                    resetBooks();
                    toast("Buku tidak tersedia", "warning");
                }
            } else {
                resetBooks();
                toast("Tidak ada data buku", "info");
            }
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

function toast(title, type, text = "") {
    Swal.fire({
        toast: true,
        title: title,
        text: text,
        position: "top-end",
        icon: type,
        background: "white",
        showConfirmButton: false,
        showCancelButton: false,
        timer: 4000,
    });
}

function slideshow() {
    slide = document.getElementById('slide');
    if (margin_left_slide != 0) {
        slide.style="margin-left:"+margin_left_slide+"%;transition: 2s ease-in;";
        if (margin_left_slide == -300)
            margin_left_slide=0;
        else
            margin_left_slide=margin_left_slide+-100;
        
        return margin_left_slide;
    } else {
        slide.style="margin-right:300%;transition: 2s ease-in;";
        margin_left_slide = -100;
        return margin_left_slide;
    }
}
