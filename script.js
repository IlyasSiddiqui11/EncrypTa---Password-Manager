console.log("heh");

const getElementsByClassName = document.getElementsByClassName("access-vault-button");

getElementsByClassName[0].addEventListener("click", function(){
    console.log("Hello world");
    window.location.href = "vault.html";
});
