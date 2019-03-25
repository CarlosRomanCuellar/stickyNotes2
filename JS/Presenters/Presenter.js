function Presenter(){
    const colorRotation = {
        red: 'blue',
        blue: 'green',
        green: 'black',
        black: 'grey',
        grey: 'red'
    };

    //from view to model
    pubsub.subscribe( 'callInfo' , callInfoFromPresenter)
    pubsub.subscribe('changeTextInView' , changeTextInPresenter);
    pubsub.subscribe('changeColorNote', changeColorNote);
    pubsub.subscribe('tabInText' , tabInText);
    pubsub.subscribe('addNewNote' , addNewNote);
    pubsub.subscribe('noteDeleted',deleteFromModel);
    pubsub.subscribe('showHistory', addDeadNotes);
    pubsub.subscribe('UnDo' , rollBack);
    pubsub.subscribe('newOrder', reorganize);
    

    var notes = [];
    var deadNotes = [];
    var oldActives = [], oldHistorical = [];
    

    function deleteFromModel (ev) {
        
        const target = ev.target;
        
        if (!target.classList.contains('deleteBtn')) return;
        
        const domNote = target.closest('.note');

        const idx = notes.findIndex(function (n) { 
            return n.id == domNote.id });//
        if (idx != -1) {
            oldHistorical.push(deadNotes);
            deadNotes.push(notes[idx])
            pubsub.publish('changeModel', deadNotes , 'notesInHistory')
            notes.splice(idx,1);
            domNote.remove();
            pubsub.publish('changeModel', notes , 'notesInMemory')
        }
    }

    function addNewNote(container) {
        let date = new Date;
        let fullDateString = 'Created: ' + date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();//+1 because its start in 0       
        let note = {
            id: date.getTime(),
            titleText: '',
            noteText: '',
            creationDate: fullDateString,
            modify: '',
            barColor: 'grey'
        }
        //const notes = getModel('notesInMemory');
        notes.push(note);
        let noteToBeAdded = NoteFactory(template, note, 'alive')
        
        container.appendChild(noteToBeAdded);
        pubsub.publish('changeModel', notes , 'notesInMemory')
    }

    function addDeadNotes(container){
        for( let i = 0; i < deadNotes.length; i++){
            console.log()
            container.appendChild(NoteFactory(template, deadNotes[i], 'dead'));
        }
    }

    function tabInText(ev) {
        const target = ev.target;
        if (!target.classList.contains('text')) return;
        if (ev.keyCode == 9 || ev.which == 9) {
            ev.preventDefault();
            var start = target.selectionStart;
            var end = target.selectionEnd;
            target.value = target.value.substring(0, start) + "\t" + target.value.substring(end);
            target.selectionEnd = start + 1;
        }
    }

    function changeTextInPresenter(ev){
        const target = ev.target;
        let action = getAction(target.classList);
        if (action) {
            const domNote = target.closest('.note');
            const note = notes.find(function (n) { return n.id == domNote.id });
            if (note) {                
                let today = new Date;
                note.modify = 'last modify: ' + 
                                today.getDate() + '/' + 
                                (today.getMonth()+1) + '/' + 
                                today.getFullYear() + ' ' + 
                                today.getHours() + ':' + 
                                today.getMinutes() + ':' + 
                                today.getSeconds();
                action(note, target);
                const modifyLbl = domNote.querySelector('.modify')
                modifyLbl.innerText = note.modify;
                pubsub.publish('changeModel', notes , 'notesInMemory')
            }
        }

    }

    function getAction(classList) {
        if (classList.contains('text')) return setNoteText;
        if (classList.contains('noteTitle')) return setTitle;
    }

    function setTitle(note, el) {
        note.titleText = el.value;
    }

    function setNoteText(note, el) {
        note.noteText = el.value;
    }

    function callInfoFromPresenter(name){
        pubsub.publish('callInfoFromPresenter', name)
    }

    function changeColorNote(ev){
        const target = ev.target;
        if (!target.classList.contains('colorBtn')) return;
        const bar = target.closest('.noteBar');
        const domNote = target.closest('.note');

        const note = notes.find(function (n) { return n.id == domNote.id });

        if (bar && note) {
            note.barColor = colorRotation[note.barColor] || 'red';
            bar.style.backgroundColor = note.barColor;
        }
        pubsub.publish('changeModel', notes , 'notesInMemory')
    }

    function rollBack(){

        var activeAgain = oldActives.pop();
        var historicalAgain = oldHistorical.pop();
        if(activeAgain == undefined) return
        //console.log(activeAgain)
        //historicalAgain = oldHistorical.pop()
        //pubsub.publish('changeModel', deadNotes , 'notesInHistory')
        pubsub.publish('setOldActives', activeAgain , 'notesInMemory')
        pubsub.publish('setOldActives', historicalAgain, 'notesInHistory')
        pubsub.publish('update', notes)
    }

    function reorganize(noteMoving, noteEnd){
        var arrayOfNotes = notes;
        // console.log(arrayOfNotes)
        // console.log(noteMoving)
        var auxArray = [];
        var wanted;
        while(arrayOfNotes.length > 0){
            if( arrayOfNotes[0].id == noteMoving){
                wanted = arrayOfNotes.shift();
                console.log('found')
            }
            else if(notes[0].id != noteMoving) {
                auxArray.push(arrayOfNotes.shift());
            }
        }
        while(auxArray.length > 0){
            if(auxArray[0].id == noteEnd){
                arrayOfNotes.push(auxArray.shift());
                arrayOfNotes.push(wanted);
            }
            else{
                arrayOfNotes.push(auxArray.shift());
            }
        }
        notes = arrayOfNotes;
        pubsub.publish('changeModel', notes , 'notesInMemory')
        pubsub.publish('update', notes)
        
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //from model to view
    pubsub.subscribe('showModel' , modelgotten);
    pubsub.subscribe('newOldModel' , storeOldModel); 
    
    function modelgotten(model , name){
        if(name == 'notesInMemory'){
            notes = model;
        }
        else if(name == 'notesInHistory') {
            deadNotes = model;
        }
        pubsub.publish('modelFromPresenter', model, name)
        //console.log(model)
    }

    function storeOldModel(model , name){
        if(model == '') model = '[]'
        if(name == 'notesInMemory'){
            oldActives.push(model)
            
            while(oldActives.length > 4){
                oldActives.shift();
            }
        }

        else if(name == 'notesInHistory') {
            oldHistorical.push(model)

            while(oldHistorical.length > 4){
                oldHistorical.shift();
            }
           
        }
    }
};