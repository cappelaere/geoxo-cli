
const arr = [
    {
        cid: 'bafkreicivgyzgukxmimd26o7x7fze6xt6ho6skpaq2zhr62horbckk4z4m',
        class: 'r2',
        account: 'c3a8e4d9b77c4634c84ae4dbf6d8429f',
        bucket: 'geocloud-dcs',
        key: 'dcs/goes/2023/077/4565D704/dcs_goes_4565D704_20230318013602.br',
        size: 548,
        mtime: 1679103362897,
        type: 'application/json',
        id: '2-Jc8oYB1oUJTzJgB6ld'
    },
    {
        cid: 'bafkreicivgyzgukxmimd26o7x7fze6xt6ho6skpaq2zhr62horbckk4z4m',
        class: 's3',
        account: '938337067586',
        bucket: 'dcsprototype',
        key: 'dcs/goes/2023/077/4565D704/dcs_goes_4565D704_20230318013602.br',
        size: 548,
        mtime: 1679103362957,
        type: 'application/json',
        id: 'qftc8oYB0RkJlAj5B8ua'
    }
]

const els = arr.filter(el => {
    return (el.class == 's3')
})
let s3 = Object.assign({}, els[0])
s3.class = 'cf'

arr.push(s3)
console.log(arr)
