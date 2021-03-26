# MakeUsPickService
Make Us Pick is a Tinder style application but with restaurants that gives two people a list of restaurants near them that looks to match the restaurants that they both agree on.

This is the service portion of the app.  This runs on nodejs&expressjs along with using redis as a memory store. Currently the syncing of two users uses polling which isnt efficient.  This will likely be changed to using websockets, or this will be deprecated entirely for a serverless solution like firebase.
