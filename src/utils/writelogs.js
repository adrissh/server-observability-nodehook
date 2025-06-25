const path = require("path")
const fs = require("fs")

function getTimestamp() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
}



const writeLog = (message,level)=>{
    const timestamp = getTimestamp()
    const logMessage = `[${timestamp}] [${level}] [${message}]\n`
    const logFile = path.join(__dirname, '../logs/telegram-alert-failures.log');
    try{
        fs.appendFileSync(logFile,logMessage)
    }catch(error){
        console.log(error)
    }
}

module.exports = writeLog
