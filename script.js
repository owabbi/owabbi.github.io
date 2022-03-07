var Education = document.getElementById("education");
var Experience = document.getElementById("experience");
var Skills = document.getElementById("skills");
var Hobbies = document.getElementById("hobbies");
var About = document.getElementById("about");
var Contact = document.getElementById("contact");
var Projects = document.getElementById("projects");
var Jupiter = document.getElementById("jupiter");


var tabAbout = document.getElementById("tab-about");
var tabContact = document.getElementById("tab-contact");
var tabJupiter = document.getElementById("tab-jupiter");

const allDivs = document.getElementsByClassName("part");
var current = document.getElementsByClassName("current");

const searchBar = document.getElementsByClassName("console");

var results = [
    ["> education", 1],
    ["> experience", 2],
    ["> skills", 3],
    ["> hobbies", 4],
    ["> about", 5],
    ["> contact", 6],
    ["> projects", 7],
    ["> jupiter", 8],
];

var shownTabs = [1, 2, 3, 4];


function show(part) {
    switch (part) {
        case 1:
            current[0].classList.remove('current');
            Education.classList.add('current');
            searchBar[0].value = "> education";
            break;
        case 2:
            current[0].classList.remove('current');
            Experience.classList.add('current');
            searchBar[0].value = "> experience";
            break;
        case 3:
            current[0].classList.remove('current');
            Skills.classList.add('current');
            searchBar[0].value = "> skills";
            break;
        case 4:
            current[0].classList.remove('current');
            Hobbies.classList.add('current');
            searchBar[0].value = "> hobbies";
            break;
        case 5:
            current[0].classList.remove('current');
            About.classList.add('current');
            searchBar[0].value = "> about";
            break;
        case 6:
            current[0].classList.remove('current');
            Contact.classList.add('current');
            searchBar[0].value = "> contact";
            break;
        case 7:
            current[0].classList.remove('current');
            Projects.classList.add('current');
            searchBar[0].value = "> projects";
            break;
        case 8:
            current[0].classList.remove('current');
            Jupiter.classList.add('current');
            searchBar[0].value = "> jupiter";
            break;

        default:
            break;
    }

}

function activateTab(tabID) {
    switch (tabID) {
        case 5:
            tabAbout.classList.remove('hidden-tab');
            break;
        case 6:
            tabContact.classList.remove('hidden-tab');
            break;
        case 8:
            tabJupiter.classList.remove('hidden-tab');
            break;

        default:
            break;
    }
}

function Search(item) {
    console.log(item);
    console.table(shownTabs);
    for (let i = 0; i < results.length; i++) {
        const elem = results[i];
        console.log("Checking for " + elem[0]);
        if (item == elem[0]) {
            show(elem[1]);
            const found = shownTabs.find(element => element == elem[1]);
            if (found == undefined) {
                activateTab(elem[1]);
            }
        }

    }
}

function activate() {
    console.log("ACTIVATED");

}