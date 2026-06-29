
const GRID_SIZE = 20;

const BUILDINGS = {

    house: {
        icon: "🏠",
        cost: 100,
        income: 0,
        population: 5
    },

    office: {
        icon: "🏢",
        cost: 350,
        income: 15,
        population: 0
    },

    factory: {
        icon: "🏭",
        cost: 600,
        income: 40,
        population: 0
    },

    park: {
        icon: "🌳",
        cost: 80,
        income: 0,
        population: 0
    },

    road: {
        icon: "🛣️",
        cost: 20,
        income: 0,
        population: 0
    }

};


const game = {

    money: 5000,

    population: 0,

    income: 0,

    selected: "house",

    map: [],

    buildings: {

        house:0,

        office:0,

        factory:0,

        park:0,

        road:0

    }

};


const grid=document.getElementById("city-grid");

const money=document.getElementById("money");

const population=document.getElementById("population");

const income=document.getElementById("income");

const houses=document.getElementById("houses");

const offices=document.getElementById("offices");

const factories=document.getElementById("factories");

const message=document.getElementById("message");

const tools=document.querySelectorAll(".tool");


function createGrid(){

    grid.innerHTML="";

    game.map=[];

    for(let y=0;y<GRID_SIZE;y++){

        for(let x=0;x<GRID_SIZE;x++){

            const cell=document.createElement("div");

            cell.className="cell empty";

            cell.dataset.x=x;

            cell.dataset.y=y;

            cell.dataset.type="empty";

            cell.addEventListener("click",placeBuilding);

            grid.appendChild(cell);

            game.map.push({

                x,

                y,

                type:"empty"

            });

        }

    }

}


tools.forEach(button=>{

    button.addEventListener("click",()=>{

        tools.forEach(t=>t.classList.remove("active"));

        button.classList.add("active");

        game.selected=button.dataset.building;

        updateMessage(
            "Strumento selezionato: "
            + button.textContent.trim()
        );

    });

});


function updateHUD(){

    money.textContent=game.money;

    population.textContent=game.population;

    income.textContent=game.income;

    houses.textContent=game.buildings.house;

    offices.textContent=game.buildings.office;

    factories.textContent=game.buildings.factory;

}


function updateMessage(text){

    message.textContent=text;

}



function calculateIncome(){

    game.income=

        game.buildings.office*15+

        game.buildings.factory*40;

}


function calculatePopulation(){

    game.population=

        game.buildings.house*5;

}



function getCell(x,y){

    return document.querySelector(

        '.cell[data-x="'+x+'"][data-y="'+y+'"]'

    );

}



function refreshGame(){

    calculateIncome();

    calculatePopulation();

    updateHUD();

}


createGrid();

refreshGame();

updateMessage("Benvenuto Sindaco! Costruisci la tua prima città.");

const buildSound = document.getElementById("buildSound");
const moneySound = document.getElementById("moneySound");
const clickSound = document.getElementById("clickSound");


function playSound(sound){

    if(!sound) return;

    sound.currentTime = 0;

    sound.play().catch(()=>{});

}


function showNotification(text){

    const old = document.querySelector(".notification");

    if(old) old.remove();

    const div = document.createElement("div");

    div.className = "notification";

    div.textContent = text;

    document.body.appendChild(div);

    setTimeout(()=>{

        div.remove();

    },3000);

}


function placeBuilding(event){

    const cell = event.currentTarget;

    const type = game.selected;


    if(type === "bulldozer"){

        demolish(cell);

        return;

    }


    if(cell.dataset.type !== "empty"){

        updateMessage("Questa casella è già occupata.");

        return;

    }


    const building = BUILDINGS[type];

    if(!building) return;


    if(game.money < building.cost){

        updateMessage("Fondi insufficienti.");

        showNotification("❌ Denaro insufficiente");

        return;

    }


    game.money -= building.cost;


    cell.dataset.type = type;

    cell.className = "cell";

    cell.classList.add(type);

    cell.classList.add("build");

    cell.textContent = "";


    const x = Number(cell.dataset.x);

    const y = Number(cell.dataset.y);

    const tile = game.map.find(t=>t.x===x && t.y===y);

    if(tile){

        tile.type = type;

    }


    game.buildings[type]++;


    refreshGame();

    playSound(buildSound);

    updateMessage(type.toUpperCase()+" costruito.");

    showNotification("✅ Costruzione completata");

}


function demolish(cell){

    if(cell.dataset.type==="empty"){

        updateMessage("Nessun edificio da demolire.");

        return;

    }


    const oldType = cell.dataset.type;


    if(game.buildings[oldType] > 0){

        game.buildings[oldType]--;

    }


    const refund = Math.floor(

        BUILDINGS[oldType].cost * 0.50

    );

    game.money += refund;


    cell.className = "cell empty destroy";

    cell.dataset.type = "empty";

    cell.textContent = "";


    const x = Number(cell.dataset.x);

    const y = Number(cell.dataset.y);

    const tile = game.map.find(t=>t.x===x && t.y===y);

    if(tile){

        tile.type = "empty";

    }


    refreshGame();

    playSound(clickSound);

    updateMessage(

        "Edificio demolito (+"

        + refund +

        " €)"

    );

    showNotification("🗑 Edificio demolito");

}


function passiveIncome(){

    if(game.income<=0) return;

    game.money += game.income;

    updateHUD();

    playSound(moneySound);

}


function pulseRandomBuilding(){

    const cells = document.querySelectorAll(

        ".cell.house,.cell.office,.cell.factory"

    );

    if(cells.length===0) return;

    const random =

        cells[Math.floor(Math.random()*cells.length)];

    random.animate(

        [

            {

                transform:"scale(1)"

            },

            {

                transform:"scale(1.10)"

            },

            {

                transform:"scale(1)"

            }

        ],

        {

            duration:500

        }

    );

}


setInterval(()=>{

    passiveIncome();

},1000);


setInterval(()=>{

    pulseRandomBuilding();

},1500);


game.stats = {

    playTime:0,

    moneyEarned:0,

    moneySpent:0,

    buildingsPlaced:0,

    buildingsDestroyed:0

};


const SAVE_KEY = "city-builder-save-v1";


function saveGame(){

    const saveData={

        money:game.money,

        population:game.population,

        income:game.income,

        selected:game.selected,

        buildings:game.buildings,

        map:game.map,

        stats:game.stats

    };

    localStorage.setItem(

        SAVE_KEY,

        JSON.stringify(saveData)

    );

}


function loadGame(){

    const data=

        localStorage.getItem(SAVE_KEY);

    if(!data){

        return false;

    }

    const save=JSON.parse(data);

    game.money=save.money;

    game.population=save.population;

    game.income=save.income;

    game.selected=save.selected;

    game.buildings=save.buildings;

    game.map=save.map;

    game.stats=save.stats;

    rebuildCity();

    refreshGame();

    updateMessage("Salvataggio caricato.");

    return true;

}


function rebuildCity(){

    document.querySelectorAll(".cell").forEach(cell=>{

        cell.className="cell empty";

        cell.dataset.type="empty";

        cell.textContent="";

    });

    game.map.forEach(tile=>{

        if(tile.type==="empty") return;

        const cell=getCell(tile.x,tile.y);

        if(!cell) return;

        cell.dataset.type=tile.type;

        cell.className="cell";

        cell.classList.add(tile.type);

    });

}


function newCity(){

    if(

        !confirm(

            "Vuoi davvero eliminare la città?"

        )

    ){

        return;

    }

    localStorage.removeItem(SAVE_KEY);

    location.reload();

}


const saveBtn=document.getElementById("saveBtn");

const resetBtn=document.getElementById("resetBtn");


saveBtn.addEventListener("click",()=>{

    saveGame();

    showNotification("💾 Partita salvata");

    updateMessage("Salvataggio completato.");

});


resetBtn.addEventListener("click",()=>{

    newCity();

});


setInterval(()=>{

    saveGame();

},5000);


setInterval(()=>{

    game.stats.playTime++;

},1000);


function formatTime(seconds){

    const h=Math.floor(seconds/3600);

    const m=Math.floor((seconds%3600)/60);

    const s=seconds%60;

    return (

        String(h).padStart(2,"0")

        +":"

        +String(m).padStart(2,"0")

        +":"

        +String(s).padStart(2,"0")

    );

}


function gameReport(){

    console.clear();

    console.log(

        "========== CITY BUILDER =========="

    );

    console.log(

        "Denaro:",

        game.money

    );

    console.log(

        "Popolazione:",

        game.population

    );

    console.log(

        "Entrate:",

        game.income

    );

    console.log(

        "Case:",

        game.buildings.house

    );

    console.log(

        "Uffici:",

        game.buildings.office

    );

    console.log(

        "Fabbriche:",

        game.buildings.factory

    );

    console.log(

        "Parchi:",

        game.buildings.park

    );

    console.log(

        "Strade:",

        game.buildings.road

    );

    console.log(

        "Tempo:",

        formatTime(

            game.stats.playTime

        )

    );

    console.log(

        "Costruzioni:",

        game.stats.buildingsPlaced

    );

    console.log(

        "Demolizioni:",

        game.stats.buildingsDestroyed

    );

}


setInterval(()=>{

    gameReport();

},5000);


window.addEventListener("load",()=>{

    const loaded=loadGame();

    if(loaded){

        showNotification(

            "🏙 Città ripristinata"

        );

    }

});


const tooltip = document.getElementById("tooltip");
const tooltipTitle = document.getElementById("tooltip-title");
const tooltipText = document.getElementById("tooltip-text");


function showTooltip(type){

    if(type==="empty"){

        tooltip.classList.add("hidden");

        return;

    }

    const data=BUILDINGS[type];

    if(!data) return;

    tooltipTitle.textContent=
        data.icon+" "+type.toUpperCase();

    tooltipText.innerHTML=

        "<b>Costo:</b> "+data.cost+" €<br><br>"+

        "<b>Entrate:</b> "+data.income+" €/sec<br><br>"+

        "<b>Popolazione:</b> "+data.population;

    tooltip.classList.remove("hidden");

}


function hideTooltip(){

    tooltip.classList.add("hidden");

}


function previewCell(cell){

    if(cell.dataset.type!=="empty") return;

    cell.classList.add("selected");

}


function removePreview(cell){

    cell.classList.remove("selected");

}


function initializeCellEvents(){

    document.querySelectorAll(".cell")

    .forEach(cell=>{

        cell.addEventListener("mouseenter",()=>{

            previewCell(cell);

            showTooltip(game.selected);

        });

        cell.addEventListener("mouseleave",()=>{

            removePreview(cell);

            hideTooltip();

        });

    });

}


function buildingInfo(type){

    if(type==="bulldozer"){

        updateMessage(

            "Modalità demolizione attiva."

        );

        return;

    }

    const b=BUILDINGS[type];

    updateMessage(

        b.icon+

        " Costo: "

        +b.cost+

        " €"

    );

}


tools.forEach(button=>{

    button.addEventListener("mouseenter",()=>{

        const type=

            button.dataset.building;

        if(type==="bulldozer"){

            tooltipTitle.textContent="🗑 Demolisci";

            tooltipText.textContent=

            "Rimuove un edificio e restituisce il 50% del costo.";

        }

        else{

            const b=BUILDINGS[type];

            tooltipTitle.textContent=

                b.icon+

                " "+type.toUpperCase();

            tooltipText.innerHTML=

                "<b>Costo:</b> "+b.cost+

                " €<br><br>"+

                "<b>Entrate:</b> "+b.income+

                " €/sec<br><br>"+

                "<b>Popolazione:</b> "+b.population;

        }

        tooltip.classList.remove("hidden");

    });

    button.addEventListener("mouseleave",()=>{

        tooltip.classList.add("hidden");

    });

});


function highlightTool(){

    tools.forEach(tool=>{

        if(

            tool.dataset.building===game.selected

        ){

            tool.classList.add("active");

        }

        else{

            tool.classList.remove("active");

        }

    });

}


function selectTool(type){

    game.selected=type;

    highlightTool();

    buildingInfo(type);

}


document.addEventListener("keydown",(event)=>{

    switch(event.key){

        case "1":

            selectTool("house");

        break;

        case "2":

            selectTool("office");

        break;

        case "3":

            selectTool("factory");

        break;

        case "4":

            selectTool("park");

        break;

        case "5":

            selectTool("road");

        break;

        case "0":

            selectTool("bulldozer");

        break;

    }

});


function updateCursor(){

    const grid=

        document.getElementById("city-grid");

    if(game.selected==="bulldozer"){

        grid.style.cursor="crosshair";

    }

    else{

        grid.style.cursor="pointer";

    }

}


tools.forEach(button=>{

    button.addEventListener("click",()=>{

        updateCursor();

    });

});


initializeCellEvents();

highlightTool();

updateCursor();