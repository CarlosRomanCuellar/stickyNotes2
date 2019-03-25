function View(){ 
    //cache DOM
    container = document.getElementById('container');
    template = document.getElementById('template').content;
    const searchTextBox = document.getElementById('search-tbx');
    const searchButton = document.getElementById('search-btn');
    const unDoButton = document.getElementById('undoBtn');
    const btnShow = document.getElementById('showBtn');
    const btnAdd = document.getElementById('addBtn');
    const btnShowHistory = document.getElementById('historicalBtn');

    //auxiliars
    let historicalIsShowing = false;
    let notesAlive = 0;
    var textSearched = '';
    var notes;
    var noteDraged , noteTarget;

    //to listen presenter events or events from others
    pubsub.subscribe('presenterChange', getActiveInfo)
    pubsub.subscribe('modelFromPresenter',loadInfo)
    pubsub.subscribe('update',update)

    //clean all but keep the info to render again
    function update(notesPresenter){ 
        destroy();
        notes = notesPresenter
        const frag = document.createDocumentFragment();
        for (let i = 0; i < notes.length; i++) {
            frag.appendChild(addNote( notes[i], 'alive'));
            //for each one we add to the count of notes
            addNoteToCount();
        }
        container.append(frag);
        var containerChilds = container.children;
        drag(containerChilds)
    }

    //get info that is currently active
    function getActiveInfo(){ 
        pubsub.publish('callInfo','notesInMemory') 
    }

    //get info that has been deleted in some
    function getHistorical(){
        pubsub.publish('callInfo','notesInHistory') 
    }

    function loadInfo(modelFromPresenter , name){ 
        //console.log(modelFromPresenter)
        if(name == 'notesInMemory'){
            notes = modelFromPresenter;
        }
        else if(name == 'notesInHistory'){
            // deadNotes = modelFromPresenter;
        }
        
    }

    //bind events
    bindEvents();
    function addAndDisplayNote(){
        pubsub.publish('addNewNote' , container);
        addNoteToCount();
    }

    function bindEvents(){
        //btnAdd.on('click',addNote)
        btnAdd.addEventListener('click',addAndDisplayNote, false)
        container.addEventListener('click', deleteHandler, false);
        container.addEventListener('click', changeColor, false);
        container.addEventListener('click', hideHandler, false);
        container.addEventListener('change', changeText, false);
        container.addEventListener('keydown', tabHandler, false);
        //container.addEventListener('')

        
        document.onkeydown = ctrlZ;

        searchButton.addEventListener('click',function () {
            searchInNotes(container,textSearched); 
        });
                    
        searchTextBox.addEventListener('keyup',function(ev){

            textSearched = searchTextBox.value;
            if(textSearched == ''){
                showHiddenNotes(container);
            }
            
            if (ev.keyCode == 13 || ev.which == 13) {
                searchInNotes(container,textSearched);
            }
        });

        btnShow.addEventListener('click', function () {
            showHiddenNotes(container);
        });

        btnShowHistory.addEventListener('click', function () {
            if(!historicalIsShowing){
                pubsub.publish('showHistory', container)
                histocalDisplay();
            }
            else{
                histocalDisplay();
                render();
            }
        });

        unDoButton.addEventListener('click',function(ev){
            pubsub.publish('UnDo');
        });

    }

    

    function searchInNotes(container,textFromBox){
        if(textFromBox == '')return;
    
        var regExpToTest = new RegExp(textFromBox,'ig'); 
    
        let notes = container.getElementsByClassName('note')
        //console.log(textFromBox)
        for(let i=0 ; i <  notes.length; i++){
            const note = container.children[i]
            const noteBar = note.children[0];
            const noteTitle = noteBar.children[0];
            const noteContent = note.children[1].children[0];
            let foundInTitle = regExpToTest.test(noteTitle.value);
            let foundInContent = regExpToTest.test(noteContent.value);
            if(!foundInTitle && !foundInContent){
                note.style.display = 'none';
            }
            else{
                note.style.display = 'flex';
                note.style.flexDirection = 'column';
            }
        }
    }

    function showHiddenNotes(container){
        let notes = container.getElementsByClassName('note')
        for (let i = 0; i < notes.length; i++) {
            notes[i].style.display = 'flex';
            notes[i].style.flexDirection = 'column';
        }
    }

    function deleteHandler(ev){
        pubsub.publish('noteDeleted', ev);
        minusNoteToCount();
        //render();
    }

    function hideHandler(ev) {
        const target = ev.target;
        if (!target.classList.contains('hideBtn')) return;
        const domNote = target.closest('.note');
        if (domNote) {
            domNote.style.display = 'none';
        }
    }

    function changeColor(ev){
        pubsub.publish('changeColorNote', ev)
    }

    function addNote(note, status){
        return NoteFactory(template , note, status);
    }

    function changeText(ev){
        pubsub.publish('changeTextInView', ev)
        render();
    }

    function tabHandler(ev) {
        pubsub.publish('tabInText', ev)
    }

    function ctrlZ(ev){
        
        var evtobj = window.event? event : ev
        if (evtobj.keyCode == 90 && evtobj.ctrlKey) pubsub.publish('UnDo');
    }

    //display
    
    function render(){
        //destroy the whole container content
        destroy();
        //get the notesInMemory item from localstorage by telling the presenter and this one tell the model 
        getActiveInfo();
        getHistorical();
        const frag = document.createDocumentFragment();
        for (let i = 0; i < notes.length; i++) {
            frag.appendChild(addNote( notes[i], 'alive'));
            //for each one we add to the count of notes
            addNoteToCount();
        }
        container.append(frag);
        var containerChilds = container.children;
        drag(containerChilds)
    }

    function destroy(){
        while(container.children[0] != undefined){
            container.children[0].remove();
        }
        notes = [];
        notesAlive = 0;
        // deadNotes = [];
    }

    function addNoteToCount (){ notesAlive = notesAlive + 1 }

    function minusNoteToCount(){ this.notesAlive = notesAlive - 1 }

    function histocalDisplay(){ return historicalIsShowing = !historicalIsShowing }

    function drag(notesToDrag){
        for(let i = 0; i<notesToDrag.length; i++){
            //console.log(notesToDrag)
            const note = notesToDrag[i];

            note.addEventListener('drag',function(ev){
                if(noteDraged != ev.target.closest('.note').id){
                    noteDraged = ev.target.closest('.note').id
                    console.log(noteDraged)
                }
            });
            note.addEventListener('drop',function(ev){
                ev.preventDefault();
                //console.log(note)
                const target = ev.target;
                parent = target.parentElement;
                grandpa = parent.parentElement;
                if( target.classList.contains('note') || parent.classList.contains('note') || grandpa.classList.contains('note') ){
                    noteTarget = target.closest('.note').id
                    if(noteDraged != noteTarget)
                        pubsub.publish('newOrder',noteDraged,noteTarget);
                    //console.log(noteTarget);
                    target.style.opacity = 1;
                }
            })
    
            note.addEventListener('dragover',function(ev){ev.preventDefault()});

            note.addEventListener('dragenter',function(ev){
                const target = ev.target.closest('.note');
                ev.preventDefault();
                target.style.opacity = .7;
            })
    
            note.addEventListener('dragleave',function(ev){
                const target = ev.target;
                target.style.opacity = 1;
            })
        }
    }

    return{
        notesAlive:notesAlive,
        render:render
    }
}