# Getting Started

You will want to make to sure you've installed angular CLI: "npm install -g @angular/cli".

This gives you the ability to run "ng" commands in your shell.

Make sure you've installed MongoDB from https://www.mongodb.com/download-center.

## Managing the server

The server manages both the API and also the public HTML served to manipulate data with the API

"npm run-script start_server" etc...

## Running MongoDB

Run MongoDB using the recommended solution for your particular OS. The DB data can live under the "data" folder of this project (or wherever you like).

For example, I run this: '"C:\Program Files\MongoDB\Server\3.6\bin\mongod.exe" --dbpath "X:\sago_mini_test\data"'

## Building from SCSS to CSS

/public/scss/styles.scss is the scss file that gets compiled into /public/css/styles.css when you run "npm run-script build_css" using node-sass to do it

## Using the bundle app

You can set or bump or just search for a bundle

## Typescript

I was going to originally use typescript because I LOVE it but I decided not to. I might return to it.