/* Import Express into this module.
	When using the require method, depending on how the target module is implemented,
	the require method may return an object or a method.
	In this case, the express variable is an object */
var express = require('express');

/* The express module exposes a method called Router,
which we call to get access to the router object in Express. */
var router = express.Router();

/* Use the router to define endpoints for the application.
	These are the endpoints where the app receive requests.
	Each endpoint will be associated with a route handler,
	which is responsible for handling a request that is received in that endpoint.
	In this case, ‘/’ represents the root of the site or the home page.
	The second argument is the route handler. */
router.get('/', function(req, res, next) {
  // Render the index view, which is defined in views > index.pug
  res.render('index', { title: 'Express' });
});

/* In Express, all route handlers have the same signature.
	The first parameter is the request object, the second is the response,
	and the third references the next handler in the chain.
	Express uses middleware functions that are chained together.
	When building middleware with Express,
	sometimes you may want to call the next middleware function in the chain.
	You can use the next variable for that. */

module.exports = router;
