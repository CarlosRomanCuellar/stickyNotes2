function Model(){
    pubsub.subscribe('callInfoFromPresenter', getModel);
    pubsub.subscribe('changeModel' , saveModel)
    pubsub.subscribe('setOldActives', setOldModel)

    function saveModel( objList , itemName ){
        //console.log(objList)
        var old = localStorage.getItem(itemName) || [];
        pubsub.publish('newOldModel', old , itemName)
        localStorage.setItem( itemName , JSON.stringify(objList));
        //console.log(localStorage.getItem(itemName))
        getModel(itemName);
    }

    function setOldModel( objList , itemName ){
        localStorage.setItem( itemName , objList);
        getModel(itemName);
    }

    function getModel(modelName){
        let model = localStorage.getItem(modelName) || '[]';
        try{
            pubsub.publish('showModel', JSON.parse(model) , modelName);
            
        } catch {
            localStorage.setItem(modelName, JSON.stringify([]));
            pubsub.publish('showModel', [] , modelName);
        }
    }

}