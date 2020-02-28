
const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const appConfig = require('./app_setting.json')

const socketio = require('socket.io');

var liveservice = require('./services/liveservice')
var Live = require('./models/live');

const homeRoute = require('./routes/homeroute')
const authRoute = require('./routes/authroute');
const videoRoute = require('./routes/videoroute');
const liveRoute = require('./routes/liveroute');
const channelRoute = require('./routes/channelroute');


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'POST , GET , PUT , DELETE , PATCH')
    next();
})
app.use(express.static(path.join(__dirname, 'public')))

app.use(bodyParser.json());



app.use('/', homeRoute);
app.use('/auth', authRoute);
app.use('/channel', channelRoute);
app.use('/video', videoRoute);
app.use('/live', liveRoute)

app.use(passport.initialize())



// Error handler 

app.use((error, req, res, next) => {
    console.log(error);
    res.status(500).json(error);
})

mongoose.connect(appConfig.Db.uri, { useNewUrlParser: true }).then(result => {

    var httpServer = app.listen(process.env.PORT || 3000)
    httpServer.timeout = 12000000;
    
    const io = socketio(httpServer);
    io.on('connection', socket => {
        var service = new liveservice();
        
        socket.on('joinliveroom', roomName => {
            service.joinToLiveRoom(io, socket, roomName);
        })

        socket.on('chat' , data =>{
           service.sendChat(io , socket , data);
        })

        socket.on('chatdatafromclient' , chatData=>{
           service.sendAndReceiveChat(io , socket , chatData);
        })

        socket.on('leaveliveroom' , roomName =>{
            service.leaveRoom(io , socket , roomName)
        })

        socket.on('getliveroommembersnumber' , roomName=>{
            service.getLiveroomoMembers(io , roomName)
        })


    })



}).catch(error => {
    console.log(error);
})

