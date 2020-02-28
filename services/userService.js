class UserObserver{
    constructor(userId){
        this.userId = userId
    }

    getUpdateFromPublisher(updatemessage ){
     console.log(updatemessage );
     
    }

    startLiveStream(updateMessage){
        console.log(updateMessage)
    }

    sendAdminNotification(notificationMessage){
        console.log(notificationMessage);
    }
}

exports.UserObserver = UserObserver 