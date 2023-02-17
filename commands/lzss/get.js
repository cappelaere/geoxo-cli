
const get = async (id, options) => {
    console.log("Getting DCP " + id)
    await new Promise(resolve => setTimeout(resolve, 3000))
}
module.exports.get = get
