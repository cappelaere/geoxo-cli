const { jwtVerifier1, jwtVerifier2, jwtVerifier3 } = require('./jwt.js')

const test = async () => {
    const authConfig = require('./config.json')
    // console.log(authConfig)

    const tokens = require('./.geoxo.json')
    console.log(tokens)

    // const user1 = await jwtVerifier1(tokens.id_token)
    // console.log(user1)
    const user2 = await jwtVerifier2(tokens.id_token)
    console.log(user2)


    const tok = await jwtVerifier1(tokens.auth_token)
    console.log(tok)
}

test()


