// Bakeoff #3 - Escrita em Smartwatches
// IPM 2020-21, Semestre 2
// Entrega: até dia 4 de Junho às 23h59 através do Fenix
// Bake-off: durante os laboratórios da semana de 31 de Maio

// p5.js reference: https://p5js.org/reference/

// Database (CHANGE THESE!)
const GROUP_NUMBER   = 24;      // add your group number here as an integer (e.g., 2, 3)
const BAKE_OFF_DAY   = false;  // set to 'true' before sharing during the simulation and bake-off days

let PPI, PPCM;                 // pixel density (DO NOT CHANGE!)
let second_attempt_button;     // button that starts the second attempt (DO NOT CHANGE!)

// Finger parameters (DO NOT CHANGE!)
let finger_img;                // holds our finger image that simules the 'fat finger' problem
let FINGER_SIZE, FINGER_OFFSET;// finger size and cursor offsett (calculated after entering fullscreen)

// Arm parameters (DO NOT CHANGE!)
let arm_img;                   // holds our arm/watch image
let ARM_LENGTH, ARM_HEIGHT;    // arm size and position (calculated after entering fullscreen)

// Study control parameters (DO NOT CHANGE!)
let draw_finger_arm  = false;  // used to control what to show in draw()
let phrases          = [];     // contains all 501 phrases that can be asked of the user
let current_trial    = 0;      // the current trial out of 2 phrases (indexes into phrases array above)
let attempt          = 0       // the current attempt out of 2 (to account for practice)
let target_phrase    = "";     // the current target phrase
let currently_typed  = "";     // what the user has typed so far
let entered          = new Array(2); // array to store the result of the two trials (i.e., the two phrases entered in one attempt)
let CPS              = 0;      // add the characters per second (CPS) here (once for every attempt)

// Metrics
let attempt_start_time, attempt_end_time; // attemps start and end times (includes both trials)
let trial_end_time;            // the timestamp of when the lastest trial was completed
let letters_entered  = 0;      // running number of letters entered (for final WPM computation)
let letters_expected = 0;      // running number of letters expected (from target phrase)
let errors           = 0;      // a running total of the number of errors (when hitting 'ACCEPT')
let database;                  // Firebase DB
let current_letter = 'a';      // current char being displayed on our basic 2D keyboard (starts with 'a')

/*********************** */
let circleX;
let circleY;
let circleW;
let offSet = 0;
let dragging = false;
let current_word = "";
let last_word = "";
let sugestionList = ["","",""];
const letters = "abcdefghijklmnopqrstuvwxyz"
let spaceX;
let spaceY;
let spaceW;
let deleteX;
let deleteY;
let deleteW;

let y_corner;
let x_corner;
const qwerty = "acegikmoqsuwybdfhjlnprtvxz"
//const qwerty = "abcdefghijklmnopqrstuvwxyz";
let shifted = false;
let maxDelay = 50;
let delay = maxDelay;


// Runs once before the setup() and loads our data (images, phrases)
function preload()
{    
  sugestions = loadStrings("data/simplified_count.txt");
  sugestions2 = loadStrings("data/simplified_count2.txt");
  // Loads simulation images (arm, finger) -- DO NOT CHANGE!
  arm = loadImage("data/arm_watch.png");
  fingerOcclusion = loadImage("data/finger.png");
    
  // Loads the target phrases (DO NOT CHANGE!)
  phrases = loadStrings("data/phrases.txt");
  
  // Loads UI elements for our basic keyboard
  space = loadImage("data/space.png");
  backspace = loadImage("data/backspace.png");
}

// Runs once at the start
function setup()
{
  createCanvas(700, 500);   // window size in px before we go into fullScreen()
  frameRate(60);            // frame rate (DO NOT CHANGE!)
  
  // DO NOT CHANGE THESE!
  shuffle(phrases, true);   // randomize the order of the phrases list (N=501)
  target_phrase = phrases[current_trial];
  
  drawUserIDScreen();       // draws the user input screen (student number and display size)
  console.log(sugestions2);

}

function draw()
{ 
  if(draw_finger_arm)
  {
    delay++;
    //console.log(last_word, current_word);
    //console.log(current_letter);
    background(255);           // clear background
    noCursor();                // hides the cursor to simulate the 'fat finger'
    
    writeTargetAndEntered();   // writes the target and entered phrases above the watch

    /******************* */
    if(!(mouseClickWithin(width/2 - 2.0*PPCM, height/2 - 1.0*PPCM, 4.0*PPCM, 3.0*PPCM))) {
      dragging = false;
    }

    // Draws the non-interactive screen area (4x1cm) -- DO NOT CHANGE SIZE!
    noStroke();
    fill(125);
    rect(width/2 - 2.0*PPCM, height/2 - 2.0*PPCM, 4.0*PPCM, 1.0*PPCM);
    textAlign(CENTER); 
    textFont("Arial", 16);
    fill(0);
    text(sugestionList[0], width/2, height/2 - 1.3 * PPCM);
    textAlign(LEFT, TOP);
    //console.log(sugestionList[1]);
    text(sugestionList[1], width/2 - 1.75*PPCM, height/2 - 1.9 * PPCM);
    textAlign(RIGHT, TOP);
    text(sugestionList[2], width/2 + 1.75*PPCM , height/2 - 1.9 * PPCM);

    // Draws the touch input area (4x3cm) -- DO NOT CHANGE SIZE!
    stroke(0, 255, 0);
    noFill();
    rect(width/2 - 2.0*PPCM, height/2 - 1.0*PPCM, 4.0*PPCM, 3.0*PPCM);
    if (mouseIsPressed && dragging) 
    {
      circleX = min(max(mouseX - offSet, width/2 - 1.75*PPCM),width/2 + 1.75*PPCM);
      textFont("Arial", 24);
      textAlign(CENTER, CENTER);
      fill(0);
      current_letter = letters[int((circleX - (width/2 - 1.75*PPCM))*25/(3.5*PPCM))]
      //text(current_letter, width/2, height/2 + 0.5*PPCM);
      noFill();
    }

    //Draws slider
    //drawSlider();
    drawKeyboard();

    //Draws sugestion button
    fill(125);
    stroke(0);
    rect(width/2 - 2.0*PPCM, height/2 - 1.0*PPCM, 4.0/3*PPCM, 0.5*PPCM);
    rect(width/2 - 2.0*PPCM + 4.0/3*PPCM, height/2 - 1.0*PPCM, 4.0/3*PPCM, 0.5*PPCM);
    rect(width/2 - 2.0*PPCM  + 4.0/3*2*PPCM, height/2 - 1.0*PPCM, 4.0/3*PPCM, 0.5*PPCM);
    textAlign(CENTER, CENTER); 
    textFont("Arial", 16);
    fill(0);
    noStroke();
    text("^", width/2 - 2.0*PPCM + 4*PPCM/6, height/2 - 0.75 * PPCM);
    text("^", width/2 - 2.0*PPCM + + 4.0/3*PPCM + 4*PPCM/6, height/2 - 0.75 * PPCM);
    text("^", width/2 - 2.0*PPCM + 4.0/3*2*PPCM + 4*PPCM/6, height/2 - 0.75 * PPCM);

    //drawLetters();
    
    stroke(0);
    fill(125);
    imageMode(CENTER);
    image(arm, width/2, height/2, ARM_LENGTH, ARM_HEIGHT);
    
    //rect(spaceX, spaceY, spaceW);
    //rect(deleteX, deleteY, deleteW);
    
    //imageMode(CORNER);
    //tint(255);
    //image(backspace, deleteX + deleteW*0.125, deleteY + deleteW*0.125, deleteW*0.75, deleteW*0.75);
    //image(space, spaceX + spaceW*0.125, spaceY + spaceW*0.125, spaceW*0.75, spaceW*0.75);
    drawArmAndWatch();         // draws arm and watch background

    drawACCEPT();              // draws the 'ACCEPT' button that submits a phrase and completes a trial
    drawFatFinger();        // draws the finger that simulates the 'fat finger' problem
  }
}

function drawLetters() {
  let squareSize = 2*PPCM/10
  let x_border = width/2 - PPCM + squareSize/2;
  let y_border = height/2 + ((PPCM-3*squareSize)/2)

  let letter_index = 0;
  textFont("Arial", 10);
  textAlign(CENTER, CENTER);
  for (let j = 0; j < 3; j++) {
    for (let i = 0; i < 9; i++) {
      if (!(j == 2 && (i > 7))) {
        if (current_letter == letters[letter_index]) {
          fill(0,255,0);
        } else {
          noFill();
        }
        rect(x_border + i*squareSize, y_border + j*squareSize, squareSize, squareSize);
        fill(0);
        noStroke();
        text(letters[letter_index], x_border + i*squareSize + squareSize/2, y_border + j*squareSize + squareSize/2);
        letter_index++;
      } 
    }
  }
}

function drawKeyboard() {
  for (let i = 0; i < 3; i++) 
  {
    for (let j = 0; j < 5; j++)
    {
      stroke(0);
      noFill();
      rect(x_corner + j*(4.0/5*PPCM), y_corner + i*(2.5/3*PPCM), 4.0/5*PPCM, 2.5/3*PPCM);
      if (!(i==2 && j>2)) 
      {
        fill(0);
        noStroke();
        textAlign(LEFT, TOP);
        textSize(20);
        text(qwerty[i*5+j] , x_corner + j*(4.0/5*PPCM)+(4.0/5*PPCM)/16, y_corner + i*(2.5/3*PPCM)+(2.5/3*PPCM)/16);
        textSize(20);
        fill(0);
        textAlign(RIGHT, BOTTOM);
        text(qwerty[i*5+j+13] , x_corner + (j+1)*(4.0/5*PPCM)- (4.0/5*PPCM)/16, y_corner + (i+1)*(2.5/3*PPCM)-(2.5/3*PPCM)/16);
        noFill();
      } 
      else if (j == 3)
      {
        fill(0);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(12);
        text("_" , x_corner + j*(4.0/5*PPCM)+(4.0/5*PPCM)/2, y_corner + i*(2.5/3*PPCM)+(2.5/3*PPCM)/2);
      }
      else if (j == 4)
      {
        fill(0);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(12);
        text("Del" , x_corner + j*(4.0/5*PPCM)+(4.0/5*PPCM)/2, y_corner + i*(2.5/3*PPCM)+(2.5/3*PPCM)/2);
      }
    }
  }
}

function drawSlider() {
  stroke(0);
  line(width/2 - 1.75*PPCM, height/2 + 1.5*PPCM, width/2 + 1.75*PPCM, height/2 + 1.5*PPCM);
  fill(0,0,255);
  stroke(0,0,255);
  let xPosition = width/2 - 1.75*PPCM + int((circleX - (width/2 - 1.75*PPCM))/(3.5*PPCM/26))*(3.5*PPCM/26)
  rect(xPosition - 0.1*PPCM, circleY - 0.25*PPCM, 0.2*PPCM, 0.5*PPCM, 2, 2, 2, 2)
  //ellipse(xPosition, circleY, circleW);
  noFill();
  noStroke();
}

function getSugestion()
{
  let n = 0;
  for (let i = 0; i < sugestions2.length; i++)
  {
    let test = last_word + " " + current_word;
    for (let j = 0; j < test.length; j++)
    {
      if (sugestions2[i][j] == test[j]) 
      {
        if (j == test.length - 1 && j != sugestions2[i].length - 1) 
        {
          if (n == 3) return;
          sugestionList[n] = sugestions2[i].split(" ")[1];
          n++;
        }
        continue
      }
      else break
    }
  }

  for (let i = 0; i < sugestions.length; i++)
  {
    for (let j = 0; j < current_word.length; j++)
    {
      if (sugestions[i][j] == current_word[j]) 
      {
        if (j == current_word.length - 1 && j != sugestions[i].length - 1) 
        {
          if (n == 3) return;
          sugestionList[n] = sugestions[i]
          n++;
        }
        continue
      }
      else break
    }
  }
}

function pressedKey()
{
  let j = int((mouseX-x_corner)/(4.0*PPCM/5));
  let i = int((mouseY-y_corner)/(2.5*PPCM/3));
  if (!(i==2 && j>2)) 
  {
    if (current_letter == qwerty[i*5+j] && delay < maxDelay)
    {
      current_letter = qwerty[i*5+j+13];
      currently_typed = currently_typed.substring(0, currently_typed.length - 1)
      current_word = current_word.substring(0, current_word.length - 1)
    }
    else
    {
      current_letter = qwerty[i*5+j];
    }
    current_word += current_letter;
    currently_typed += current_letter;
  }
  if (i==2 && j == 3)
  {
    last_word = current_word;
    current_word = "";
    currently_typed += " ";
  }
  if (i == 2 && j ==4) 
  { 
    currently_typed = currently_typed.substring(0, currently_typed.length - 1);
    let k = currently_typed.length - 1;
    while (k > -1 && currently_typed[k] != " ") k--;
    current_word = currently_typed.substring(k + 1, currently_typed.length);
    let l = k - 1;
    while (l > -1 && currently_typed[l] != " ") l--;
    last_word = currently_typed.substring(l+1, k);
    current_letter = "";
  }
  delay = 0;
  console.log(current_letter, last_word, current_word);
  getSugestion();
}
// Evoked when the mouse button was pressed
function mousePressed()
{ 
  // Only look for mouse presses during the actual test
  if (draw_finger_arm)
  {                   
    // Check if mouse click happened within the touch input area
    if(mouseClickWithin(width/2 - 2.0*PPCM, height/2 - 1.0*PPCM, 4.0*PPCM, 3.0*PPCM))  
    {
      if (mouseClickWithin(width/2 - 2.0*PPCM, height/2 - 0.5*PPCM, 4.0*PPCM, 2.5*PPCM))
      {
        pressedKey();
      }

      if (mouseClickWithin(width/2 - 2.0*PPCM, height/2 - 1.0*PPCM, 4.0*PPCM, 0.5*PPCM))
      {
        while (currently_typed.length > 0 && currently_typed[currently_typed.length - 1] != " ")
        {
          currently_typed = currently_typed.substring(0, currently_typed.length - 1);
        }
        if (mouseX < width/2 - 2.0*PPCM + 4.0/3*PPCM) 
        {
          currently_typed += sugestionList[1];
          current_word = sugestionList[1];
        }
        else if (mouseX > width/2 - 2.0*PPCM + 4.0/3*2*PPCM) 
        {
          currently_typed += sugestionList[2];
          current_word = sugestionList[2];
        }
        else 
        {
          currently_typed += sugestionList[0];
          current_word = sugestionList[0];
        }
        
        getSugestion();
      }
      
      /*
      // Check if mouse click was on left arrow (2D keyboard)
      if (mouseClickWithin(width/2 - ARROW_SIZE, height/2, ARROW_SIZE, ARROW_SIZE))
      {
        current_letter = getPreviousChar(current_letter);
        if (current_letter.charCodeAt(0) < '_'.charCodeAt(0)) current_letter = 'z';  // wrap around to z
      }
      // Check if mouse click was on right arrow (2D keyboard)
      else if (mouseClickWithin(width/2, height/2, ARROW_SIZE, ARROW_SIZE))
      {
        current_letter = getNextChar(current_letter);
        if (current_letter.charCodeAt(0) > 'z'.charCodeAt(0)) current_letter = '_'; // wrap back to space (i.e., the underscore)
      }
      else
      {
        // Click in whitespace indicates a character input (2D keyboard)
        if (current_letter == '_') currently_typed += " ";                          // if underscore, consider that a space bar
        else if (current_letter == '`' && currently_typed.length > 0)               // if `, treat that as delete
          currently_typed = currently_typed.substring(0, currently_typed.length - 1);
        else if (current_letter != '`') currently_typed += current_letter;          // if not any of the above cases, add the current letter to the entered phrase
      }
      */
    }
    
    // Check if mouse click happened within 'ACCEPT' 
    // (i.e., submits a phrase and completes a trial)
    else if (mouseClickWithin(width/2 - 2*PPCM, height/2 - 5.1*PPCM, 4.0*PPCM, 2.0*PPCM))
    {
      // Saves metrics for the current trial
      letters_expected += target_phrase.trim().length;
      letters_entered += currently_typed.trim().length;
      errors += computeLevenshteinDistance(currently_typed.trim(), target_phrase.trim());
      entered[current_trial] = currently_typed;
      trial_end_time = millis();

      current_trial++;

      // Check if the user has one more trial/phrase to go
      if (current_trial < 2)                                           
      {
        // Prepares for new trial
        current_word = "";
        last_word = "";
        for (let i = 0; i < sugestionList.length; i++)
        {
          sugestionList[i] = "";
        };
        currently_typed = "";
        target_phrase = phrases[current_trial];  
      }
      else
      {
        // The user has completed both phrases for one attempt
        draw_finger_arm = false;
        attempt_end_time = millis();
        CPS = (entered[0].length+entered[1].length)/((attempt_end_time-attempt_start_time)/1000);
        printAndSavePerformance();        // prints the user's results on-screen and sends these to the DB
        attempt++;

        // Check if the user is about to start their second attempt
        if (attempt < 2)
        {
          second_attempt_button = createButton('START 2ND ATTEMPT');
          second_attempt_button.mouseReleased(startSecondAttempt);
          second_attempt_button.position(width/2 - second_attempt_button.size().width/2, height/2 + 250);
          current_word = "";
          last_word = "";
          for (let i = 0; i < sugestionList.length; i++)
          {
            sugestionList[i] = "";
          };
          currently_typed = "";
        }
      }
    }
  }
}

// Resets variables for second attempt
function startSecondAttempt()
{
  // Re-randomize the trial order (DO NOT CHANG THESE!)
  shuffle(phrases, true);
  current_trial        = 0;
  target_phrase        = phrases[current_trial];
  
  // Resets performance variables (DO NOT CHANG THESE!)
  letters_expected     = 0;
  letters_entered      = 0;
  errors               = 0;
  currently_typed      = "";
  CPS                  = 0;
  
  current_letter       = 'a';
  
  // Show the watch and keyboard again
  second_attempt_button.remove();
  draw_finger_arm      = true;
  attempt_start_time   = millis();  
}

// Print and save results at the end of 2 trials
function printAndSavePerformance()
{
  // DO NOT CHANGE THESE
  let attempt_duration = (attempt_end_time - attempt_start_time) / 60000;          // 60K is number of milliseconds in minute
  let wpm              = (letters_entered / 5.0) / attempt_duration;      
  let freebie_errors   = letters_expected * 0.05;                                  // no penalty if errors are under 5% of chars
  let penalty          = max(0, (errors - freebie_errors) / attempt_duration); 
  let wpm_w_penalty    = max((wpm - penalty),0);                                   // minus because higher WPM is better: NET WPM
  let timestamp        = day() + "/" + month() + "/" + year() + "  " + hour() + ":" + minute() + ":" + second();
  
  background(color(0,0,0));    // clears screen
  cursor();                    // shows the cursor again
  
  textFont("Arial", 16);       // sets the font to Arial size 16
  fill(color(255,255,255));    //set text fill color to white
  text(timestamp, 100, 20);    // display time on screen 
  
  text("Finished attempt " + (attempt + 1) + " out of 2!", width / 2, height / 2); 
  
  // For each trial/phrase
  let h = 20;
  for(i = 0; i < 2; i++, h += 40 ) 
  {
    text("Target phrase " + (i+1) + ": " + phrases[i], width / 2, height / 2 + h);
    text("User typed " + (i+1) + ": " + entered[i], width / 2, height / 2 + h+20);
  }
  
  text("Raw WPM: " + wpm.toFixed(2), width / 2, height / 2 + h+20);
  text("Freebie errors: " + freebie_errors.toFixed(2), width / 2, height / 2 + h+40);
  text("Penalty: " + penalty.toFixed(2), width / 2, height / 2 + h+60);
  text("WPM with penalty: " + wpm_w_penalty.toFixed(2), width / 2, height / 2 + h+80);
  text("CPS:  " + CPS.toFixed(2), width / 2, height / 2 + h+100);

  // Saves results (DO NOT CHANGE!)
  let attempt_data = 
  {
        project_from:         GROUP_NUMBER,
        assessed_by:          student_ID,
        attempt_completed_by: timestamp,
        attempt:              attempt,
        attempt_duration:     attempt_duration,
        raw_wpm:              wpm,      
        freebie_errors:       freebie_errors,
        penalty:              penalty,
        wpm_w_penalty:        wpm_w_penalty,
        cps:                  CPS
  }
  
  // Send data to DB (DO NOT CHANGE!)
  if (BAKE_OFF_DAY)
  {
    // Access the Firebase DB
    if (attempt === 0)
    {
      firebase.initializeApp(firebaseConfig);
      database = firebase.database();
    }
    
    // Add user performance results
    let db_ref = database.ref('G' + GROUP_NUMBER);
    db_ref.push(attempt_data);
  }
}

// Is invoked when the canvas is resized (e.g., when we go fullscreen)
function windowResized()
{
  resizeCanvas(windowWidth, windowHeight);
  let display    = new Display({ diagonal: display_size }, window.screen);
  
  // DO NO CHANGE THESE!
  PPI           = display.ppi;                        // calculates pixels per inch
  PPCM          = PPI / 2.54;                         // calculates pixels per cm
  FINGER_SIZE   = (int)(11   * PPCM);
  FINGER_OFFSET = (int)(0.8  * PPCM)
  ARM_LENGTH    = (int)(19   * PPCM);
  ARM_HEIGHT    = (int)(11.2 * PPCM);
  
  ARROW_SIZE    = (int)(2.2 * PPCM);
  
  // Starts drawing the watch immediately after we go fullscreen (DO NO CHANGE THIS!)
  draw_finger_arm = true;
  attempt_start_time = millis();

  circleX = width/2 - 1.75*PPCM;
  circleY = height/2 + 1.5*PPCM;
  circleW = 0.75*PPCM;
  spaceX = width/2 - 2*PPCM; 
  spaceY = height/2;
  spaceW = PPCM;
  deleteX = width/2 + PPCM;
  deleteY = spaceY;
  deleteW = spaceW;
  y_corner = height/2 - 0.5*PPCM;
  x_corner = width/2 - 2.0*PPCM;

}
