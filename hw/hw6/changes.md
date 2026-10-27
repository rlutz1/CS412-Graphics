# some thoughts to changing the api/architecture

there are the static changes that this node should do to itself every time on render.

there are also some of those static changes that this node should define as its transformation of further nodes to be connected to it "visually". 

right now i have 
+ static transforms -> my changes to be what i look like wrt to origin
+ dynamic transforms -> changing movements to do before leaving the origin.
+ joint transforms -> a transform to change the origin before the dynamic transform occurs

problems with the above design:
+ joint transforms doesn't carry through to the children BUT it does affect the chain of transformations and is not undone before the dynamic, statics... 


don't love the json control. needs to be more dynamic for frontend changes