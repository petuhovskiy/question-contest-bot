module.exports =  msg =>
    msg.split('\n')
        .map(it => it.trim())
        .join('\n')