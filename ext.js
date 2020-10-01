var pageToSpeech = {
    data: {
      highlightedText: "",
      speechInProgress: false,
      fallbackAudio: null
    },
    initialize: function() {
        // if (this.data.speechInProgress) {
        //   this.data.fallbackAudio.pause();
        //   pageToSpeech.data.speechInProgress = false;
        // }
        if (!pageToSpeech.hasText() || (this.data.speechInProgress)) { return;}
        if (!pageToSpeech.trySpeechSynthesizer()) {
          pageToSpeech.trySpeechApi();
        }
  
      
    },
    hasText: function() {
      this.data.highlightedText = window.getSelection().toString();
      if (!this.data.highlightedText) {
        var input = document.createElement("input");
        input.setAttribute("type", "text");
        input.id = "sandbox";
        document.getElementsByTagName("body")[0].appendChild(input);
        var sandbox = document.getElementById("sandbox");
        sandbox.value = "";
        sandbox.style.opacity = 0;
        sandbox.focus();
        if (document.execCommand('paste')) {
          this.data.highlightedText = sandbox.value;
        }
        sandbox.value = "";
      }
      return this.data.highlightedText;
      
    },
    trySpeechSynthesizer: function() {
      if (window.speechSynthesis ) {
          //new speech is about to get started
          if (this.data.speechInProgress) {
            polyfills.speechUtteranceChunker.cancel = true;
            
          }
        this.data.speechInProgress = true;
          var msg = new SpeechSynthesisUtterance(this.data.highlightedText);
          //speechSynthesis.speak(msg);
          // Chrome Implementation BUG: http://stackoverflow.com/questions/21947730/chrome-speech-synthesis-with-longer-texts
          polyfills.speechUtteranceChunker(msg, {
            chunkLength: 120
          },function() {
            //speech has finished
            pageToSpeech.data.speechInProgress = false;
          });
          
          
        
      
        return true;
      }
      return false;
    },
    trySpeechApi: function() {
      if (this.data.speechInProgress) {
        this.data.fallbackAudio.pause();
      }
      this.data.speechInProgress = true;
      this.data.fallbackAudio = new Audio("http://api.voicerss.org/?key=20ae15bb063e44beb4797449de15174c&src=" + this.data.highlightedText);
      this.data.fallbackAudio.addEventListener("error", function(evt) {
        alert("Sorry, we cannot produce speech right now. Try upgrading your Chrome browser!");
      })
      this.data.fallbackAudio.play();
      this.data.fallbackAudio.onended = function() {
        pageToSpeech.data.speechInProgress = false;
      }
    
    },
    addHotkeys: function() {
      var activeKeys = [];
      onkeydown = onkeyup = function(evt) {
        var e = evt || event;
        activeKeys[e.keyCode] = e.type == 'keydown';
        if (activeKeys[16] && activeKeys[17]  && activeKeys[89]) {  //key 16 = SHIFT, 17 = CTRL, 89 = Y
          pageToSpeech.initialize();
        }
      };
    }
  
  
  };
  
  chrome.extension.onMessage.addListener(function(msg, sender, sendResponse) {
  
    if (msg.action == 'pageToSpeech') {
      pageToSpeech.initialize();
  
    }
  });
  pageToSpeech.addHotkeys();
  
  
  