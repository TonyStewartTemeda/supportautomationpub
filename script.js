function changeTools(toolBar,mb1,mb2,mb3,mb4){ 
    var toolBarSetTo = document.getElementById(toolBar).className;
    
    if (toolBarSetTo === "toolsbarcol"){
        document.getElementById(toolBar).className = 'toolsbarexp';
        //For the love of god Tony please do a for while loop on getElementsByClass here and change all of these at once
        document.getElementById(mb1).className = 'expmenutxt';
        document.getElementById(mb2).className = 'expmenutxt';
        document.getElementById(mb3).className = 'expmenutxt';
        document.getElementById(mb4).className = 'expmenutxt';
    } else {
        document.getElementById(toolBar).className = 'toolsbarcol';
        //Seriously this is fucking stupid why are you doing this?!
        document.getElementById(mb1).className = 'expmenuhidden';
        document.getElementById(mb2).className = 'expmenuhidden';
        document.getElementById(mb3).className = 'expmenuhidden';
        document.getElementById(mb4).className = 'expmenuhidden';
    }
}
