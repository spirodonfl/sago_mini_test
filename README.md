# Getting Started

You will want to make to sure you've installed angular CLI: "npm install -g @angular/cli".

This gives you the ability to run "ng" commands in your shell.

Make sure you've installed MongoDB from https://www.mongodb.com/download-center.

## What I used / did && stuff that makes me cringe

I went with es5 code just cause it was faster for me. With typescript (which I ended up not using) I could have targeted es6 (or just written plain es6).

The nested callbacks are very cringeworthy but it's a quick and dirty way to prove the functionality is good. Can fix it.

## Managing the server

The server manages both the API and also the public HTML served to manipulate data with the API. Use the commands below, pretty self-explanatory.

"npm run-script start_server"

"npm run-script restart_server"

"npm run-script stop_server"

"npm run-script view_server_logs" -- This one is for viewing the console output while it's running

## Running MongoDB

Run MongoDB using the recommended solution for your particular OS. The DB data can live under the "data" folder of this project (or wherever you like).

For example, I run this: '"C:\Program Files\MongoDB\Server\3.6\bin\mongod.exe" --dbpath "X:\sago_mini_test\data"'

## Building from SCSS to CSS

/public/scss/styles.scss is the scss file that gets compiled into /public/css/styles.css when you run "npm run-script build_css" using node-sass to do it. Make a change, build it, you're good to go.

## Using the bundle app

The UI is very straightforward (I'm not a UI guy) and it should allow you to auto-create bundles if you're using BUMP or SET calls and then search for bundles to see if they exist or not.

## Typescript

I was going to originally use typescript because I LOVE it but I decided not to. I might return to it.