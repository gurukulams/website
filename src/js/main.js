import { Dropdown } from "bootstrap";

const postTemplate = document.getElementById( "postTemplate");
const postsContainer = document.getElementById("posts");
const commentTemplate = document.getElementById("commentTemplate");


const renderPost = (post,users) => {
    const postContainer = postTemplate.content.cloneNode(true);
    postContainer.querySelector("h5").innerHTML = post.title;
    postContainer.querySelector("p").innerHTML = post.body;
    const commentsCount = postContainer.querySelector("div.d-flex.flex-row.muted-color");
    const commentsContainer = postContainer.querySelector( ".comments");
    const userName = postContainer.querySelector(".font-weight-bold");
    const companyName = postContainer.querySelector(".text-primary");
    postsContainer.appendChild(postContainer);  

    const user = users.find((user) => user.id === post.userId);

    userName.innerHTML = user.name;
    companyName.innerHTML = user.company.name;

    

    console.log(user);


  fetch('https://jsonplaceholder.typicode.com/posts/' + post.id + '/comments')
    .then(response => response.json())
    .then(comments => {
        commentsCount.innerHTML=  `${comments.length} comments`;
        comments.forEach(comment => {
           const commentContainer = commentTemplate.content.cloneNode(true);
           commentContainer.querySelector(".comment-text").innerHTML = comment.body;
           commentContainer.querySelector(".name").innerHTML = comment.email;

           commentsContainer.appendChild(commentContainer); 
        });
        }
        )
}

fetch('https://jsonplaceholder.typicode.com/users')
  .then(response => response.json())
  .then(users => {

    // users.forEach(user => {
    //     console.log(user);
    // });


    fetch('https://jsonplaceholder.typicode.com/posts')
    .then(response => response.json())
    .then(posts => {
      posts.forEach(post => {
          renderPost(post, users);
      });
      
  })
    
})




