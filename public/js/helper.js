var terms = [];

var artNames = document.querySelectorAll(".article-list a");
for (let a = 0; a < artNames.length; a++) {
    //Add the link's text and href as an array [text, href]
    terms.push([artNames[a].innerText, artNames[a].getAttribute("href")]);
}

var inp = document.getElementById("search-input");
var sugg = document.getElementById("suggestions");


inp.addEventListener("input", function (e) {
    refreshSuggestions();
    e.preventDefault();
})


function refreshSuggestions() {
    let matches = [];
    let len = inp.value.length;
    sugg.innerHTML = "";

    //For each term, if the start of it matches the input, add to array of matches
    for (term in terms) {
        if (terms[term][0].substring(0, len).toLowerCase() == inp.value.toLowerCase()) {
            matches.push(terms[term]);
        }
    }

    // For each match, create div with match text and onclick event and add to suggestions div.
    for (mat in matches) {
        let suggestion = document.createElement("div");
        suggestion.innerText = matches[mat][0];
        suggestion.onclick = function () {
            window.location = matches[mat][1];
        }
        sugg.appendChild(suggestion);
    }
}
