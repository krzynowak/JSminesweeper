/* Game configuration parameters -> grid */
let rows: number = 8;
let cols: number = 8;
let bombCnt: number = 10;

/* Game state related variables; */
let started: boolean = false;
let gameOn: boolean = false;
let fieldsUndiscoveredEmpty: number = rows * cols - bombCnt;
let bombRoot: any[];

/* UI related variables */
let time:number = 0;
let timeInter;
let activeBombs:number = 0;

/* Iteration related variables - why waste memory if you don't need to? */
let row: number;
let col: number;
let idx: number;


/* Set diffculty */
function setDiff(diffculty: number)
{
    switch (diffculty)
    {
        case 0:
        {
            rows    = 8;
            cols    = 8;
            bombCnt = 10;
            break;
        }

        case 1:
        {
            rows    = 16;
            cols    = 16;
            bombCnt = 40;
            break;
        }

        case 2:
        {
            rows    = 16;
            cols    = 30;
            bombCnt = 99;
            break;
        }

        default: alert("Custom size not supported, because I don't want it.");
    }

    initPage();
}

/* Generate bomb layout */
function initBombs()
{
    idx = 0;
    while(idx < bombCnt)
    {
        row = Math.floor((Math.random() * rows));
        col = Math.floor((Math.random() * cols));

        if( 'b' != bombRoot[row][col])
        {
            bombRoot[row][col] = 'b';
            idx++;
        }
    }
}

/* End of game show all mines */
function revealBombs()
{
    var counter: number = 0;

    for(row = 0; row < rows; row++)
    {
        for(col = 0; col < cols; col++)
        {
            if('b' == bombRoot[row][col])
            {
                var elem = document.getElementById(counter.toString());
                elem.innerHTML = "X";
                if(elem.classList.contains('blocked'))
                {
                    elem.style.backgroundColor = "#009933";
                }
                else
                {
                    elem.style.backgroundColor = "#0033cc";
                }
            }

            counter++;
        }    
    } 
}

/* Function for enightbour counting */
function cntNeigh(r:number, c:number)
{
    let rMin:number = (r - 1) < 0      ? 0  : (r - 1);
    let rMax:number = (r + 1) < rows   ? (r + 1) : rows-1;
    let cMin:number = (c - 1) < 0      ? 0 : (c - 1);
    let cMax:number = (c + 1) < cols   ? (c + 1) : cols-1;
    let cnt:number = 0;

    let rId:number = 0;
    let cId:number = 0;    

    for(rId = rMin; rId <= rMax; rId++)
    {
        for(cId = cMin; cId <= cMax; cId++)
        {
            if( 'b' == bombRoot[rId][cId] ) cnt++;
        } 
    }

    bombRoot[r][c] = (0 == cnt) ? '' : cnt;
}

/* Empty fields reveal all neighbours */
function updateNeighbours(r:number, c:number)
{
    let rMin:number = (r - 1) < 0      ? 0  : (r - 1);
    let rMax:number = (r + 1) < rows   ? (r + 1) : rows-1;
    let cMin:number = (c - 1) < 0      ? 0 : (c - 1);
    let cMax:number = (c + 1) < cols   ? (c + 1) : cols-1;
    var nIdx: number;

    let rId:number = 0;
    let cId:number = 0;    

    for(rId = rMin; rId <= rMax; rId++)
    {
        for(cId = cMin; cId <= cMax; cId++)
        {
            nIdx = rId * cols + cId;
            selectField(document.getElementById(nIdx.toString()), nIdx);
        } 
    }
}

/* Called after victory or loss */
function gameTermination()
{
    clearInterval(timeInter);
    revealBombs();
    started = false;
    gameOn = false;
}

/* Run when victory condition is met */
function victory()
{
    gameTermination();
    /* Find an image with cool sungalses - TODO SOMEDAY */
    console.log("YOU WON!");
}

/* Run when defeat condition is met */
function defeat()
{
    gameTermination();
    document.getElementsByTagName("button")[3].style.backgroundImage = "url('img/sad.png')";
    console.log("YOU LOST!");
}

/* LMB - Check field */
function selectField(elem, idx:number)
{
    if(!elem.classList.contains('revealed') && gameOn)
    {
        elem.classList.add('revealed');

        /* If this si the first one then start timer */
        if ( false == started )
        {
            timeInter = setInterval(timeCnterCaallback, 1000);
            started = true;
        }

        /* Is field blocked? */
        if(!elem.classList.contains('blocked')) 
        {
            var currentField = bombRoot[Math.floor(idx / cols)][idx % cols];

            /* Decide based on bomb */
            if( 'b' != currentField )
            {
                /* Get closer to win condition */
                fieldsUndiscoveredEmpty--;

                /* Display field value -> empty/neighbours that are bombs */
                elem.innerHTML = currentField;

                /* Set color to differentiate */
                elem.style.backgroundColor = '#c8c8c8';

                if( '' == currentField ) updateNeighbours(Math.floor(idx / cols), idx % cols);

                /* Was this the last one? -> if yes then u win */
                if( 0 == fieldsUndiscoveredEmpty )
                {
                    victory();
                }
            }
            else
            {
                /* Bad luck or lack of skill -> hit a bomb -> lost */
                elem.innerHTML = "X";
                defeat();
            }
        }
    }
}

/* RMB - Mark field as suspected bomb -> decrease counter for bombs and make this field unexplodable unless this is called agian. */
function markField(elem)
{
    if(elem.classList.toggle('blocked'))
    {
        activeBombs--;
    }
    else
    {
        activeBombs++;
    }

    updateBombCnter();

    window.event.returnValue = false;
}

/* Game initialization function */
function initPage()
{
    var tab = document.getElementById('field');
    var counter: number = 0;

    tab.innerHTML = "";
    
    var rowStr: string = "";

    bombRoot = new Array(rows);

    /* Initialize game field */
    for(row = 0; row < rows; row++)
    {
        bombRoot[row] = new Array(cols);

        rowStr = "";

        for(col = 0; col < cols; col++)
        {
            rowStr += "<th oncontextmenu=\'markField(this)\' id=\"" + counter + "\" onclick=\"selectField(this, "+ counter +")\"></th>";
            counter++;
            bombRoot[row][col]='';
        }

        tab.innerHTML += "<tr>" + rowStr + "</tr>";        
    }

    activeBombs = bombCnt;
    
    /* Generate bomb Layout */
    initBombs();

    /* Update hidden values for all fields */
    for(row = 0; row < rows; row++)
    {
        for(col = 0; col < cols; col++)
        {
            if('b' != bombRoot[row][col] ) cntNeigh(row, col);
        }
    }

    /* Bomb counter for victory condition */
    fieldsUndiscoveredEmpty = rows * cols - bombCnt;

    /* Bomb counter */
    updateBombCnter();

    /* Set image on button */
    document.getElementsByTagName("button")[3].style.backgroundImage = "url('img/happy.png')";
    
    /* Stop timer */
    clearInterval(timeInter);
    
    /* Reset timer */
    time = 0;

    /*  Update displayed value */
    setCnter(document.getElementById("timeCnter"), 0, 0, 0);

    /* Set game as not started */
    started = false;
    gameOn = true;
}

/* Function for setting of counters bombs/time */
function setCnter(element, a, b, c)
{
    element.querySelector('img[name="a"]').src = "img/" + a + ".jpg";
    element.querySelector('img[name="b"]').src = "img/" + b + ".jpg";
    element.querySelector('img[name="c"]').src = "img/" + c + ".jpg";
}

/* Callback or timer */
function timeCnterCaallback()
{
    if(time<999)time++;

    setCnter(document.getElementById("timeCnter"), Math.floor(time/100), Math.floor((time%100)/10), time%10);
}

/* Callback for bombs */
function updateBombCnter()
{
    if(activeBombs >= 0) 
    {
        setCnter(document.getElementById("bombCnter"), Math.floor(activeBombs/100), Math.floor((activeBombs%100)/10), activeBombs%10);
    }
    else
    {
        setCnter(document.getElementById("bombCnter"), 9, 9, 9);
    }
}

/* Init at page load */
function intialCall()
{
    initPage();

    /* Add event space -> reset board */
    var elem = document.getElementsByTagName("body")[0];

    elem.addEventListener("keyup", function(event)
    {
        // Number 13 is the "Enter" key on the keyboard
        if (event.code  === "Space")
        {
            initPage();
        }
    });
}

/* Initialization at page load */
window.onload = intialCall;
