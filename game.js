// --- Query param (link system unchanged) ---
function getQueryParam(name){ return new URLSearchParams(window.location.search).get(name); }
const selectedCourse = getQueryParam('course') || 'HTML';
document.getElementById('courseTitle').textContent = 'Course: ' + selectedCourse;

// --- State ---
let questions = {}, jsonLoaded = false;
let selectedRounds = [], currentRound = 0, totalRounds = 10;
let defaultTime = 30, timerInterval = null, timeLeft = 0, totalTime = 0;
let userAnswers = [];
let lowTimeApplied = false;
let currentOptionsNodeList = [];

// --- Stress events ---
const stressEvents = [
  { type:'speed',   factor:2,   message:'Time pressure! 2× faster' },
  { type:'speed',   factor:0.5, message:'Breather! 2× slower' },
  { type:'bonus',   seconds:5,  message:'Lucky! +5s added' },
  { type:'penalty', seconds:5,  message:'Oops! -5s lost' }
];

// --- Load questions ---
fetch('questions.json')
  .then(r=>r.json())
  .then(data=>{
    questions = data;
    jsonLoaded = true;
    document.querySelectorAll('.diff-btn').forEach(b=>b.disabled=false);
  })
  .catch(e=>{
    console.error('Error loading questions.json', e);
    alert('Failed to load questions.json');
  });

// --- Start game ---
function startGame(difficulty){
  if(!jsonLoaded){ alert('Questions are still loading…'); return; }
  document.getElementById('difficultySelect').style.display='none';
  document.getElementById('topInfo').textContent = `${selectedCourse} : ${difficulty}`;

  defaultTime = (difficulty==='easy')?25 : (difficulty==='normal')?35 : 45;

  // Pull pool for selected course & difficulty, MCQ only (must have options & answer)
  const poolRaw = (questions[selectedCourse] && questions[selectedCourse][difficulty]) || [];
  const pool = poolRaw.filter(q => Array.isArray(q.options) && Number.isInteger(q.answer));

  if(!pool.length){
    alert('No MCQ questions found for this course/difficulty.');
    location.href = 'index.html';
    return;
  }

  // Pick 10 with replacement (simple)
  selectedRounds = Array.from({length: totalRounds}, ()=> pool[Math.floor(Math.random()*pool.length)]);

  currentRound = 0; userAnswers = [];
  showRound();
}

// --- Round setup ---
function showRound(){
  document.getElementById('roundDisplay').textContent = `Round: ${currentRound+1} / ${totalRounds}`;
  document.getElementById('questionSection').style.display='none';
  document.getElementById('nextBtn').style.display='none';

  // reset cards
  ['card1','card2','card3'].forEach(id=>{
    const card = document.getElementById(id);
    card.classList.remove('flipped');
    card.style.pointerEvents='auto';
    card.querySelector('.card-back').textContent='';
  });

  // attach handlers
  ['card1','card2','card3'].forEach(id=> document.getElementById(id).onclick = ()=>flipCard(id));

  // reset timer visuals
  const bar = document.getElementById('timerBar');
  bar.style.transition='none'; bar.style.width='100%';
  document.body.classList.remove('low-time');
  lowTimeApplied = false;
}

// --- Flip card => show question ---
function flipCard(cardId){
  const card = document.getElementById(cardId);
  const qObj = selectedRounds[currentRound];

  card.querySelector('.card-back').textContent = qObj.question;
  card.classList.add('flipped');

  // disable other cards
  ['card1','card2','card3'].forEach(id=> document.getElementById(id).style.pointerEvents='none');

  // render MCQ
  renderQuestion(qObj);

  // start timer
  startTimer(qObj.time || defaultTime);
}

function renderQuestion(qObj){
  document.getElementById('questionText').textContent = qObj.question;
  const optionsContainer = document.getElementById('optionsContainer');
  optionsContainer.innerHTML = '';

  qObj.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = opt;
    btn.onclick = () => selectOption(i, qObj.answer, btn);
    optionsContainer.appendChild(btn);
  });

  currentOptionsNodeList = Array.from(optionsContainer.querySelectorAll('.option-btn'));
  document.getElementById('questionSection').style.display='block';
  document.getElementById('nextBtn').style.display='none';
}

// --- Timer ---
function startTimer(seconds){
  clearInterval(timerInterval);
  timeLeft = seconds; totalTime = seconds;
  const bar = document.getElementById('timerBar');
  const timerText = document.getElementById('timerDisplay');

  bar.style.transition='none'; bar.style.width='100%';
  timerText.textContent = `${Math.ceil(timeLeft)}s`;
  const t0 = performance.now();

  // maybe schedule stress event (need 3s headroom)
  if(Math.random()<0.5 && seconds>3){
    const delay = Math.random() * (seconds*1000 - 3000);
    setTimeout(()=>triggerRandomEvent(3000), delay);
  }

  timerInterval = setInterval(()=>{
    const elapsed = (performance.now() - t0) / 1000;
    timeLeft = Math.max(0, seconds - elapsed);

    if(!lowTimeApplied && timeLeft <= Math.max(5, totalTime*0.2)){
      document.body.classList.add('low-time');
      lowTimeApplied = true;
    }

    timerText.textContent = `${Math.ceil(timeLeft)}s`;
    bar.style.width = `${(timeLeft/totalTime)*100}%`;

    if(timeLeft<=0){
      clearInterval(timerInterval);
      showTimeUpVisual();
      lockAndPushAnswer(-1); // no selection
      setTimeout(nextRound, 350);
    }
  }, 20);
}

// --- Stress visuals ---
function showTimeUpVisual(){
  const cards = document.querySelector('.cards');
  cards.classList.add('time-up');
  setTimeout(()=>cards.classList.remove('time-up'), 650);
}

// --- Stress event (3s default) ---
function triggerRandomEvent(duration=3000){
  const ev = stressEvents[Math.floor(Math.random()*stressEvents.length)];
  const cards = document.querySelector('.cards');

  const overlay = document.createElement('div');
  overlay.className = 'stress-overlay';
  overlay.textContent = ev.message;
  cards.appendChild(overlay);
  cards.classList.add('shake');

  if(ev.type==='speed'){
    timeLeft = timeLeft / ev.factor;
    totalTime = Math.max(timeLeft, 1);
  }else if(ev.type==='bonus'){
    timeLeft += ev.seconds;
    totalTime = Math.max(totalTime, timeLeft);
  }else if(ev.type==='penalty'){
    timeLeft = Math.max(0, timeLeft - ev.seconds);
  }

  const bar = document.getElementById('timerBar');
  bar.style.width = `${(timeLeft/totalTime)*100}%`;

  setTimeout(()=>{
    overlay.remove();
    cards.classList.remove('shake');
  }, duration);
}

// --- Option selection ---
function selectOption(choice, correctIndex, clickedBtn){
  clearInterval(timerInterval);

  // lock buttons
  currentOptionsNodeList.forEach(b => b.disabled = true);

  // mark selections
  if(choice === correctIndex){
    clickedBtn.classList.add('correct');
  }else{
    clickedBtn.classList.add('wrong');
    if(currentOptionsNodeList[correctIndex]){
      currentOptionsNodeList[correctIndex].classList.add('correct');
    }
  }

  lockAndPushAnswer(choice);
  document.getElementById('nextBtn').style.display='block';
}

function lockAndPushAnswer(choiceIndex){
  const qObj = selectedRounds[currentRound];
  const correct = qObj.answer;
  const isCorrect = choiceIndex === correct;

  // Log (right panel)
  const log = document.getElementById('answerLog');
  const p = document.createElement('p');
  const chosenText = choiceIndex>=0 ? qObj.options[choiceIndex] : '[No Answer]';
  p.textContent = `Q${currentRound+1}: ${chosenText} ${isCorrect?'✓':'✗'}`;
  log.prepend(p);

  // Save
  userAnswers.push({
    questionId: qObj.id,
    question: qObj.question,
    selectedIndex: choiceIndex,
    selectedText: choiceIndex>=0 ? qObj.options[choiceIndex] : '',
    correctIndex: correct,
    correctText: qObj.options[correct],
    isCorrect
  });
}

// --- Next / Results ---
document.getElementById('nextBtn').onclick = nextRound;

function nextRound(){
  currentRound++;
  if(currentRound>=totalRounds) showResults();
  else showRound();
}

function showResults(){
  document.querySelector('.wrap').style.display='none';
  document.getElementById('topInfoContainer').style.display='none';

  const totalCorrect = userAnswers.filter(a=>a.isCorrect).length;
  const scoreLine = document.getElementById('scoreLine');
  scoreLine.innerHTML = `<p><strong>Score:</strong> ${totalCorrect} / ${userAnswers.length}</p>`;

  const summary = document.getElementById('summary');
  summary.innerHTML = '';
  userAnswers.forEach((ua,i)=>{
    const el = document.createElement('p');
    el.innerHTML = `
      <strong>Q${i+1}:</strong> ${ua.question}<br>
      <span class="muted">Your answer:</span> ${ua.selectedIndex>=0 ? ua.selectedText : '[No Answer]'} ${ua.isCorrect?'✓':'✗'}<br>
      <span class="muted">Correct:</span> ${ua.correctText}
    `;
    summary.appendChild(el);
  });

  document.getElementById('results').style.display='grid';
}
