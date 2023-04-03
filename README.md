# GeoXO CLI

source .env
aws codeartifact login --tool npm --domain $CA_DOMAIN --domain-owner $AWS_ACCOUNT --repository $CA_REPO

## Commands
geoxo login --profile dcs|lzssc

## GRB Demo
### Publish notification
geoxo topic publish --topic grb.G17.EXIS --file ./tests/grb.exis.json

### Subscribe to Notification
geoxo topic subscribe --topic grb.G17.EXIS

### Get the data
geoxo grb get bafkreicqpzyvxwqvekgjrz44i4oghdyn7titagqpfrszswnhnydvdlz2wq

##
geoxo grb list --query instrument:EXIS --limit 2 --fields all
geoxo grb get bafkreicznt2fr23d5vjgkbuxkfstiryfzpmm2tytz7nvqc7urginwuolnu

geoxo grb list --query satellite:G17,instrument:EXIS --limit 10 --fields all \
    --from 2022-12-25T00:06:30-05:00 \
    --to 2022-12-25T00:09:05-05:00

geoxo grb sql 'list cid,dsn,eventTime where dsn is RadF since last 20 minutes'

geoxo topic list --limit 1000
geoxo topic list --limit 1000 --filter G16 

geoxo topic publish --topic dcs.test --value bafkreifvtow6swmydnq7tezubkz5e2634eorltn4xbrd7o7hwjq4jpxvby
geoxo topic publish --topic dcs.goes --file ./tests/goes_dcp.json
geoxo topic publish --topic dcs.iridium --file ./tests/iridium_dcp.json

geoxo topic subscribe --topic dcs.goes

geoxo lzssc get <CID> ./here
geoxo lzssc get <CID> ./here

geoxo grb list <CID> ./here
geoxo grb get <CID> ./here

## DCS DEMO 
source .env
geoxo login --profile dcs

geoxo topic list --limit 1000
geoxo topic subscribe --topic dcs.goes

### Pick a platformID and/or CID and replace in following examples

geoxo dcs get bafkreifvgjxlicpvdbhxrmgphxhr3onkewa7hjyav3nvmtppmylmew2a2y --meta
geoxo dcs get bafkreifvgjxlicpvdbhxrmgphxhr3onkewa7hjyav3nvmtppmylmew2a2y -d 1
geoxo dcs get bafkreifvgjxlicpvdbhxrmgphxhr3onkewa7hjyav3nvmtppmylmew2a2y --class s3 -d 1
geoxo dcs get bafkreifvgjxlicpvdbhxrmgphxhr3onkewa7hjyav3nvmtppmylmew2a2y --class cf -d 1

geoxo dcs list --query sat:goes,platformId:4565D704 --fields cid,sat --limit 10
geoxo dcs list --query platformId:CE44B7BA --fields all --limit 1

geoxo dcs sql 'list last ten goes records with platform=335915D0 since yesterday'


