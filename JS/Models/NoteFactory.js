function NoteFactory(template, note, status) {
    let docFragment = template.cloneNode(true);
        let fullNote = docFragment.querySelector('.note');
        let title = docFragment.querySelector('.noteTitle'); // input of the note
        let text = docFragment.querySelector('.text'); // textarea of the note
        let whenCreated = docFragment.querySelector('.create'); // label date of creation
        let lastModify = docFragment.querySelector('.modify'); // label last modify

        //give initial values 
        title.value = note.titleText;
        text.value = note.noteText;
        whenCreated.innerText = note.creationDate;
        lastModify.innerText = note.modify;
        fullNote.id = note.id;

        //the note will be active and must have events
        if (status == 'alive') {
            let noteBarToChange = docFragment.querySelector('.noteBar');
            noteBarToChange.style.backgroundColor = note.barColor;
        }        
        else { //the note has been deleted and just need to be display
               //change the opacity and make the note content to be only read
            fullNote.style.opacity = 0.5;
            title.readOnly = true;
            text.readOnly = true;
            fullNote.readOnly = true;
        }
        
        return docFragment;
}