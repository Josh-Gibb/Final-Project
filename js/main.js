function createElemWithText(name = "p", text = "", className){
    let element = document.createElement(name);
    element.textContent = text;
    if(className){
        element.classList.add(className);
    }
    return element;
}

function createSelectOptions(data){
    if(data){
    let options = [];
    data.forEach(user =>{
        let option = document.createElement("option");
        option.value = user.id;
        option.textContent = user.name;
        options.push(option);
    });
    return options;
    }
    return undefined;
}

function toggleCommentSection(postId){
    if(postId){
        const section = document.querySelector(`section[data-post-id = '${postId}']`);
        if(section){
            section.classList.toggle("hide");
            return section;
        }
        else{
            return null;
        }
    }
    else{
        return undefined;
    }
}

function toggleCommentButton(postId){
    if(postId){
        const button = document.querySelector(`button[data-post-id = '${postId}']`);
        if(button){
            const text = button.textContent == 'Show Comments'? 'Hide Comments': 'Show Comments';
            button.textContent = text;
            return button;
        }
        else{
            return null;
        }
    }
    else{
        return undefined;
    }
}

function deleteChildElements(parent){
    if(parent?.tagName)
    {
        let last = parent.lastChild;
        while(last){
            parent.removeChild(last);
            last = parent.lastChild;
        }
        return parent;
    }
    else{
        return undefined;
    }
}

function addButtonListeners(){
    const buttons = document.querySelector('main').querySelectorAll('button');
    if(buttons){
        const postId = buttons.forEach(button =>{
            button.addEventListener("click", function (e) {toggleComments(e, button.dataset.postId)}, false);
            return button.dataset.postId;
        });
    }
    return buttons;
}

function removeButtonListeners(){
    const buttons = document.querySelector('main').querySelectorAll('button');
    if(buttons){
    const postId = buttons.forEach(button =>{
        button.removeEventListener("click", function (e) {toggleComments(e, button.dataset.postId)}, false);
        return button.dataset.postId;
    });
    }
    return buttons;
}

function createComments(data){
    if(!data) return;
    const fragment = document.createDocumentFragment();
    for(let i = 0; i < data.length; i++){
        const art = document.createElement("article");
        const name = createElemWithText("h3", data[i].name);
        const body = createElemWithText("p", data[i].body);
        const email = createElemWithText("p", `From: ${data[i].email}`);
        art.append(name, body, email);
        fragment.append(art);
    }
    return fragment;
}

function populateSelectMenu(data){
    if(!data) return;
    const menu = document.querySelector("#selectMenu");
    const users = createSelectOptions(data);
    for(let i = 0; i < users.length; i++){
        menu.append(users[i]);
    }
    return menu;
}

async function getUsers(){
    try{
        const data = await fetch("https://jsonplaceholder.typicode.com/users");
        const response = await data.json();
        return response;
    }
    catch(err){
        alert("error getting users   main.js::getUsers()");
        return;
    }
}

async function getUserPosts(userId){
    if(!userId) return;
    try{
        const data = await fetch(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`);
        const response = await data.json();
        return response;
    }
    catch(err){
        alert("error getting users posts  main.js::getUserPosts(userId)");
        return;
    }
}

async function getUser(userId){
    if(!userId) return;
    try{
        const data = await fetch(`https://jsonplaceholder.typicode.com/users?id=${userId}`);
        const response = await data.json();
        return response[0];
    }catch(err){
        alert("error getting a specific user, main.js::getUsers(userId)");
        return;
    }
}

async function getPostComments(postId){
    if(!postId) return;
    try{
        const data = await fetch(`https://jsonplaceholder.typicode.com/comments?postId=${postId}`);
        const response = await data.json();
        return response;
    }catch(err){
        alert("error getting a specific user, main.js::getPostComments(postId)");
        return;
    }
}

async function displayComments(postId){
    if(!postId) return;
    const section = document.createElement("section");
    section.dataset.postId = postId;
    section.classList.add("comments");
    section.classList.add("hide");
    let comments = await getPostComments(postId);
    const fragment = createComments(comments);
    section.append(fragment);
    return section;    
}

async function createPosts(data){
    if(!data) return;
    const fragment = document.createDocumentFragment();
    for(let i = 0; i < data.length; i++){
        const art = document.createElement("article");
        const title = createElemWithText('h2', data[i].title);
        const body = createElemWithText('p', data[i].body);
        const id = createElemWithText('p', `Post ID: ${data[i].id}`);
        const author = await getUser(data[i].userId);
        const info = createElemWithText('p', `Author: ${author.name} with ${author.company.name}`);
        const authorsCompany = createElemWithText('p', author.company.catchPhrase);
        const button = document.createElement("button");
        button.textContent = "Show Comments";
        button.dataset.postId = data[i].id;
        art.append(title, body, id, author, info, authorsCompany, button);
        const section = await displayComments(data[i].id);
        art.append(section);
        fragment.append(art);
    }
    return fragment;
}

async function displayPosts(posts){
    const main = document.querySelector("main");
    let element;
    if(posts){
        element = await createPosts(posts);
    }else{  
        const def = document.querySelector(".default-text");
        element = createElemWithText(def.element, def.textContent, def.className);
    }
    main.append(element);
    return element;
}

function toggleComments(e, postId){
    if(!(event || postId)) return;
    e.target.listener = true;
    const sect = toggleCommentSection(postId);
    const but = toggleCommentButton(postId);
    return [sect, but];
}

async function refreshPosts(data){
    if(!data) return;
    const removeButtons = removeButtonListeners();
    const main = deleteChildElements(document.querySelector("main"));
    const frag = await displayPosts(data);
    const addButtons = addButtonListeners();
    return[removeButtons, main, frag, addButtons];
}

async function selectMenuChangeEventHandler(event){
    if(event){
        document.getElementById("selectMenu").disable = true;
        const userId = event?.target?.value || 1;
        const posts = await getUserPosts(userId);
        const refreshPostArray = await refreshPosts(posts);
        document.getElementById("selectMenu").disable = false;
        return [userId, posts, refreshPostArray];
    }
    return undefined;
}   

async function initPage(){
    const users = await getUsers();
    const select = populateSelectMenu(users);
    return [users, select];
}

function initApp(){
    initPage();
    const menu = document.getElementById("selectMenu");
    menu.addEventListener("change", selectMenuChangeEventHandler, false);
}

document.addEventListener("DOMContentLoaded", initApp(), false);

