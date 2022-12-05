var tokeni = null;

function containsJapanese(text) {
  const regex = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/g;
  return regex.test(text);
}

function removeFurigana () {
  let furigana = document.getElementsByTagName('rt');

  if(furigana.length === 0) return;

  while(furigana[0])
    furigana[0].remove();
}

function getDictionnaryEntryFromKanji(word) {
  let entry = dict.find(entry => entry.kanji === word);

  return entry ? entry : null;
}

function getDictionnaryEntryFromPronunciation(word) {
  let entry = dict.find(entry => entry.pronunciation === word);

  return entry ? entry : null;
}

function getPitchPattern (pitchMora, wordLength) {
  if(pitchMora === 0)
    return "heiban";
  else if(pitchMora === 1 || pitchMora == 3)
    return "atamadaka";
  else if(pitchMora === 2 || pitchMora == 4)
    return "odaka";
  else
    return "nakadaka";
}

function tagWordAccent(word, tokenizer) {
  let dictEntry = getDictionnaryEntryFromKanji(word) || getDictionnaryEntryFromPronunciation(word);
 
  if(!dictEntry) {
    let token = tokenizer.tokenize(word);
    return token
      .filter(form => form.word_type != "UNKNOWN")
      .map(form => {
        let basicForm = form.basic_form
        dictEntry = getDictionnaryEntryFromKanji(basicForm) || getDictionnaryEntryFromPronunciation(basicForm);
        if(!dictEntry) return `<span>${word}</span>`;
        return formatHtml(basicForm, dictEntry.pronunciation, dictEntry.pitchMora[0][0])
      })
      .join("")
  }

  if(dictEntry)
  {
    var pitchMora = dictEntry.pitchMora[0][0];  
    return formatHtml(word, dictEntry.pronunciation, pitchMora)
  }
  else
    return `<span>${word}</span>`;
}

function initializeToken() {
      return kuromoji
      .builder({dicPath: chrome.extension.getURL("./kuromoji/dict")})
}

function htmlFuriganaPitch(word, pronunciation, pitchMora) {
  let html = "";
  let pitchWord = (letter, pitch) => `<span class="${pitch}">${letter}</span>`
  Array
    .from(pronunciation.length > 0 ? pronunciation : word)
    .forEach((letter, index) => {
      if(index + 1 == 1) {
        html += pitchWord(letter, pitchMora == 1 ? "pitched" : "")
      } else if(pitchMora == 0) {
        html += pitchWord(letter, "pitched_heiban")
      }
      else if(index + 1 <= pitchMora) {
        html += pitchWord(letter, "pitched")
      } else {
        html += pitchWord(letter, "")
      }
    })
  return html
}

function formatHtml(word, pronunciation, pitchMora) {
  return `
  <span>
    <ruby>${word}
      <rt>${htmlFuriganaPitch(word, pronunciation, pitchMora)}</rt>
    </ruby>
  </span>`
}

function markTextAccents (element) {
  let paragraphs = document.getElementsByTagName('b');
  
  initializeToken().build(function (err, tokenizer) {
    console.log("initializing tokenizer")
    for(var i = 0; i < paragraphs.length; i++) {
        let tokens = tokenize(paragraphs[i].textContent);

        let newHtml = ''
        for(var j = 0; j < tokens.length; j++)
        {
          if(tokens[j][1].startsWith('N') || tokens[j][1].startsWith('R') || tokens[j][1].startsWith('V')) 
            console.log(tokens[j])
          //If the token is a noun
          if(tokens[j][1].startsWith('N') || tokens[j][1].startsWith('R') || tokens[j][1].startsWith('V'))
            newHtml += tagWordAccent(tokens[j][0], tokenizer);
          else if(!tokens[j][1].startsWith('W'))
            newHtml += tokens[j][0]
        }

        paragraphs[i].innerHTML = newHtml
      }   
  });
}

function removeTextAccents() {
  let colored = document.querySelectorAll(".heiban, .atamadaka, .nakadaka, .odaka, .kifuku");

  for(var i = 0; i < colored.length; i++)
  {
    colored[i].classList.remove("heiban");
    colored[i].classList.remove("atamadaka");
    colored[i].classList.remove("nakadaka");
    colored[i].classList.remove("odaka");
    colored[i].classList.remove("kifuku");
  }
}

// chrome.storage.onChanged.addListener(function(changes) {
//   console.log("ds");
//   if ('showAccents' in changes && changes.showAccents.newValue === true) {
//     removeFurigana();
//     markTextAccents();
//   } else {
//     removeTextAccents();
//   }
// });
document.body.onload = function run() {
    markTextAccents();
}