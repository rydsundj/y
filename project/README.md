
Make sure the sufficient modules are installed:
npm install

Make sure that you have the correct versions of all needed programs seen in package.json

Start mongodb:
sudo systemctl start mongod

Start server:
npm start

You should now see something like this:
> server@1.0.0 start
> node server.mjs

Server running on port 3005
MongoDB connected

----------------------------------------------------------
Now we want to start the react nextjs website.
Do this with the following command when inside project/y
npm run dev

You should now see something like this: 
> y@0.1.0 dev
> next dev

  ▲ Next.js 14.2.14
  - Local:        http://localhost:3000

 ✓ Starting...
 ✓ Ready in 1449ms


Enter the URL shown. 

You can now try out all the features on the website by registering one or more users, searching users, posting etc.

If you wish to view the content of the local mongo database, start the mongoshell with the following command:
mongosh

then do:
use y_db

Then to see the users: 
db.users.find({ }).pretty()

To see all posts:
db.messages.find({ }).pretty()

