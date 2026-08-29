(function(){
  const WORDS_BEGINNER = ["cat","dog","run","sun","sit","top","big","red","hat","box","cup","pen","key","map",
  "leg","arm","eye","ear","toy","bag","car","bus","bed","egg","fan","jar","net","owl","pig","rug","van","zip",
  "book","tree","blue","fish","milk","bird","jump","play","kind","fast","slow","food","home","love","hope",
  "kids","cake","rain","snow","wind","star","moon","road","park","walk","talk","farm","gold","leaf","lake",
  "hill","rock","sand","fire","cool","warm","door","desk","lamp","ring","shoe","sock","coat","hair","face",
  "hand","foot","nose","mouth","week","year","time","day","week","month","good","nice","open","shut","full",
  "easy","hard","soft","loud","calm","dark","light"];

  const WORDS_MEDIUM = ["the","of","and","a","to","in","is","you","that","it","he","was","for","on","are","as","with",
  "his","they","i","at","be","this","have","from","or","one","had","by","word","but","not","what","all","were",
  "we","when","your","can","said","there","use","an","each","which","she","do","how","their","if","will","up",
  "other","about","out","many","then","them","these","so","some","her","would","make","like","him","into","time",
  "has","look","two","more","write","go","see","number","no","way","could","people","my","than","first","water",
  "been","call","who","oil","its","now","find","long","down","day","did","get","come","made","may","part","over",
  "new","sound","take","only","little","work","know","place","year","live","me","back","give","most","very",
  "after","thing","our","just","name","good","sentence","man","think","say","great","where","help","through",
  "much","before","line","right","too","mean","old","any","same","tell","boy","follow","came","want","show",
  "also","around","form","three","small","set","put","end","does","another","well","large","must","big","even",
  "such","because","turn","here","why","ask","went","men","read","need","land","different","home","us","move",
  "try","kind","hand","picture","again","change","off","play","spell","air","away","animal","house","point",
  "page","letter","mother","answer","found","study","still","learn","should","america","world"];

  const WORDS_ADVANCED = ["development","particularly","consequently","infrastructure","extraordinary",
  "phenomenon","simultaneously","nevertheless","approximately","circumstances","unfortunately",
  "recommendation","characteristics","responsibility","international","administration","sophisticated",
  "comprehensive","implementation","acknowledgement","significantly","predominantly","controversial",
  "entrepreneurship","interdisciplinary","technological","overwhelming,","substantially","nonetheless,",
  "well-being","state-of-the-art","don't","wouldn't","it's","couldn't","they're","e.g.,","i.e.,",
  "Nietzsche's","juxtaposition","paradoxically","unprecedented","meticulously","hypothesis,",
  "bureaucratic","phenomenal","irrevocably","quintessential","idiosyncratic","notwithstanding"];

  function getWordList(){
    if(difficulty === 'beginner') return WORDS_BEGINNER;
    if(difficulty === 'advanced') return WORDS_ADVANCED;
    return WORDS_MEDIUM;
  }

  function generateWords(n){
    const list = getWordList();
    const out = [];
    for(let i=0;i<n;i++){
      out.push(list[Math.floor(Math.random()*list.length)]);
    }
    return out;
  }

  const textDisplay = document.getElementById('textDisplay');
  const hiddenInput = document.getElementById('hiddenInput');
  const caret = document.getElementById('caret');
  const focusHint = document.getElementById('focusHint');
  const card = document.getElementById('card');
  const results = document.getElementById('results');
  const configBar = document.getElementById('config');
  const difficultyBar = document.getElementById('difficulty');
  const liveStats = document.getElementById('liveStats');

  const statTime = document.getElementById('statTime');
  const statWpm = document.getElementById('statWpm');
  const statAcc = document.getElementById('statAcc');

  let duration = 30;
  let difficulty = 'medium';
  let timeLeft = duration;
  let timerId = null;
  let started = false;
  let finished = false;
  let typedChars = [];      // array of {char, correct} for every character typed so far (flattened across words)
  let words = [];
  let currentWordIndex = 0;
  let currentInput = "";
  let totalCorrect = 0;
  let totalTyped = 0;
  let rawTyped = 0;

  function setActiveTimeButton(){
    [...configBar.children].forEach(b=>{
      if(b.dataset && b.dataset.time) b.classList.toggle('active', parseInt(b.dataset.time)===duration);
    });
  }

  function setActiveDifficultyButton(){
    [...difficultyBar.children].forEach(b=>{
      if(b.dataset && b.dataset.level) b.classList.toggle('active', b.dataset.level===difficulty);
    });
  }

  function buildText(){
    words = generateWords(60);
    textDisplay.innerHTML = words.map((w,wi)=>{
      const chars = w.split('').map(c=>`<span class="char" data-w="${wi}">${c}</span>`).join('');
      return `<span class="word" data-wi="${wi}">${chars}</span>` + (wi < words.length-1 ? '<span class="char space" data-w="'+wi+'"> </span>' : '');
    }).join('');
  }

  function positionCaret(immediate){
    const spans = textDisplay.querySelectorAll('.char');
    let target = spans[typedChars.length];
    const cardRect = card.getBoundingClientRect();
    const displayRect = textDisplay.getBoundingClientRect();
    let left, top;
    if(target){
      const r = target.getBoundingClientRect();
      left = r.left - displayRect.left;
      top = r.top - displayRect.top;
    } else {
      // past the end
      const last = spans[spans.length-1];
      const r = last.getBoundingClientRect();
      left = r.right - displayRect.left;
      top = r.top - displayRect.top;
    }
    const offsetLeft = displayRect.left - cardRect.left;
    const offsetTop = displayRect.top - cardRect.top;
    if(immediate){
      caret.style.transition = 'none';
      requestAnimationFrame(()=>{ caret.style.transition = ''; });
    }
    caret.style.left = (offsetLeft + left) + 'px';
    caret.style.top = (offsetTop + top) + 'px';
  }

  function resetTest(){
    clearInterval(timerId);
    timerId = null;
    started = false;
    finished = false;
    typedChars = [];
    currentWordIndex = 0;
    currentInput = "";
    totalCorrect = 0;
    totalTyped = 0;
    rawTyped = 0;
    timeLeft = duration;

    buildText();
    textDisplay.classList.remove('blurred');
    results.classList.remove('show');
    card.style.display = 'block';
    liveStats.style.display = 'flex';
    statTime.textContent = timeLeft;
    statWpm.textContent = '0';
    statAcc.textContent = '100%';
    hiddenInput.value = "";

    requestAnimationFrame(()=>positionCaret(true));
  }

  function startTimer(){
    started = true;
    timerId = setInterval(()=>{
      timeLeft--;
      statTime.textContent = timeLeft;
      updateLiveWpm();
      if(timeLeft <= 0){
        endTest();
      }
    }, 1000);
  }

  function updateLiveWpm(){
    const elapsedMin = (duration - timeLeft) / 60;
    if(elapsedMin <= 0) return;
    const wpm = Math.round((totalCorrect / 5) / elapsedMin);
    statWpm.textContent = Math.max(0, wpm);
    const acc = totalTyped > 0 ? Math.round((totalCorrect/totalTyped)*100) : 100;
    statAcc.textContent = acc + '%';
  }

  function endTest(){
    if(finished) return;
    finished = true;
    clearInterval(timerId);
    textDisplay.classList.add('blurred');
    caret.style.opacity = 0;

    const elapsedMin = duration / 60;
    const wpm = Math.round((totalCorrect/5) / elapsedMin) || 0;
    const rawWpm = Math.round((rawTyped/5) / elapsedMin) || 0;
    const acc = totalTyped > 0 ? Math.round((totalCorrect/totalTyped)*100) : 100;

    document.getElementById('resWpm').textContent = wpm;
    document.getElementById('resAcc').textContent = acc + '%';
    document.getElementById('resRaw').textContent = rawWpm;
    document.getElementById('resChars').textContent = totalCorrect + '/' + totalTyped;
    document.getElementById('resTime').textContent = duration + 's';

    results.classList.add('show');
    liveStats.style.display = 'none';
  }

  function markChar(wordIndex, charIndex, state){
    const wordEl = textDisplay.querySelector(`.word[data-wi="${wordIndex}"]`);
    if(!wordEl) return;
    const charEl = wordEl.children[charIndex];
    if(charEl){
      charEl.classList.remove('correct','incorrect');
      if(state) charEl.classList.add(state);
    }
  }

  function markSpace(wordIndex, state){
    const spaceEl = textDisplay.querySelector(`.char.space[data-w="${wordIndex}"]`);
    if(spaceEl){
      spaceEl.classList.remove('correct','incorrect');
      if(state) spaceEl.classList.add(state);
    }
  }

  function handleInput(e){
    if(finished) return;
    if(!started) startTimer();

    const val = hiddenInput.value;
    const targetWord = words[currentWordIndex];

    if(val.endsWith(' ')){
      // word submitted
      const typed = val.slice(0, -1);
      // mark each char of the word
      for(let i=0;i<targetWord.length;i++){
        rawTyped++;
        totalTyped++;
        if(i < typed.length && typed[i] === targetWord[i]){
          markChar(currentWordIndex, i, 'correct');
          totalCorrect++;
          typedChars.push(1);
        } else {
          markChar(currentWordIndex, i, 'incorrect');
          typedChars.push(0);
        }
      }
      // extra typed chars beyond word length count as incorrect raw
      if(typed.length > targetWord.length){
        rawTyped += (typed.length - targetWord.length);
      }
      // space itself
      totalTyped++;
      rawTyped++;
      totalCorrect++;
      typedChars.push(1);
      markSpace(currentWordIndex, 'correct');

      currentWordIndex++;
      currentInput = "";
      hiddenInput.value = "";

      if(currentWordIndex >= words.length - 1){
        words = words.concat(generateWords(40));
        const moreHtml = words.slice(words.length-40).map((w,idx)=>{
          const wi = words.length - 40 + idx;
          const chars = w.split('').map(c=>`<span class="char" data-w="${wi}">${c}</span>`).join('');
          return `<span class="word" data-wi="${wi}">${chars}</span><span class="char space" data-w="${wi}"> </span>`;
        }).join('');
        textDisplay.insertAdjacentHTML('beforeend', moreHtml);
      }
    } else {
      currentInput = val;
      // live-mark current word's chars (not yet committed)
      for(let i=0;i<targetWord.length;i++){
        if(i < val.length){
          markChar(currentWordIndex, i, val[i] === targetWord[i] ? 'correct' : 'incorrect');
        } else {
          markChar(currentWordIndex, i, null);
        }
      }
    }

    positionCaretForCurrentInput();
    updateLiveWpm();
  }

  function positionCaretForCurrentInput(){
    const wordEl = textDisplay.querySelector(`.word[data-wi="${currentWordIndex}"]`);
    if(!wordEl) return;
    const cardRect = card.getBoundingClientRect();
    const displayRect = textDisplay.getBoundingClientRect();
    let rect;
    const idx = currentInput.length;
    if(idx < wordEl.children.length){
      rect = wordEl.children[idx].getBoundingClientRect();
      caret.style.left = (rect.left - displayRect.left + (displayRect.left - cardRect.left)) + 'px';
      caret.style.top = (rect.top - displayRect.top + (displayRect.top - cardRect.top)) + 'px';
    } else {
      const last = wordEl.children[wordEl.children.length-1];
      rect = last.getBoundingClientRect();
      caret.style.left = (rect.right - displayRect.left + (displayRect.left - cardRect.left)) + 'px';
      caret.style.top = (rect.top - displayRect.top + (displayRect.top - cardRect.top)) + 'px';
    }
  }

  function pressCaret(){
    caret.classList.add('pressed');
    setTimeout(()=>caret.classList.remove('pressed'), 90);
  }

  hiddenInput.addEventListener('input', ()=>{ pressCaret(); handleInput(); });
  hiddenInput.addEventListener('keydown', (e)=>{
    if(e.key === 'Tab'){
      e.preventDefault();
      resetTest();
      hiddenInput.focus();
    }
  });

  card.addEventListener('click', ()=> hiddenInput.focus());
  hiddenInput.addEventListener('focus', ()=> focusHint.classList.remove('show'));
  hiddenInput.addEventListener('blur', ()=>{ if(!finished) focusHint.classList.add('show'); });

  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Tab'){
      e.preventDefault();
      resetTest();
      hiddenInput.focus();
    }
  });

  document.getElementById('restartBtn').addEventListener('click', ()=>{ resetTest(); hiddenInput.focus(); });
  document.getElementById('restartFromResults').addEventListener('click', ()=>{ resetTest(); hiddenInput.focus(); });

  configBar.addEventListener('click', (e)=>{
    const btn = e.target.closest('button');
    if(!btn || !btn.dataset.time) return;
    duration = parseInt(btn.dataset.time);
    setActiveTimeButton();
    resetTest();
  });

  difficultyBar.addEventListener('click', (e)=>{
    const btn = e.target.closest('button');
    if(!btn || !btn.dataset.level) return;
    difficulty = btn.dataset.level;
    setActiveDifficultyButton();
    resetTest();
  });

  window.addEventListener('resize', ()=>{ if(!finished) positionCaretForCurrentInput(); });

  // init
  setActiveTimeButton();
  setActiveDifficultyButton();
  resetTest();
  focusHint.classList.add('show');
})();