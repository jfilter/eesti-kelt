# English to Estonian Dictionary

## Why?

The Estonian language is spoken by only about one million people worldwide. Thus, the number of online language recourses are limited. There are online dictionaries such as Google Translate, but they are not catered for the peculiarities of the Estonian languages. For instance, only one form of the noun is given instead of the essential three forms: the singular nominative, singular genitive, and singular partitive.

In this dictionary, you can search for an English term and obtain the corresponding Estonian terms enriched with information about their cases. It is, unfortunately, not possible to get the declensions right away. You have to infer them from the displayed notes and rules delivered by the Eesti Keele Institue (EKI
, The Institue of the Estonian Language). This dictionary combines two of their web services:

* The [[IES] English-Estonian MT dictionary](http://www.eki.ee/dict/ies/index.cgi) and
* the [[ÕS] Eesti õigekeelsussõnaraamat ÕS 2013](http://www.eki.ee/dict/qs/index.cgi).

So in essence, it first translates the word via [IES] and and then looks up the Estonian terms on [ÕS].

I am grateful for any contribution, feedback or bug report.

## Run

* install [Node](https://nodejs.org/en/)

### Frontend

* install the building tool [Brunch](http://brunch.io)
* `cd frontend`
* `npm install`
* `npm start` to compile and start a development server
* before going in production, change the server address in the `scripts` section in the `package.json`

### Backend

* `cd backend`
* `npm install`
* `npm start` to run a start a development server
* you may have to check change the port in the `index.js`

### Deployment

To go into production, you can make sense of it by taking a look at my deployment script. Change the `xx` and make sure that you able to login to your server via ssh. I use [pm2](https://github.com/Unitech/pm2) to deploy the backend.
```
#!/bin/bash

BACKEND_URL=xx@xx.xx
BACKEND_FOLDER=/xx/xx
BACKEND_REMOTE_LOCATION=$BACKEND_URL:$BACKEND_FOLDER

FRONTEND_REMOTE_LOCATION=xx@xx.xx:/xx/xx

if [ "$1" = "--frontend" ]
then
  cd frontend
  rm -rf public/
  npm run build
  rsync --recursive --verbose --delete public/ $FRONTEND_REMOTE_LOCATION
  cd ..
fi

if [ "$1" = "--backend" ]
then
  cd backend
  rm -rf build/
  npm run build
  cp package.json build
  rsync --recursive --verbose --delete build/ $BACKEND_REMOTE_LOCATION
  ssh $BACKEND_URL "cd $BACKEND_FOLDER && npm install --verbose && pm2 restart all"
fi
```

