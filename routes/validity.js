var hash = require('object-hash');
var secret = 'PASSWORD';

// Take a string and output string of name:H(name)
exports.hashName = function(str) {
	return str + ":" + hash(secret + str);
};

exports.hashPassword = function(str) {
	return hash(secret+str);
};

// Return true if a name equals H(name)
exports.validateCookieName = function(str, strhash) {
	return hash(secret + str) == strhash;
};

// Return true if there is a cookie with name present, which matches salted hash
exports.loggedIn = function(cookies) {
	// Get the visitor name set in the cookie (of format 'name:hash(secret+name)')
	let fullname = cookies.name;
	if (fullname) {
		let name = fullname.split(":")[0];
		// namehash is 'hash(secret+name)'
		let namehash = fullname.split(":")[1];

		//  if cookie is present and matches hash, return true
		if (this.validateCookieName(name, namehash)) {
			return true;
		} else {
			return false;
		}
	} else {
		return false;
	}
}



//------FORM VALIDATION-----------

var usernameErr = "";
var passwordErr = "";
var verifyErr = "";
var emailErr = "";

// Returns true if username is entered, and is alphanumeric
exports.validateUsername = function(username) {
	var re = /\W/;
	if (username == "") {
		exports.usernameErr = "You must have a username";
		return false;
	} else if (re.test(username)) {
		exports.usernameErr = "Only alphanumeric characters and underscore allowed.";
		return false;
	} else {
		exports.usernameErr = "";
		return true;
	}
}


// Returns true if password is entered, is at least 6 digits, and contains both a number and letter
exports.validatePassword = function(password) {
	var re = /(\d\D)|(\D\d)/;
	if (password == "") {
		exports.passwordErr = "You must enter a password";
		return false;
	} else if (!re.test(password)) {
		exports.passwordErr = "Password must contain a number and a letter";
		return false;
	} else if (password.length<6) {
		exports.passwordErr = "Password must be at least 6 digits";
		return false;
	} else {
		exports.passwordErr = "";
		return true;
	}
}

//Returns true iff string is same as password
exports.validateVerify = function(password, verification) {
	if (password == verification) {
		exports.verifyErr = "";
		return true;
	} else {
		exports.verifyErr = "You must enter the same password";
		return false;
	}
}

//Check if email is empty or valid (atm validity only checking ends with '.com' and contains @)
///// REGEX from udacity ----- Username: "^[a-zA-Z0-9_-]{3,20}$" Password: "^.{3,20}$" Email: "^[\S]+@[\S]+\.[\S]+$"
exports.validateEmail = function(email) {
	if (email == '') {
		return true;
	} else if (email.slice(-4) == '.com' && email.includes("@")) {
		return true;
	} else {
		exports.emailErr = "Email is not valid";
		return false;
	}
}